import db from '../db/db.mjs';

class fileUpload{

    addOriginalResource(documentId, resource){
        return new Promise ((resolve, reject) => {
            const query = `
                INSERT INTO OriginalResources (documentId, resourceType, resourcePath, description)
                VALUES (?,?,?,?);`

            const {resourceType, resourcePath, description} = resource;

            db.run(query, [documentId, resourceType, resourcePath, description], function(err) {

                if(err){
                    console.error('Error uploading file:', err.message);
                    return reject(new Error('Failed to upload file'));
                }
                resolve({resourceId: this.lastID})
            });
        })
    }
}

export default fileUpload;
