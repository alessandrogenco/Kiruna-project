
import db from '../db/db.mjs';
import { v4 as uuidv4 } from 'uuid';

/*function generateNumericId() {
    const timestamp = Date.now(); // Current timestamp
    const randomNum = Math.floor(Math.random() * 1000); // Random number between 0 and 999
    return `${timestamp}${randomNum}`; // Combine timestamp and random number
  }*/

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

    //add document
    addDocument(title, stakeholders, scale, date, type, connections, language, pages, lat, lon, area, description) {
        return new Promise((resolve, reject) => {
            if (!title || title.trim() === "") {
                return reject(new Error('Title cannot be empty.'));
            }
            
            //const id = generateNumericId(); 
            const addDocument = 'INSERT INTO Documents (title, stakeholders, scale, issuanceDate, type, connections, language, pages, lat, lon, area, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

            db.run(addDocument, [title, stakeholders, scale, date, type, connections, language, pages, lat, lon, area, description], function (err) {
                if (err) {
                    console.error('Database error while adding document:', err.message);
                    return reject(new Error('Database error: ' + err.message));
                }

                resolve({
                    //id: this.lastID,
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
                    area,
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
            const checkLinkQuery = 'SELECT COUNT(*) AS count FROM DocumentsLinks WHERE (idDocument1 = ? AND idDocument2 = ?) OR (idDocument2 = ? AND idDocument1 = ?)';
            db.get(checkLinkQuery, [id1, id2, id1, id2], (err, row) => {
                if (err) {
                    console.error('Database error while checking link:', err.message);
                    return reject(new Error('Database error: ' + err.message));
                }
                if (row.count > 0) {
                    return reject(new Error('Link already exists'));
                }

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
            });
        })
    }

    getDocumentLinks(documentId) {
        return new Promise((resolve, reject) => {
            const query1 = `
            SELECT d.*, dl.date, dl.type
            FROM DocumentsLinks dl, Documents d
            WHERE dl.idDocument1 = ? AND dl.idDocument2 = d.id
            `;
        
            const query2 = `
                SELECT  d.*, dl.date, dl.type
                FROM DocumentsLinks dl, Documents d
                WHERE dl.idDocument2 = ? AND dl.idDocument1 = d.id
            `;
        
            db.all(query1, [documentId], (err, rows1) => {
                if (err) {
                    console.error('Database error while fetching document links for idDocument1:', err.message);
                    return reject(new Error('Database error: ' + err.message));
                }

                db.all(query2, [documentId], (err, rows2) => {
                    if (err) {
                        console.error('Database error while fetching document links for idDocument2:', err.message);
                        return reject(new Error('Database error: ' + err.message));
                    }

                    const combinedRows = [...rows1, ...rows2];
                    if (combinedRows.length === 0) {
                        return resolve({ message: `Document ${documentId} has no links` });
                    }
                    resolve(combinedRows);
                });
            });
        });
    }
    
    updateLink(idDocument1, idDocument2, newLinkDate, newLinkType) {
        return new Promise((resolve, reject) => {
            const checkLinkQuery = 'SELECT COUNT(*) AS count FROM DocumentsLinks WHERE (idDocument1 = ? AND idDocument2 = ?) OR (idDocument2 = ? AND idDocument1 = ?)';
            db.get(checkLinkQuery, [idDocument1, idDocument2, idDocument1, idDocument2], (err, row) => {
                if (err) {
                    console.error('Database error while checking link:', err.message);
                    return reject(new Error('Database error: ' + err.message));
                }
                if (row.count === 0) {
                    return reject(new Error('Link not found'));
                }

                const updateLinkQuery = 'UPDATE DocumentsLinks SET date = ?, type = ? WHERE (idDocument1 = ? AND idDocument2 = ?) OR (idDocument2 = ? AND idDocument1 = ?)';
                db.run(updateLinkQuery, [newLinkDate, newLinkType, idDocument1, idDocument2, idDocument1, idDocument2], (err) => {
                    if (err) {
                        console.error('Database error while updating link:', err.message);
                        return reject(new Error('Database error: ' + err.message));
                    }
                    resolve({ id1: idDocument1, id2: idDocument2, date: newLinkDate, type: newLinkType });
                });
            });
        });
    }

    /*newDocument(name, file) {
        return new Promise((resolve, reject) => {
            if (!Buffer.isBuffer(file)) {
                return reject(new Error("The 'file' field must be a Buffer object."));
            }
            const query = 'INSERT INTO Files (name, file) VALUES (?, ?)';
            db.run(query, [name, file], function(err) {
                if (err) {
                    console.error('Database error while inserting the new document:', err.message);
                    return reject(new Error('Database error: ' + err.message));
                }
                resolve({
                    message: 'Document created successfully',
                    documentId: this.lastID
                });
            });
        });
    }*/

    /*newDocument(name, file, documentDetails) {
        return new Promise((resolve, reject) => {
            if (!Buffer.isBuffer(file)) {
                return reject(new Error("The 'file' field must be a Buffer object."));
            }

            //Insert in Files table the new document
            const insertFileQuery = 'INSERT INTO Files (name, file) VALUES (?, ?)';
            db.run(insertFileQuery, [name, file], (err) => {
                if (err) {
                    console.error('Database error while inserting the new document:', err.message);
                    return reject(new Error('Database error: ' + err.message));
                }
                const fileId = this.lastID; 

                //Update Documents table (i can use addDocument method)
                const insertDocumentQuery = 'INSERT INTO Documents (title, stakeholders, scale, issuanceDate, type, connections, language, pages, lat, lon, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
                db.run(insertDocumentQuery, [
                    documentDetails.title,
                    documentDetails.stakeholders,
                    documentDetails.scale,
                    documentDetails.issuanceDate,
                    documentDetails.type,
                    documentDetails.connections,
                    documentDetails.language,
                    documentDetails.pages,
                    documentDetails.lat,
                    documentDetails.lon,
                    documentDetails.description
                ], (err) => {
                    if (err) {
                        console.error('Database error while inserting into Documents:', err.message);
                        return reject(new Error('Database error: ' + err.message));
                    }
                    const documentId = this.lastID; 
    
                    //Update DocumentsFiles table
                    const insertDocumentsFilesQuery = 'INSERT INTO DocumentsFiles (idDocument, idFile) VALUES (?, ?)';
                    db.run(insertDocumentsFilesQuery, [documentId, fileId], function(err) {
                        if (err) {
                            console.error('Database error while associating Files with Documents:', err.message);
                            return reject(new Error('Database error: ' + err.message));
                        }
                        resolve({
                            message: 'Document created successfully',
                            documentId: documentId,
                            fileId: fileId
                        });
                    });
                });
            });
        });
    }*/

    updateDocument(id, title, stakeholders, scale, issuanceDate, type, connections, language, pages, lat, lon, area, description) {
        return new Promise((resolve, reject) => {
            // Verifica che l'ID sia valido
            if (!id) {
                return reject(new Error('ID is required.'));
            }
    
            const updateDocument = `
                UPDATE Documents
                SET title = ?, stakeholders = ?, scale = ?, issuanceDate = ?, type = ?, 
                    connections = ?, language = ?, pages = ?, lat = ?, lon = ?, area = ?, description = ?
                WHERE id = ?
            `;

            db.run(updateDocument, [title, stakeholders, scale, issuanceDate, type, connections, language, pages, lat, lon, description, id], function (err) {
                if (err) {
                    console.error('Database error while updating document:', err.message);
                    return reject(new Error('Database error: ' + err.message));
                }
    
                if (this.changes === 0) {
                    // Se non ci sono modifiche (ad esempio se l'ID non esiste)
                    return reject(new Error('No document found with the provided ID.'));
                }
    
                resolve({
                    id,
                    title,
                    stakeholders,
                    scale,
                    issuanceDate,
                    type,
                    connections,
                    language,
                    pages,
                    lat,
                    lon,
                    area,
                    description,
                    message: 'Document updated successfully.'
                });
            });
        });
    }

    deleteDocumentById(id) {
        return new Promise((resolve, reject) => {
            if (!id) {
                return reject(new Error('ID cannot be empty.'));
            }
    
            const deleteDocument = 'DELETE FROM Documents WHERE id = ?';
    
            db.run(deleteDocument, [id], function(err) {
                if (err) {
                    console.error('Database error while deleting document:', err.message);
                    return reject(new Error('Database error: ' + err.message));
                }
    
                if (this.changes === 0) {
                    return reject(new Error('No document found with the provided ID'));
                }
    
                resolve({
                    id,
                    message: 'Document deleted successfully.'
                });
            });
        });
    }
        
}

export default DocumentDao;
