
import db from '../db/db.mjs';


class DocumentDao{

     // Get document by ID
     getDocumentById(id) {
        return new Promise((resolve, reject) => {
            const getDocumentById = 'SELECT * FROM Documents WHERE id = ?';

            db.get(getDocumentById, [id], (err, document) => {
                if (err) {
                    console.error('Database error while getting document by ID:', err.message);
                    return reject(new Error('Database error: ' + err.message));
                }
                if (!document) {
                    return reject(new Error('Document not found'));
                }
                resolve(document);
            });
        });
    }
    

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

    //add document - to be tested

    addDocument(title, stakeholders, scale, date, type, connections, language, pages, lat, lon, description) {
        return new Promise((resolve, reject) => {
            if (!title || title.trim() === "") {
                return reject(new Error('Title cannot be empty.'));
            }

            const addDocument = 'INSERT INTO Documents (title, stakeholders, scale, issuanceDate, type, connections, language, pages, lat, lon, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

            db.run(addDocument, [title, description], function (err) {
                if (err) {
                    console.error('Database error while adding document:', err.message);
                    return reject(new Error('Database error: ' + err.message));
                }

                resolve({
                    id: this.lastID,
                    title,
                    stakeholders,
                    scale,
                    date,
                    type,
                    connections,
                    language,
                    pages,
                    lat,
                    lon,
                    description,
                    message: 'Document added successfully.'
                  });
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

    //link documents
    linkDocuments(id1, id2, linkDate, linkType){
        return new Promise((resolve, reject) => {
            const linkDocuments = 'INSERT INTO DocumentsLinks (idDocument1, idDocument2, date, type) VALUES (?, ?, ?, ?)';
            db.run(linkDocuments, [id1, id2, linkDate, linkType], (err) => {
                if (err) {
                    console.error('Database error while linking documents:', err.message);
                    return reject(new Error('Database error: ' + err.message));
                }
                
                const updateConnections = 'UPDATE Documents SET connections = connections + 1 WHERE id IN (?, ?)';
                db.run(updateConnections, [id1, id2], (err) => {
                    if (err) {
                        console.error('Database error while updating connections:', err.message);
                        return reject(new Error('Database error: ' + err.message));
                    }
                    resolve({ idDocument1: id1, idDocument2: id2, date: linkDate, type: linkType });
                });
            });
        })
    }
    
}

export default DocumentDao;
