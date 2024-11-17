import db from '../db/db.mjs';

class fileUpload{

    addOriginalResource(documentId, resource) {
        return new Promise((resolve, reject) => {
            const query = `
                INSERT INTO OriginalResources (documentId, resourceType, fileData, description)
                VALUES (?, ?, ?, ?);`;

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
            const query = `SELECT id, resourceType, description FROM OriginalResources WHERE documentId = ?;`;

            db.all(query, [documentId], (err, rows) => {
                if (err) {
                    console.error('Error fetching files:', err.message);
                    return reject(new Error('Failed to fetch files'));
                }
                resolve(rows);
            });
        });
    }
}

export default fileUpload;
