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

const linkDocument = async (id1, id2, linkDate, linkType) => {
    try {
        const response = await fetch(SERVER_URL + '/linkDocuments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id1, id2, linkDate, linkType }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();
        alert('Documents linked successfully!');
        return result;
    } catch (error) {
        console.error('Error linking documents:', error);
        throw error;
    }
};

const API = { login, logout, checkLogin, linkDocument };
export default API;
