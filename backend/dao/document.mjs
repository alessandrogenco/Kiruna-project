
import db from '../db/db.mjs';


class DocumentDao{
    

    //get all documents
    getAllDocuments() {
        return new Promise((resolve, reject) => {
            const getAllDocuments = 'SELECT * FROM Documents';

            db.all(getAllDocuments, [], (err, documents) => {
                if (err) {
                    console.error('Database error while getting all documents:', err.message);
                    return reject(new Error('Database error: ' + err.message));
                }

                resolve(documents);
            });
        });
    }

    addDocumentDescription(id, title, description) {
        return new Promise((resolve, reject) => {

            if (!description || description.trim() === "") {
                return reject(new Error('Description cannot be empty.'));
            }
    
            const checkDocument = 'SELECT id, title FROM Documents WHERE id = ? AND title = ?';
    
            db.get(checkDocument, [id, title], (err, existingDocument) => {
                if (err) {
                    console.error('Database error while checking document:', err.message);
                    return reject(new Error('Database error: ' + err.message));
                }
    
                if (existingDocument) {

                    const updateDescription = `
                        UPDATE Documents 
                        SET description = ? 
                        WHERE id = ? AND title = ?
                    `;
    
                    db.run(updateDescription, [description, id, title], function (err) {
                        if (err) {
                            console.error('Database error while updating document description:', err.message);
                            return reject(new Error('Database error: ' + err.message));
                        }
    
                        resolve({
                            id: existingDocument.id,
                            title: existingDocument.title,
                            description,
                            message: 'Description updated successfully.'
                        });
                    });
                } else {
                    reject(new Error('Document not found with the provided ID and title.'));
                }
            });
        });
    }
    
}

export default DocumentDao;
