/** DB access module **/

import sqlite3 from "sqlite3";
import { dbFilePath } from "./path.mjs";

// Opening the database
const db = new sqlite3.Database(dbFilePath, (err) => {
    if (err) throw err;
    console.log('Connected to the SQLite database.');

});


export default db;

