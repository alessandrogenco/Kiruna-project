import crypto from 'crypto';
import db from '../db/db.mjs';


class LoginDao {

    //Register
    registerUser(username, password, name, surname) {
        return new Promise((resolve, reject) => {
            const checkUserQuery = 'SELECT username FROM Users WHERE username = ?';

            db.get(checkUserQuery, [username], (err, existingUser) => {
                if (err) {
                    console.error('Database error while checking user:', err.message);
                    return reject(new Error('Database error: ' + err.message));
                }
                if (existingUser) {
                    console.log('Username already exists:', username);
                    return reject(new Error('Username already exists. Please choose another one.'));
                }

                const salt = crypto.randomBytes(16).toString('hex');

                crypto.scrypt(password, salt, 64, (err, hashedPassword) => {
                    if (err) {
                        console.error('Error during password hashing:', err.message);
                        return reject(new Error('Error during password hashing: ' + err.message));
                    }
                    const hash = hashedPassword.toString('hex');

                    const insertUserQuery = 'INSERT INTO Users (username, name, surname, salt, password) VALUES (?, ?, ?, ?, ?)';
                    db.run(insertUserQuery, [username, name, surname, salt, hash], function (err) {
                        if (err) {
                            console.error('Database error while inserting user:', err.message);
                            return reject(new Error('Database error: ' + err.message));
                        }

                        resolve({
                            username: username,
                            name: name,
                            surname: surname,
                            salt: salt 
                        });
                    });
                });
            });
        });
    }


    Login(username, password) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM Users WHERE username = ?';
            db.get(query, [username], (err, row) => {
                if (err) {
                    console.error('Database error:', err.message);
                    return reject(new Error('Database error: ' + err.message));
                }
    
                if (!row) {
                    console.log('User not found');
                    return resolve(false);
                }
    
                console.log('User found: ', row);
    
                crypto.scrypt(password, row.salt, 64, (err, hashedPassword) => {
                    if (err) {
                        console.error('Error during password hashing:', err.message);
                        return reject(new Error('Error during password hashing: ' + err.message));
                    }
    
                    console.log('Comparing hashes...');
    
                    if (crypto.timingSafeEqual(Buffer.from(row.password, 'hex'), hashedPassword)) {

                        const user = {
                            id: row.id,
                            username: row.username,
                            name: row.name,
                            surname: row.surname,
                        };
                        return resolve(user);                
                    } else {
                        console.log('Password does not match');
                        return resolve(false);
                    }
                });
            });
        });
    }
    
}

export default LoginDao;
