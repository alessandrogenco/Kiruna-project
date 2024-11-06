import db from "../db/db.mjs";

export async function cleanup() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run("DELETE FROM users", function(err) {
                if (err) return reject(err);
            });

            db.run("DELETE FROM Documents", function(err) {
                if (err) return reject(err);
                resolve(true);
            });
            
            db.run("DELETE FROM DocumentsLinks", function(err) {
                if (err) return reject(err);
                resolve(true);
            });
        });
    });
}