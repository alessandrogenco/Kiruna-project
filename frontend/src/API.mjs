const SERVER_URL = 'http://localhost:3001/api';

// Esegue il processo di login, richiede uno username e una password all'interno di un oggetto "credentials"
const login = async (username, password) => {
    try {
        const response = await fetch(SERVER_URL + '/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' 
            },
            credentials: 'include', //
            body: JSON.stringify({ username, password }) 
        });

        // Gestisce la risposta
        if (!response.ok) { // Se non va a buon fine
            const errorData = await response.json();
            throw new Error(errorData.message || 'Login failed');
        }

        // Se va a buon fine, recupera i dati dell'utente
        const data = await response.json();
        console.log('Login successful:', data);

        // Restituisce i dati dell'utente per gestirli nel frontend
        return data.user;
    } catch (error) {
        console.error('Login error:', error.message);
        throw error;
    }
}

// Esegue il processo di logout
const logout = async () => {
    try {
        const response = await fetch(SERVER_URL + '/logout', {
            method: 'POST',
            credentials: 'include', // Include i cookie di sessione per gestire il logout
        });

        // Gestisce la risposta
        if (!response.ok) { // Se non va a buon fine
            const errorData = await response.json();
            throw new Error(errorData.error || 'Logout failed');
        }

        // Se va a buon fine, mostra un messaggio di conferma
        const data = await response.json();
        console.log('Logout successful:', data.message);

        // Restituisce il messaggio di conferma per gestirlo nel frontend
        return data.message;
    } catch (error) {
        console.error('Logout error:', error.message);
        throw error;
    }
}

const checkLogin = async () => {
    try {
        const response = await fetch(SERVER_URL + '/check-login', {
            method: 'GET',
            credentials: 'include' // Include i cookie per la sessione
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to check login status');
        }

        const data = await response.json();
        console.log('User is logged in:', data);
        return data.user; // Restituisce i dati dell'utente
    } catch (error) {
        console.error('Check login error:', error.message);
        return null; // Restituisce null se non è loggato
    }
}

const getDocuments = async () => {
    try {
      const response = await fetch(SERVER_URL + '/documents', { method: 'GET' });
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
  
      const documents = await response.json();
      return documents;
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  };

  export const getDocumentById = async (documentId) => {
    try {
        const response = await fetch(`${SERVER_URL}/documents/${documentId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`Document with ID ${documentId} not found`);
            }
            throw new Error(`Failed to fetch document with ID ${documentId}`);
        }

        const documentData = await response.json();
        return documentData;
    } catch (error) {
        console.error('Error fetching document by ID:', error.message);
        throw error;
    }
};


const linkDocument = async (id1, id2, /*linkDate,*/ linkType) => {
    try {
        const response = await fetch(SERVER_URL + '/linkDocuments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id1, id2, /*linkDate,*/ linkType }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error linking documents:', error);
        throw error;
    }
};

export const getDocumentLinks = async (documentId) => {
    try {
        const response = await fetch(SERVER_URL + '/documentLinks/' + documentId, { 
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch document links');
        }

        const result = await response.json();
        return result;
    } catch (error) {  
        console.error('Error fetching document links:', error);
        throw error;
    }
}

const updateLink = async (idDocument1, idDocument2, newLinkDate, newLinkType) => {
    try {
        const response = await fetch(SERVER_URL + '/links', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                idDocument1: idDocument1,
                idDocument2: idDocument2,
                newLinkDate: newLinkDate,
                newLinkType: newLinkType
            })
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Link not found');
            }
            throw new Error('Failed to update link');
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error updating link:', error);
        throw error;
    }
}




// API.mjs
export const deleteDocument = async (id) => {
    try {
      const response = await fetch(`http://localhost:3001/api/deleteDocument`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id })
      });
  
      if (!response.ok) {
        throw new Error('Failed to delete document');
      }
  
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  };

  // API.mjs
export const updateDocument = async (id, title, stakeholders, scale, issuanceDate, type, connections, language, pages, lat, lon, area, description) => {
    try {
      const response = await fetch('http://localhost:3001/api/updateDocument', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
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
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to update document');
      }
  
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  };

  async function deleteLink(idDocument1, idDocument2, linkType) {
    try {
      const response = await fetch('http://localhost:3001/api/deleteLink', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idDocument1, idDocument2, linkType }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore durante l\'eliminazione del link');
      }
  
      // Gestisci le risposte vuote
      const result = await response.text();
      if (result) {
        return JSON.parse(result);
      } else {
        return { message: 'Link eliminato con successo' };
      }
    } catch (error) {
      console.error('Errore:', error.message);
      throw error;
    }
  }


const API = { login, logout, checkLogin, getDocuments, linkDocument, getDocumentLinks, updateLink, deleteDocument, updateDocument, deleteLink};
export default API;
