"""
Routes for managing file folders
"""

import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.db import get_db
from app.core.security import get_current_user
from app.plugins.advanced_auth.models import User

from ..models import FileFolder, StorageProvider, StoredFile
from ..schemas import FileFolderCreate, FileFolderResponse, FileFolderDetailResponse

router = APIRouter(prefix="/folders")

logger = logging.getLogger(__name__)

@router.post("", response_model=FileFolderResponse)
async def create_folder(
    folder_data: FileFolderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new file folder
    """
    # Check if a folder with the same path already exists
    existing_folder = db.query(FileFolder).filter(
        FileFolder.path == folder_data.path
    ).first()
    
    if existing_folder:
        raise HTTPException(
            status_code=400, 
            detail="A folder with this path already exists"
        )
    
    # Create the folder
    folder = FileFolder(
        name=folder_data.name,
        path=folder_data.path,
        description=folder_data.description,
        parent_folder_id=folder_data.parent_folder_id,
        created_by=current_user.id
    )
    
    try:
        db.add(folder)
        db.commit()
        db.refresh(folder)
        return folder
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating folder: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("", response_model=List[FileFolderResponse])
async def list_folders(
    parent_folder_id: Optional[int] = None,
    path_prefix: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List folders with optional filtering
    """
    query = db.query(FileFolder)
    
    # Apply filters
    if parent_folder_id is not None:
        query = query.filter(FileFolder.parent_folder_id == parent_folder_id)
    
    if path_prefix:
        query = query.filter(FileFolder.path.startswith(path_prefix))
    
    # Execute the query with pagination
    folders = query.order_by(FileFolder.path).offset(skip).limit(limit).all()
    
    return folders

@router.get("/{folder_id}", response_model=FileFolderDetailResponse)
async def get_folder_details(
    folder_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get folder details, including the number of files
    """
    folder = db.query(FileFolder).filter(FileFolder.id == folder_id).first()
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    
    # Calculate the number of files in this folder
    file_count = db.query(func.count(StoredFile.id)).filter(
        StoredFile.storage_path.startswith(folder.path + "/")
    ).scalar()
    
    # Get the direct subfolders
    subfolders = db.query(FileFolder).filter(
        FileFolder.parent_folder_id == folder_id
    ).all()
    
    # Build the response
    result = folder.__dict__.copy()
    result.update({
        "file_count": file_count or 0,
        "subfolders": [subfolder.__dict__ for subfolder in subfolders]
    })
    
    return result

@router.put("/{folder_id}", response_model=FileFolderResponse)
async def update_folder(
    folder_id: int,
    folder_data: FileFolderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a folder
    """
    folder = db.query(FileFolder).filter(FileFolder.id == folder_id).first()
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    
    # Check if another folder with the same path already exists
    existing_folder = db.query(FileFolder).filter(
        FileFolder.path == folder_data.path,
        FileFolder.id != folder_id
    ).first()
    
    if existing_folder:
        raise HTTPException(
            status_code=400, 
            detail="Another folder with this path already exists"
        )
    
    # Update the fields
    folder.name = folder_data.name
    folder.path = folder_data.path
    folder.description = folder_data.description
    folder.parent_folder_id = folder_data.parent_folder_id
    folder.updated_by = current_user.id
    
    try:
        db.commit()
        db.refresh(folder)
        return folder
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating folder: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{folder_id}", response_model=dict)
async def delete_folder(
    folder_id: int,
    force: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a folder
    
    By default, the deletion fails if the folder contains files or subfolders.
    Use force=True to delete a folder and all its contents.
    """
    folder = db.query(FileFolder).filter(FileFolder.id == folder_id).first()
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    
    # Check if there are subfolders
    subfolders_count = db.query(func.count(FileFolder.id)).filter(
        FileFolder.parent_folder_id == folder_id
    ).scalar()
    
    # Check if there are files in this folder
    files_count = db.query(func.count(StoredFile.id)).filter(
        StoredFile.storage_path.startswith(folder.path + "/")
    ).scalar()
    
    # If the folder is not empty and force=False, do not delete
    if not force and (subfolders_count > 0 or files_count > 0):
        raise HTTPException(
            status_code=400, 
            detail=f"The folder contains {subfolders_count} subfolders and {files_count} files. " 
                   f"Use force=True to delete the folder and all its contents."
        )
    
    try:
        # If force=True, also delete the subfolders
        if force and subfolders_count > 0:
            # Get all subfolders recursively
            all_subfolders = []
            
            def get_subfolder_ids(parent_id):
                subfolders = db.query(FileFolder).filter(
                    FileFolder.parent_folder_id == parent_id
                ).all()
                
                for subfolder in subfolders:
                    all_subfolders.append(subfolder.id)
                    get_subfolder_ids(subfolder.id)
            
            get_subfolder_ids(folder_id)
            
            # Delete the subfolders (from bottom to top)
            for subfolder_id in reversed(all_subfolders):
                db.query(FileFolder).filter(FileFolder.id == subfolder_id).delete()
        
        # If force=True, also delete all files in the folder
        if force and files_count > 0:
            # Note: Files in the storage are not deleted here.
            # This should be handled by a cleanup task or additional logic.
            files = db.query(StoredFile).filter(
                StoredFile.storage_path.startswith(folder.path + "/")
            ).all()
            
            for file in files:
                db.delete(file)
        
        # Delete the folder
        db.delete(folder)
        db.commit()
        
        return {
            "message": "Folder deleted successfully",
            "deleted_subfolders": subfolders_count if force else 0,
            "deleted_files": files_count if force else 0
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting folder: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
