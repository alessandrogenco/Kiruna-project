
const SERVER_URL = 'http://localhost:3001/api';

// Esegue il processo di login, richiede uno username e una password all'interno di un oggetto "credentials"
const login = async (username, password) => {
    try {
        const response = await fetch(SERVER_URL + '/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' 
            },
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

const API = {login}
export default API;
