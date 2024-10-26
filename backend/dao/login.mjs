import crypto from 'crypto';
import db from '../db/db.mjs';


export const getUserByCredentials = (username, password) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM Users WHERE username = ?';
        db.get(query, [username], (err, row) => {
            if(err){
                console.error('Database error:', err.message);
                reject(new Error ('Database error: ' + err.message));
                return;
            }

            if(!row) {
                console.log('User not found');
                resolve(false);
                return;
            }

            console.log('User found: ', row)

            const user = {
                id: row.id,
                username: row.username,
                role: row.role
            }

            crypto.scrypt(password, row.salt, 64, (err, hashedPassword) => {
                if(err){
                    console.error('Error during password hashing:' , err.message);
                    reject(new Error('Error during password hashing: ', err.message))
                    return;
                }

                console.log('Comparing hashes...');

                if(crypto.timingSafeEqual(Buffer.from(row.hash, 'hex'), hashedPassword)){
                    resolve(user);                
                } else {
                    resolve(false);
                }

            })
        })
    })
}