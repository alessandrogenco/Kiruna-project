
import db from '../db/db.mjs';
import { v4 as uuidv4 } from 'uuid';

function generateNumericId() {
    const timestamp = Date.now(); // Current timestamp
    const randomNum = Math.floor(Math.random() * 1000); // Random number between 0 and 999
    return `${timestamp}${randomNum}`; // Combine timestamp and random number
  }

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
            
            const id = generateNumericId(); 
            const addDocument = 'INSERT INTO Documents (id, title, stakeholders, scale, issuanceDate, type, connections, language, pages, lat, lon, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

            db.run(addDocument, [id, title, stakeholders, scale, date, type, connections, language, pages, lat, lon, description], function (err) {
                if (err) {
                    console.error('Database error while adding document:', err.message);
                    return reject(new Error('Database error: ' + err.message));
                }

                resolve({
                    id,
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
    
}

export default DocumentDao;
