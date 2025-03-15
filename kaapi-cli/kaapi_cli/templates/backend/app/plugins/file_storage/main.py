"""
Main module for the file storage plugin
"""

import os
import uuid
import logging
from typing import Dict, List, Optional, Any, BinaryIO, Union
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, Request, BackgroundTasks
from fastapi.responses import StreamingResponse, JSONResponse
from sqlalchemy.orm import Session
from starlette.datastructures import UploadFile as StarletteUploadFile

from app.core.db import get_db
from app.core.security import get_current_user
from app.models.user import User

from .models import (
    StorageProvider, StoredFile, FileThumbnail, FileFolder,
    create_storage_provider, get_provider_instance
)
from .schemas import (
    StorageProviderCreate, StorageProviderUpdate, StorageProviderResponse,
    StoredFileCreate, StoredFileUpdate, StoredFileResponse, StoredFileDetailResponse,
    FileThumbnailResponse, FileFolderCreate, FileFolderResponse
)
from .providers import StorageProviderType, StorageException

# Router for the plugin
router = APIRouter(prefix="/file-storage", tags=["file-storage"])

logger = logging.getLogger(__name__)

# Routes for storage providers
@router.post("/providers", response_model=StorageProviderResponse)
async def create_provider(
    provider_data: StorageProviderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new storage provider configuration
    """
    try:
        provider = create_storage_provider(db, provider_data)
        return provider
    except Exception as e:
        logger.error(f"Error during storage provider creation: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/providers", response_model=List[StorageProviderResponse])
async def list_providers(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List available storage provider configurations
    """
    providers = db.query(StorageProvider).offset(skip).limit(limit).all()
    return providers

@router.get("/providers/{provider_id}", response_model=StorageProviderResponse)
async def get_provider(
    provider_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get details of a storage provider
    """
    provider = db.query(StorageProvider).filter(StorageProvider.id == provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Storage provider not found")
    return provider

@router.put("/providers/{provider_id}", response_model=StorageProviderResponse)
async def update_provider(
    provider_id: int,
    provider_data: StorageProviderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a storage provider configuration
    """
    provider = db.query(StorageProvider).filter(StorageProvider.id == provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Storage provider not found")
    
    # Mettre à jour les champs
    for field, value in provider_data.dict(exclude_unset=True).items():
        setattr(provider, field, value)
    
    try:
        db.commit()
        db.refresh(provider)
        return provider
    except Exception as e:
        db.rollback()
        logger.error(f"Error during storage provider update: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/providers/{provider_id}", response_model=dict)
async def delete_provider(
    provider_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a storage provider configuration
    """
    provider = db.query(StorageProvider).filter(StorageProvider.id == provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Storage provider not found")
    
    # Check if there are files using this provider
    file_count = db.query(StoredFile).filter(StoredFile.provider_id == provider_id).count()
    if file_count > 0:
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot delete: {file_count} files use this provider"
        )
    
    try:
        db.delete(provider)
        db.commit()
        return {"message": "Storage provider deleted successfully"}
    except Exception as e:
        db.rollback()
        logger.error(f"Error during storage provider deletion: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

# Routes for file upload and management
@router.post("/files/upload", response_model=StoredFileResponse)
async def upload_file(
    file: UploadFile = File(...),
    provider_id: int = Form(...),
    folder_path: str = Form(None),
    description: str = Form(None),
    tags: str = Form(None),
    generate_thumbnails: bool = Form(False),
    optimize_images: bool = Form(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    request: Request = None
):
    """
    Upload a file to the configured storage
    """
    # Get the provider
    provider_db = db.query(StorageProvider).filter(StorageProvider.id == provider_id).first()
    if not provider_db:
        raise HTTPException(status_code=404, detail="Storage provider not found")
    
    try:
        # Get the provider instance
        provider = get_provider_instance(provider_db, request)
        
        # Prepare the destination path
        filename = file.filename
        file_extension = os.path.splitext(filename)[1].lower() if '.' in filename else ''
        storage_path = f"{folder_path or ''}/{uuid.uuid4()}{file_extension}"
        storage_path = storage_path.replace('//', '/')  # Avoid double slashes
        if storage_path.startswith('/'):
            storage_path = storage_path[1:]  # Remove initial slash if present
        
        # Create base metadata
        metadata = {
            "original_filename": filename,
            "content_type": file.content_type or "application/octet-stream",
            "uploaded_by": str(current_user.id)
        }
        
        # Read the file content
        content = await file.read()
        
        # Create a BytesIO to store the file data
        file_data = io.BytesIO(content)
        
        # Upload the file
        file_url = provider.upload_file(
            file_data, 
            storage_path, 
            content_type=file.content_type, 
            metadata=metadata
        )
        
        # Analyze tags
        tag_list = tags.split(',') if tags else []
        tag_list = [tag.strip() for tag in tag_list if tag.strip()]
        
        # Create database record
        file_size = len(content)
        
        db_file = StoredFile(
            provider_id=provider_id,
            storage_path=storage_path,
            original_filename=filename,
            file_url=file_url,
            file_size=file_size,
            content_type=file.content_type or "application/octet-stream",
            description=description,
            tags=tag_list,
            created_by=current_user.id
        )
        
        db.add(db_file)
        db.commit()
        db.refresh(db_file)
        
        # TODO: Add asynchronous thumbnail processing and optimization if necessary
        
        return db_file
        
    except StorageException as e:
        logger.error(f"Error during storage upload: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error during storage upload: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error during storage upload: {str(e)}")
    finally:
        # Close the file
        await file.close()

@router.get("/files", response_model=List[StoredFileResponse])
async def list_files(
    provider_id: Optional[int] = None,
    folder_path: Optional[str] = None,
    content_type: Optional[str] = None,
    tags: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List stored files with optional filtering
    """
    query = db.query(StoredFile)
    
    # Apply filters
    if provider_id:
        query = query.filter(StoredFile.provider_id == provider_id)
    
    if folder_path:
        query = query.filter(StoredFile.storage_path.like(f"{folder_path}/%"))
    
    if content_type:
        query = query.filter(StoredFile.content_type.like(f"{content_type}%"))
    
    if tags:
        tag_list = [tag.strip() for tag in tags.split(',')]
        for tag in tag_list:
            query = query.filter(StoredFile.tags.contains([tag]))
    
    # Execute the query with pagination
    files = query.order_by(StoredFile.created_at.desc()).offset(skip).limit(limit).all()
    
    return files

@router.get("/files/{file_id}", response_model=StoredFileDetailResponse)
async def get_file_details(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    request: Request = None
):
    """
    Get the complete details of a stored file, including signed URLs
    """
    db_file = db.query(StoredFile).filter(StoredFile.id == file_id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Get the provider
    provider_db = db.query(StorageProvider).filter(StorageProvider.id == db_file.provider_id).first()
    if not provider_db:
        raise HTTPException(status_code=404, detail="Storage provider not found")
    
    try:
        # Get the provider instance
        provider = get_provider_instance(provider_db, request)
        
        # Get the download URL
        download_url = provider.get_file_url(db_file.storage_path, expires=3600, is_public=False)
        
        # Get the file metadata
        try:
            file_metadata = provider.get_file_metadata(db_file.storage_path)
        except:
            file_metadata = {}
        
        # Get the thumbnails
        thumbnails = db.query(FileThumbnail).filter(FileThumbnail.file_id == file_id).all()
        
        # Collect signed URLs for all thumbnails
        thumbnail_urls = {}
        for thumbnail in thumbnails:
            try:
                thumbnail_url = provider.get_file_url(
                    thumbnail.storage_path, 
                    expires=3600, 
                    is_public=True
                )
                thumbnail_urls[thumbnail.size] = {
                    "url": thumbnail_url,
                    "width": thumbnail.width,
                    "height": thumbnail.height
                }
            except Exception as e:
                logger.warning(f"Unable to obtain URL for thumbnail {thumbnail.id}: {str(e)}")
        
        # Build the detailed response
        response_data = db_file.__dict__.copy()
        response_data.update({
            "download_url": download_url,
            "metadata": file_metadata.get("metadata", {}),
            "thumbnails": thumbnail_urls,
            "last_modified": file_metadata.get("last_modified")
        })
        
        return response_data
        
    except StorageException as e:
        logger.error(f"Storage error during file details retrieval: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error during file details retrieval: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error during file details retrieval: {str(e)}")

@router.get("/files/{file_id}/download")
async def download_file(
    file_id: int,
    attachment: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    request: Request = None
):
    """
    Download a stored file
    """
    db_file = db.query(StoredFile).filter(StoredFile.id == file_id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Get the provider
    provider_db = db.query(StorageProvider).filter(StorageProvider.id == db_file.provider_id).first()
    if not provider_db:
        raise HTTPException(status_code=404, detail="Storage provider not found")
    
    try:
        # Get the provider instance
        provider = get_provider_instance(provider_db, request)
        
        # Download the file from storage
        file_data = provider.download_file(db_file.storage_path)
        
        # Prepare headers
        headers = {}
        if attachment:
            headers["Content-Disposition"] = f'attachment; filename="{db_file.original_filename}"'
        
        # Return the file data streaming
        return StreamingResponse(
            iter([file_data.getvalue()]), 
            media_type=db_file.content_type,
            headers=headers
        )
        
    except StorageException as e:
        logger.error(f"Storage error during file download: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error during file download: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error during file download: {str(e)}")

@router.delete("/files/{file_id}", response_model=dict)
async def delete_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    request: Request = None
):
    """
    Delete a stored file and its metadata
    """
    db_file = db.query(StoredFile).filter(StoredFile.id == file_id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Get the provider
    provider_db = db.query(StorageProvider).filter(StorageProvider.id == db_file.provider_id).first()
    if not provider_db:
        raise HTTPException(status_code=404, detail="Storage provider not found")
    
    try:
        # Get the provider instance
        provider = get_provider_instance(provider_db, request)
        
        # Delete all thumbnails
        thumbnails = db.query(FileThumbnail).filter(FileThumbnail.file_id == file_id).all()
        for thumbnail in thumbnails:
            # Delete the thumbnail file from storage
            try:
                provider.delete_file(thumbnail.storage_path)
            except Exception as e:
                logger.warning(f"Unable to delete thumbnail {thumbnail.id}: {str(e)}")
            
            # Delete the thumbnail record
            db.delete(thumbnail)
        
        # Delete the file from storage
        provider.delete_file(db_file.storage_path)
        
        # Delete the file record
        db.delete(db_file)
        db.commit()
        
        return {"message": "File deleted successfully"}
        
    except StorageException as e:
        db.rollback()
        logger.error(f"Storage error during file deletion: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        db.rollback()
        logger.error(f"Unexpected error during file deletion: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error during file deletion: {str(e)}")

# Implementations for folders, thumbnails, and image processing
# will be added in separate modules to maintain code readability.
