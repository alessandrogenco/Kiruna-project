import db from '../db/db.mjs';

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
}

export default FileUploadDao;
