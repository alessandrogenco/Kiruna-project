
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
            const checkAndAddStakeholders = (stakeholders) => {
                return Promise.all(stakeholders.map(stakeholder => {
                  return new Promise((resolve, reject) => {
                    const checkQuery = 'SELECT name FROM Stakeholder WHERE name = ?';
                    db.get(checkQuery, [stakeholder], (err, row) => {
                      if (err) {
                        console.error('Database error while checking stakeholders:', err.message);
                        return reject(new Error('Database error: ' + err.message));
                      }
                      if (row) {
                        resolve({ message: 'Stakeholder already exists.' });
                        console.log('Stakeholder already exists.');
                      } else {
                        const addQuery = 'INSERT INTO Stakeholder (name) VALUES (?)';
                        db.run(addQuery, [stakeholder], function (err) {
                          if (err) {
                            console.error('Database error while adding stakeholders:', err.message);
                            return reject(new Error('Database error: ' + err.message));
                          }
                          resolve({ message: 'Stakeholder added successfully.' });
                          console.log('Stakeholder added successfully.');
                        });
                      }
                    });
                  });
                }));
              };
    

    const checkAndAddScale = (scale) => {
        return new Promise((resolve, reject) => {
          const checkQuery = 'SELECT name FROM Scale WHERE name = ?';
          db.get(checkQuery, [scale], (err, row) => {
            if (err) {
              console.error('Database error while checking scales:', err.message);
              return reject(new Error('Database error: ' + err.message));
            }
            if (row) {
              resolve({ message: 'Scale already exists.' });
              console.log('Scale already exists.');
            } else {
              const addQuery = 'INSERT INTO Scale (name) VALUES (?)';
              db.run(addQuery, [scale], function (err) {
                if (err) {
                  console.error('Database error while adding scales:', err.message);
                  return reject(new Error('Database error: ' + err.message));
                }
                resolve({ message: 'Scale added successfully.' });
                console.log('Scale added successfully.');
              });
            }
          });
        });
    };

      const checkAndAddType = (type) => {
        return new Promise((resolve, reject) => {
          const checkQuery = 'SELECT name FROM DocumentType WHERE name = ?';
          db.get(checkQuery, [type], (err, row) => {
            if (err) {
              console.error('Database error while checking types:', err.message);
              return reject(new Error('Database error: ' + err.message));
            }
            if (row) {
              resolve({ message: 'DocumentType already exists.' });
              console.log('DocumentType already exists.');
            } else {
              const addQuery = 'INSERT INTO DocumentType (name) VALUES (?)';
              db.run(addQuery, [type], function (err) {
                if (err) {
                  console.error('Database error while adding types:', err.message);
                  return reject(new Error('Database error: ' + err.message));
                }
                resolve({ message: 'DocumentType added successfully.' });
                console.log('DocumentType added successfully.');
              });
            }
          });
        });
      };
            //const id = generateNumericId(); 
            Promise.all([
                checkAndAddStakeholders(stakeholders),
                checkAndAddScale(scale),
                checkAndAddType(type)
              ]).then(() => {
                const addDocumentQuery = `
                  INSERT INTO Documents (title, stakeholders, scale, issuanceDate, type, connections, language, pages, lat, lon, area, description)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;
                db.run(addDocumentQuery, [title, stakeholders, scale, date, type, connections, language, pages, lat, lon, area, description], function (err) {
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
                    area,
                    description,
                    message: 'Document added successfully.'
                  });
                });
              }).catch(reject);
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
    /*linkDocuments(id1, id2, /*linkDate,*/ /*linkType){
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

                const linkDocuments = 'INSERT INTO DocumentsLinks (idDocument1, idDocument2, type) VALUES (?, ?, ?)'; //const linkDocuments = 'INSERT INTO DocumentsLinks (idDocument1, idDocument2, date, type) VALUES (?, ?, ?, ?)';
                db.run(linkDocuments, [id1, id2, /*linkDate,*/ /*linkType], (err) => {
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
                        resolve({ idDocument1: id1, idDocument2: id2, /*date: linkDate,*/ /*type: linkType });
                    });
                });
            });
        })
    }*/

    //alternativa per collegare gli stessi documenti con tipo di link diverso
    linkDocuments(id1, id2, linkType){
        return new Promise((resolve, reject) => {
            const checkLinkQuery = 'SELECT COUNT(*) AS count FROM DocumentsLinks WHERE ((idDocument1 = ? AND idDocument2 = ?) OR (idDocument2 = ? AND idDocument1 = ?)) AND type = ?';
            db.get(checkLinkQuery, [id1, id2, id1, id2, linkType], (err, row) => {
                if (err) {
                    console.error('Database error while checking link:', err.message);
                    return reject(new Error('Database error: ' + err.message));
                }
                if (row.count > 0) {
                    return reject(new Error('Link of this type already exists between these documents'));
                }
    
                const linkDocuments = 'INSERT INTO DocumentsLinks (idDocument1, idDocument2, type) VALUES (?, ?, ?)';
                db.run(linkDocuments, [id1, id2, linkType], (err) => {
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
                        resolve({ idDocument1: id1, idDocument2: id2, type: linkType });
                    });
                });
            });
        });
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

    showStakeholders(){
        return new Promise((resolve, reject) => {
            const showStakeholders = 'SELECT name FROM Stakeholder';

            db.all(showStakeholders, [], (err, stakeholders) => {
                if (err) {
                    console.error('Database error while getting all stakeholders:', err.message);
                    return reject(new Error('Database error: ' + err.message));
                }

                resolve(stakeholders);
            });
        });
    }

    showScales(){
        return new Promise((resolve, reject) => {
            const showScales = 'SELECT name FROM Scale';

            db.all(showScales, [], (err, scales) => {
                if (err) {
                    console.error('Database error while getting all scales:', err.message);
                    return reject(new Error('Database error: ' + err.message));
                }

                resolve(scales);
            });
        });
    }

    showTypes(){
        return new Promise((resolve, reject) => {
            const showTypes = 'SELECT * FROM DocumentType';

            db.all(showTypes, [], (err, type) => {
                if (err) {
                    console.error('Database error while getting all types:', err.message);
                    return reject(new Error('Database error: ' + err.message));
                }

                resolve(type);
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

            const checkAndAddStakeholders = (stakeholders) => {
                return Promise.all(stakeholders.map(stakeholder => {
                  return new Promise((resolve, reject) => {
                    const checkQuery = 'SELECT name FROM Stakeholder WHERE name = ?';
                    db.get(checkQuery, [stakeholder], (err, row) => {
                      if (err) {
                        console.error('Database error while checking stakeholders:', err.message);
                        return reject(new Error('Database error: ' + err.message));
                      }
                      if (row) {
                        resolve({ message: 'Stakeholder already exists.' });
                        console.log('Stakeholder already exists.');
                      } else {
                        const addQuery = 'INSERT INTO Stakeholder (name) VALUES (?)';
                        db.run(addQuery, [stakeholder], function (err) {
                          if (err) {
                            console.error('Database error while adding stakeholders:', err.message);
                            return reject(new Error('Database error: ' + err.message));
                          }
                          resolve({ message: 'Stakeholder added successfully.' });
                          console.log('Stakeholder added successfully.');
                        });
                      }
                    });
                  });
                }));
              };
    

    const checkAndAddScale = (scale) => {
        return new Promise((resolve, reject) => {
          const checkQuery = 'SELECT name FROM Scale WHERE name = ?';
          db.get(checkQuery, [scale], (err, row) => {
            if (err) {
              console.error('Database error while checking scales:', err.message);
              return reject(new Error('Database error: ' + err.message));
            }
            if (row) {
              resolve({ message: 'Scale already exists.' });
              console.log('Scale already exists.');
            } else {
              const addQuery = 'INSERT INTO Scale (name) VALUES (?)';
              db.run(addQuery, [scale], function (err) {
                if (err) {
                  console.error('Database error while adding scales:', err.message);
                  return reject(new Error('Database error: ' + err.message));
                }
                resolve({ message: 'Scale added successfully.' });
                console.log('Scale added successfully.');
              });
            }
          });
        });
    };

      const checkAndAddType = (type) => {
        return new Promise((resolve, reject) => {
          const checkQuery = 'SELECT name FROM DocumentType WHERE name = ?';
          db.get(checkQuery, [type], (err, row) => {
            if (err) {
              console.error('Database error while checking types:', err.message);
              return reject(new Error('Database error: ' + err.message));
            }
            if (row) {
              resolve({ message: 'DocumentType already exists.' });
              console.log('DocumentType already exists.');
            } else {
              const addQuery = 'INSERT INTO DocumentType (name) VALUES (?)';
              db.run(addQuery, [type], function (err) {
                if (err) {
                  console.error('Database error while adding types:', err.message);
                  return reject(new Error('Database error: ' + err.message));
                }
                resolve({ message: 'DocumentType added successfully.' });
                console.log('DocumentType added successfully.');
              });
            }
          });
        });
      };  //const id = generateNumericId(); 
      Promise.all([
        checkAndAddStakeholders(stakeholders),
        checkAndAddScale(scale),
        checkAndAddType(type)
      ]).then(() => {
        const updateDocumentQuery = `
          UPDATE Documents
          SET title = ?, stakeholders = ?, scale = ?, issuanceDate = ?, type = ?, 
              connections = ?, language = ?, pages = ?, lat = ?, lon = ?, area = ?, description = ?
          WHERE id = ?
        `;
  
        db.run(updateDocumentQuery, [title, stakeholders, scale, issuanceDate, type, connections, language, pages, lat, lon, area, description, id], function (err) {
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
      }).catch((err) => {
        return reject(err);
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
                    //console.error('Database error while deleting document:', err.message);
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
