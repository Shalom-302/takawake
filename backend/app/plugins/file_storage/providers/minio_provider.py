"""
MinIO storage provider
"""

import io
import os
import uuid
import logging
from typing import BinaryIO, Dict, List, Optional, Tuple, Union, Any
from datetime import datetime, timedelta
import mimetypes

from minio import Minio
from minio.error import S3Error
from minio.commonconfig import ComposeSource

from .base import StorageProviderInterface, StorageException


class MinioStorageProvider(StorageProviderInterface):
    """
    Implementation of StorageProviderInterface for MinIO
    """
    
    def __init__(self):
        self.client = None
        self.bucket_name = None
        self.endpoint = None
        self.logger = logging.getLogger(__name__)
    
    def initialize(self, config: Dict[str, Any]) -> None:
        """
        Initialize the MinIO client with the provided configuration
        
        Args:
            config: Dictionary containing:
                    - endpoint_url: URL of the MinIO server
                    - access_key: Access key for MinIO
                    - secret_key: Secret key for MinIO
                    - bucket_name: Name of the bucket to use
                    - region: Region (optional)
                    - secure: Use HTTPS (default: True)
        """
        try:
            self.endpoint = config['endpoint_url']
            access_key = config['access_key']
            secret_key = config['secret_key']
            self.bucket_name = config['bucket_name']
            region = config.get('region', None)
            secure = config.get('secure', True)
            
            # Remove http:// or https:// prefix from endpoint
            endpoint = self.endpoint.replace('http://', '').replace('https://', '')
            
            # Create the MinIO client
            self.client = Minio(
                endpoint=endpoint,
                access_key=access_key,
                secret_key=secret_key,
                region=region,
                secure=secure
            )
            
            # Check if the bucket exists, create if not
            if not self.client.bucket_exists(self.bucket_name):
                self.client.make_bucket(self.bucket_name)
                self.logger.info(f"Bucket {self.bucket_name} created successfully")
                
        except Exception as e:
            error_msg = f"Error initializing MinIO provider: {str(e)}"
            self.logger.error(error_msg)
            raise StorageException(error_msg)
    
    def upload_file(self, 
                   file_obj: BinaryIO, 
                   destination_path: str, 
                   content_type: str = None, 
                   metadata: Dict[str, str] = None) -> str:
        """
        Upload a file to MinIO
        
        Args:
            file_obj: File object opened in binary mode
            destination_path: Destination path in MinIO
            content_type: MIME type of the file
            metadata: Métadonnées à associer au fichier
            
        Returns:
            URL of the uploaded file
        """
        try:
            # Determine content type if not specified
            if not content_type:
                content_type, _ = mimetypes.guess_type(destination_path)
                content_type = content_type or 'application/octet-stream'
            
            # Determine file size
            file_size = file_obj.seek(0, os.SEEK_END)
            file_obj.seek(0)
            
            # Upload the file
            result = self.client.put_object(
                bucket_name=self.bucket_name,
                object_name=destination_path,
                data=file_obj,
                length=file_size,
                content_type=content_type,
                metadata=metadata
            )
            
            # Construct the access URL
            return self.get_file_url(destination_path)
            
        except Exception as e:
            error_msg = f"Error uploading file to MinIO: {str(e)}"
            self.logger.error(error_msg)
            raise StorageException(error_msg)
    
    def download_file(self, storage_path: str) -> BinaryIO:
        """
        Download a file from MinIO
        
        Args:
            storage_path: Path of the file in MinIO
            
        Returns:
            File object containing the data
        """
        try:
            response = self.client.get_object(
                bucket_name=self.bucket_name,
                object_name=storage_path
            )
            
            # Create a BytesIO object to store the data
            file_data = io.BytesIO()
            for data in response.stream(32*1024):
                file_data.write(data)
            
            # Reset the cursor to the beginning of the file
            file_data.seek(0)
            
            return file_data
            
        except Exception as e:
            error_msg = f"Error downloading file from MinIO: {str(e)}"
            self.logger.error(error_msg)
            raise StorageException(error_msg)
    
    def delete_file(self, storage_path: str) -> bool:
        """
        Delete a file from MinIO
        
        Args:
            storage_path: Path of the file in MinIO
            
        Returns:
            True if the deletion was successful, False otherwise
        """
        try:
            self.client.remove_object(
                bucket_name=self.bucket_name,
                object_name=storage_path
            )
            return True
            
        except Exception as e:
            error_msg = f"Error deleting file from MinIO: {str(e)}"
            self.logger.error(error_msg)
            return False
    
    def get_file_url(self, 
                    storage_path: str, 
                    expires: int = 3600, 
                    is_public: bool = False) -> str:
        """
        Get the access URL for a file in MinIO
        
        Args:
            storage_path: Path of the file in MinIO
            expires: Duration of validity in seconds (for temporary URLs)
            is_public: If the file is public
            
        Returns:
            Access URL for the file
        """
        try:
            if is_public:
                # For public files, we can use a direct URL if MinIO is configured for it
                # Otherwise, we end up with a presigned URL generation
                if self.endpoint.endswith('/'):
                    endpoint = self.endpoint
                else:
                    endpoint = self.endpoint + '/'
                
                return f"{endpoint}{self.bucket_name}/{storage_path}"
            else:
                # Generate a presigned URL with expiration
                return self.client.presigned_get_object(
                    bucket_name=self.bucket_name,
                    object_name=storage_path,
                    expires=expires
                )
                
        except Exception as e:
            error_msg = f"Error generating URL for file: {str(e)}"
            self.logger.error(error_msg)
            raise StorageException(error_msg)
    
    def file_exists(self, storage_path: str) -> bool:
        """
        Check if a file exists in MinIO
        
        Args:
            storage_path: Path of the file in MinIO
            
        Returns:
            True if the file exists, False otherwise
        """
        try:
            self.client.stat_object(
                bucket_name=self.bucket_name,
                object_name=storage_path
            )
            return True
            
        except Exception:
            return False
    
    def get_file_metadata(self, storage_path: str) -> Dict[str, Any]:
        """
        Get the metadata of a file in MinIO
        
        Args:
            storage_path: Path of the file in MinIO
            
        Returns:
            Dictionary containing the file metadata
        """
        try:
            stat = self.client.stat_object(
                bucket_name=self.bucket_name,
                object_name=storage_path
            )
            
            return {
                'size': stat.size,
                'last_modified': stat.last_modified,
                'etag': stat.etag,
                'metadata': stat.metadata,
                'content_type': stat.content_type
            }
            
        except Exception as e:
            error_msg = f"Error retrieving metadata: {str(e)}"
            self.logger.error(error_msg)
            raise StorageException(error_msg)
    
    def list_files(self, prefix: str = "", recursive: bool = True) -> List[Dict[str, Any]]:
        """
        List files in a MinIO directory
        
        Args:
            prefix: Prefix to filter results
            recursive: If the search should be recursive
            
        Returns:
            List of dictionaries containing file information
        """
        try:
            objects = self.client.list_objects(
                bucket_name=self.bucket_name,
                prefix=prefix,
                recursive=recursive
            )
            
            result = []
            for obj in objects:
                result.append({
                    'name': obj.object_name,
                    'size': obj.size,
                    'last_modified': obj.last_modified,
                    'etag': obj.etag,
                    'is_dir': obj.is_dir
                })
                
            return result
            
        except Exception as e:
            error_msg = f"Error listing files: {str(e)}"
            self.logger.error(error_msg)
            raise StorageException(error_msg)
    
    def update_file_metadata(self, storage_path: str, metadata: Dict[str, str]) -> bool:
        """
        Update the metadata of a file in MinIO
        Note: MinIO does not allow updating metadata directly,
        it must copy the file with the new metadata
        
        Args:
            storage_path: Path of the file in MinIO
            metadata: New metadata
            
        Returns:
            True if the update was successful, False otherwise
        """
        try:
            # Get the current metadata
            current_metadata = self.get_file_metadata(storage_path)
            
            # Create a temporary name for the copy
            temp_path = f"{storage_path}.temp-{uuid.uuid4()}"
            
            # Copy the object with the new metadata
            copy_source = ComposeSource(
                bucket_name=self.bucket_name,
                object_name=storage_path
            )
            
            # Merge the current metadata with the new metadata
            merged_metadata = {**current_metadata.get('metadata', {}), **metadata}
            
            # Copy the object with the new metadata
            self.client.copy_object(
                bucket_name=self.bucket_name,
                object_name=temp_path,
                source=copy_source,
                metadata=merged_metadata,
                metadata_directive="REPLACE"
            )
            
            # Delete the original
            self.client.remove_object(
                bucket_name=self.bucket_name,
                object_name=storage_path
            )
            
            # Rename the copy to the original name
            copy_source = ComposeSource(
                bucket_name=self.bucket_name,
                object_name=temp_path
            )
            
            self.client.copy_object(
                bucket_name=self.bucket_name,
                object_name=storage_path,
                source=copy_source
            )
            
            # Delete the temporary copy
            self.client.remove_object(
                bucket_name=self.bucket_name,
                object_name=temp_path
            )
            
            return True
            
        except Exception as e:
            error_msg = f"Error updating metadata: {str(e)}"
            self.logger.error(error_msg)
            return False
    
    def copy_file(self, source_path: str, destination_path: str) -> str:
        """
        Copy a file in MinIO
        
        Args:
            source_path: Source file path
            destination_path: Destination file path
            
        Returns:
            Access URL for the copied file
        """
        try:
            copy_source = ComposeSource(
                bucket_name=self.bucket_name,
                object_name=source_path
            )
            
            self.client.copy_object(
                bucket_name=self.bucket_name,
                object_name=destination_path,
                source=copy_source
            )
            
            return self.get_file_url(destination_path)
            
        except Exception as e:
            error_msg = f"Error copying file: {str(e)}"
            self.logger.error(error_msg)
            raise StorageException(error_msg)
    
    def move_file(self, source_path: str, destination_path: str) -> str:
        """
        Move a file in MinIO
        
        Args:
            source_path: Source file path
            destination_path: Destination file path
            
        Returns:
            Access URL for the moved file
        """
        try:
            # Copy the file first
            copy_source = ComposeSource(
                bucket_name=self.bucket_name,
                object_name=source_path
            )
            
            self.client.copy_object(
                bucket_name=self.bucket_name,
                object_name=destination_path,
                source=copy_source
            )
            
            # Then delete the original
            self.client.remove_object(
                bucket_name=self.bucket_name,
                object_name=source_path
            )
            
            return self.get_file_url(destination_path)
            
        except Exception as e:
            error_msg = f"Error moving file: {str(e)}"
            self.logger.error(error_msg)
            raise StorageException(error_msg)
