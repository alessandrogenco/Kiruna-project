import db from "../db/db.mjs";

export async function cleanup() {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM users", function(err) {
            if (err) return reject(err);
            return resolve(true);
        });
    });
}