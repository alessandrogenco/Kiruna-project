
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

    checkAndAddStakeholders(stakeholders) {

      const stakeholdersArray = stakeholders.split(' - ');

        return Promise.all(stakeholdersArray.map(stakeholder => {
          return new Promise((resolve, reject) => {
            const checkQuery = 'SELECT name FROM Stakeholder WHERE name = ?';
            db.get(checkQuery, [stakeholder], (err, row) => {
              if (err) {
                console.error('Database error while checking stakeholders:', err.message);
                return reject(new Error('Database error: ' + err.message));
              }
              if (row) {
                resolve({ message: 'Stakeholder already exists.' });
              } else {
                const addQuery = 'INSERT INTO Stakeholder (name) VALUES (?)';
                db.run(addQuery, [stakeholder], function (err) {
                  if (err) {
                    console.error('Database error while adding stakeholders:', err.message);
                    return reject(new Error('Database error: ' + err.message));
                  }
                  resolve({ message: 'Stakeholder added successfully.' });
                });
              }
            });
          });
        }));
      }

      checkAndAddScale(scale) {
        return new Promise((resolve, reject) => {
          const checkQuery = 'SELECT name FROM Scale WHERE name = ?';
          db.get(checkQuery, [scale], (err, row) => {
            if (err) {
              console.error('Database error while checking scales:', err.message);
              return reject(new Error('Database error: ' + err.message));
            }
            if (row) {
              resolve({ message: 'Scale already exists.' });
            } else {
              const addQuery = 'INSERT INTO Scale (name) VALUES (?)';
              db.run(addQuery, [scale], function (err) {
                if (err) {
                  console.error('Database error while adding scales:', err.message);
                  return reject(new Error('Database error: ' + err.message));
                }
                resolve({ message: 'Scale added successfully.' });
              });
            }
          });
        });
      }

      checkAndAddType(type) {
        return new Promise((resolve, reject) => {
          const checkQuery = 'SELECT name FROM DocumentType WHERE name = ?';
          db.get(checkQuery, [type], (err, row) => {
            if (err) {
              console.error('Database error while checking types:', err.message);
              return reject(new Error('Database error: ' + err.message));
            }
            if (row) {
              resolve({ message: 'DocumentType already exists.' });
            } else {
              const addQuery = 'INSERT INTO DocumentType (name) VALUES (?)';
              db.run(addQuery, [type], function (err) {
                if (err) {
                  console.error('Database error while adding types:', err.message);
                  return reject(new Error('Database error: ' + err.message));
                }
                resolve({ message: 'DocumentType added successfully.' });
              });
            }
          });
        });
      }

    //add document
    addDocument(title, stakeholders, scale, date, type, connections, language, pages, lat, lon, area, areaName, description) {
        return new Promise((resolve, reject) => {
            if (!title || title.trim() === "") {
                return reject(new Error('Title cannot be empty.'));
            }
            
            Promise.all([
                this.checkAndAddStakeholders(stakeholders),
                this.checkAndAddScale(scale),
                this.checkAndAddType(type)
              ]).then(() => {
                const addDocumentQuery = `
                  INSERT INTO Documents (title, stakeholders, scale, issuanceDate, type, connections, language, pages, lat, lon, area, areaName, description)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?, ?, ?)
                `;
                db.run(addDocumentQuery, [title, stakeholders, scale, date, type, connections, language, pages, lat, lon, area, areaName, description], function (err) {
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
                    areaName,
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
    
    updateLink(idDocument1, idDocument2, linkType, newLinkType) {
        return new Promise((resolve, reject) => {
            const checkLinkQuery = 'SELECT type FROM DocumentsLinks WHERE ((idDocument1 = ? AND idDocument2 = ?) OR (idDocument2 = ? AND idDocument1 = ?))';
            db.get(checkLinkQuery, [idDocument1, idDocument2, idDocument1, idDocument2], (err, row) => {
                if (err) {
                    console.error('Database error while checking link:', err.message);
                    return reject(new Error('Database error: ' + err.message));
                }
                if (!row) {
                    return reject(new Error('Link not found'));
                }
                if (row.type === newLinkType) {
                    return reject(new Error('The new type is the same as the current type'));
                }
    
                const updateLinkQuery = 'UPDATE DocumentsLinks SET type = ? WHERE ((idDocument1 = ? AND idDocument2 = ?) OR (idDocument2 = ? AND idDocument1 = ?)) AND type = ?';
                db.run(updateLinkQuery, [newLinkType, idDocument1, idDocument2, idDocument1, idDocument2, linkType], (err) => {
                    if (err) {
                        console.error('Database error while updating link:', err.message);
                        return reject(new Error('Database error: ' + err.message));
                    }
                    resolve({ id1: idDocument1, id2: idDocument2, newType: newLinkType });
                });
            });
        });
    }
    

    deleteLink(idDocument1, idDocument2, linkType) {
        return new Promise((resolve, reject) => {
            // Verifica se il link esiste
            const checkLinkQuery = 'SELECT COUNT(*) AS count FROM DocumentsLinks WHERE ((idDocument1 = ? AND idDocument2 = ?) OR (idDocument2 = ? AND idDocument1 = ?)) AND type = ?';
            db.get(checkLinkQuery, [idDocument1, idDocument2, idDocument1, idDocument2, linkType], (err, row) => {
                if (err) {
                    console.error('Database error while checking link:', err.message);
                    return reject(new Error('Database error: ' + err.message));
                }
                if (row.count === 0) {
                    return reject(new Error('Link not found'));
                }
    
                // Inizia la transazione per eliminare il link e aggiornare il numero di connessioni
                db.serialize(() => {
                    // Elimina il link dalla tabella DocumentsLinks
                    const deleteLinkQuery = 'DELETE FROM DocumentsLinks WHERE ((idDocument1 = ? AND idDocument2 = ?) OR (idDocument2 = ? AND idDocument1 = ?)) AND type = ?';
                    db.run(deleteLinkQuery, [idDocument1, idDocument2, idDocument1, idDocument2, linkType], (err) => {
                        if (err) {
                            console.error('Database error while deleting link:', err.message);
                            return reject(new Error('Database error: ' + err.message));
                        }
    
                        // Decrementa il numero di connessioni per entrambi i documenti
                        const updateConnectionsQuery1 = 'UPDATE Documents SET connections = connections - 1 WHERE id = ?';
                        const updateConnectionsQuery2 = 'UPDATE Documents SET connections = connections - 1 WHERE id = ?';
    
                        db.run(updateConnectionsQuery1, [idDocument1], (err) => {
                            if (err) {
                                console.error('Error while updating connections for document 1:', err.message);
                                return reject(new Error('Error while updating connections for document 1: ' + err.message));
                            }
    
                            db.run(updateConnectionsQuery2, [idDocument2], (err) => {
                                if (err) {
                                    console.error('Error while updating connections for document 2:', err.message);
                                    return reject(new Error('Error while updating connections for document 2: ' + err.message));
                                }
    
                                // Restituisce il risultato dell'operazione
                                resolve({ id1: idDocument1, id2: idDocument2, type: linkType });
                            });
                        });
                    });
                });
            });
        });
    }    

    showStakeholders() {
      return new Promise((resolve, reject) => {
          const showStakeholders = 'SELECT GROUP_CONCAT(name, " - ") AS stakeholders FROM Stakeholder';
  
          db.get(showStakeholders, [], (err, row) => {
              if (err) {
                  console.error('Database error while getting all stakeholders:', err.message);
                  return reject(new Error('Database error: ' + err.message));
              }
  
              resolve(row.stakeholders || '');
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
    

updateDocument(id, title, stakeholders, scale, issuanceDate, type, connections, language, pages, lat, lon, area, areaName, description) {
    return new Promise((resolve, reject) => {
        // Verify that the ID is valid
        if (!id) {
            return reject(new Error('ID is required.'));
        }

        Promise.all([
            this.checkAndAddStakeholders(stakeholders),
            this.checkAndAddScale(scale),
            this.checkAndAddType(type)
        ]).then(() => {
            const updateDocumentQuery = `
                UPDATE Documents
                SET title = ?, stakeholders = ?, scale = ?, issuanceDate = ?, type = ?,
                    connections = ?, language = ?, pages = ?, lat = ?, lon = ?, area = ?, areaName = ?, description = ?
                WHERE id = ?
            `;

            db.run(updateDocumentQuery, [title, stakeholders, scale, issuanceDate, type, connections, language, pages, lat, lon, area, areaName, description, id], function (err) {
                if (err) {
                    console.error('Database error while updating document:', err.message);
                    return reject(new Error('Database error: ' + err.message));
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
                    areaName,
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

    adjustDocumentPosition(id, x, y) {
        return new Promise((resolve, reject) => {
            if (!id) {
                return reject(new Error('ID is required.'));
            }
            const adjustDocumentPositionQuery = 'UPDATE Documents SET x = ?, y = ? WHERE id = ?';
            db.run(adjustDocumentPositionQuery, [x, y, id], function (err) {
                if (err) {
                    db.close();
                    return reject(new Error(`Database error while updating document: ${err.message}`));
                }

                // Controlla se il documento è stato effettivamente aggiornato
                if (this.changes === 0) {
                    db.close();
                    return reject(new Error('No document found with the provided ID.'));
                }

                resolve(`Document with ID ${id} updated successfully: x=${x}, y=${y}`);
            });
        });
    }

    getDocumentPosition(id) {
        return new Promise((resolve, reject) => {
            if (!id) {
                return reject(new Error('ID is required.'));
            }
            const getDocumentPositionQuery = 'SELECT * FROM Documents WHERE id = ?';
            db.get(getDocumentPositionQuery, [id], (err, row) => {
                if (err) {
                    db.close();
                    return reject(new Error(`Database error while fetching document position: ${err.message}`));
                }
    
                if (!row) {
                    db.close();
                    return reject(new Error('No document found with the provided ID.'));
                }
    
                // Restituisce tutti i campi della riga trovata
                resolve(row);
            });
        });
    }
    
    

}

export default DocumentDao;
