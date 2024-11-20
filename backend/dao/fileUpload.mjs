import db from '../db/db.mjs';
import fs from 'fs';

class FileUploadDao{

    addOriginalResources(documentId, files) {
        return new Promise((resolve, reject) => {
            const resources = [];
        
            files.forEach(file => {
                const filePath = file.path;
                // Read the file as a buffer
                fs.readFile(filePath, (err, fileBuffer) => {
                    if (err) {
                        console.error('Error reading file:', err.message);
                        return reject(new Error('Failed to read file'));
                    }

                    const query = `
                        INSERT INTO OriginalResources (documentId, resourceType, description, fileData)
                        VALUES (?, ?, ?, ?);
                    `;

                    db.run(query, [documentId, file.mimetype, file.originalname, fileBuffer], function (err) {
                        if (err) {
                            console.error('Error uploading file:', err.message);
                            return reject(new Error('Failed to upload file'));
                        }
                        resources.push({ resourceId: this.lastID });
                        
                        // Resolve the promise when all files have been processed
                        if (resources.length === files.length) {
                            resolve({ resourcesIds: resources });
                        }
                    });
                });
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


    deleteFile(documentId) {
        return new Promise((resolve, reject) => {
            const query = `DELETE FROM OriginalResources WHERE documentId = ?;`;
    
            db.run(query, [documentId], function (err) {
                if (err) {
                    console.error('Database error:', err.message);
                    return reject(new Error('Failed to delete file from database'));
                }
    
                if (this.changes === 0) {
                    console.warn(`No file found in the database for documentId: ${documentId}`);
                    return reject(new Error(`File not found in the database for documentId: ${documentId}`));                }
    
                resolve({ message: 'File deleted successfully from the database' });
            });
        });
    }    
    
}

export default FileUploadDao;
