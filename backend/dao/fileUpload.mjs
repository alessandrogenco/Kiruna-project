import db from '../db/db.mjs';
import fs from 'fs';

class FileUploadDao{

    addOriginalResource(documentId, resource) {
        return new Promise((resolve, reject) => {
            const query = `
                INSERT INTO OriginalResources (documentId, resourceType, fileData, description)
                VALUES (?, ?, ?, ?);
            `;
            
            const { resourceType, fileData, description } = resource;

            db.run(query, [documentId, resourceType, fileData, description], function (err) {
                if (err) {
                    console.error('Error uploading file:', err.message);
                    return reject(new Error('Failed to upload file'));
                }
                resolve({ resourceId: this.lastID });
            });
        });
    }
    
    
    
    
    
    getFilesByDocumentId(documentId) {
        return new Promise((resolve, reject) => {
            const query = `SELECT description, fileData FROM OriginalResources WHERE documentId = ?;`;

            db.all(query, [documentId], (err, rows) => {
                if (err) {
                    console.error('Error fetching files:', err.message);
                    return reject(new Error('Failed to fetch files'));
                }
                
                if (rows.length > 0) {
                    const files = rows.map(row => ({
                        name: row.description, 
                        data: row.fileData.toString('base64'), 
                    }));
    
                    resolve(files);
                } else {
                    resolve([]);
                }
            });
        });
    }

    getOriginalResourceById(resourceId) {
        return new Promise((resolve, reject) => {
            const query = `SELECT fileData, description, resourceType FROM OriginalResources WHERE id = ?;`;
    
            db.get(query, [resourceId], (err, row) => {
                if (err) {
                    console.error('Error fetching file:', err.message);
                    return reject(new Error('Failed to fetch file'));
                }
                resolve(row);
            });
        });
    }


deleteFile(documentId, description) {
    return new Promise((resolve, reject) => {
        const query = `DELETE FROM OriginalResources WHERE documentId = ?;`;
        
        db.run(query, [documentId], function (err) {
            if (err) {
                console.error('Error deleting file:', err.message);
                return reject(new Error('Failed to delete file from database'));
            }

            if (this.changes === 0) {
                return reject(new Error('No file found to delete'));
            }

            const filePath = `path/to/files/${description}`;
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('Error deleting physical file:', err.message);
                    return reject(new Error('Failed to delete physical file'));
                }

                resolve({ message: 'File deleted successfully from both database and file system' });
            });
        });
    });
}

    
}

export default FileUploadDao;
