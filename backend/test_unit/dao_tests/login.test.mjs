import { describe, test, expect, jest, afterEach } from "@jest/globals";
import db from "../../db/db.mjs"
import crypto from 'crypto';

// import the dao
import LoginDao from "../../dao/login.mjs"

const login = new LoginDao();
const user1 = {username: "luca.rossi", password: "abcdef", name: "Luca", surname: "Rossi"};

afterEach(()=>{
    jest.restoreAllMocks()
})

describe("Register a new user", () => {
    test("Successfully registered a new user", async () => {
        const spyGet = jest.spyOn(db, 'get')
            .mockImplementation((sql, params, callback) => {
                return callback(null, null);
            });
        const spyRun = jest.spyOn(db, 'run')
            .mockImplementation((sql, params, callback) => {
                return callback(null);
            });
        const result = await login.registerUser(user1.username, user1.password, user1.name, user1.surname);
        expect(result).toEqual({
            username: user1.username,
            name: user1.name,
            surname: user1.surname,
            salt: expect.any(String)
        });
    });

    test("Should reject if username already exists", async () => {
        const spyGet = jest.spyOn(db, 'get')
            .mockImplementation((sql, params, callback) => {
                return callback(null, {username: "existingUser"});
            });

        await expect(login.registerUser('existingUser', 'password', 'name', 'surname')).rejects.toThrow(Error);
    });

    test("Should reject if there is a database error while checking user", async () => {
        const spyGet = jest.spyOn(db, 'get')
            .mockImplementation((sql, params, callback) => {
                return callback(Error);
            });

        await expect(login.registerUser('newUser', 'password', 'name', 'surname')).rejects.toThrow(Error);
    });

    test("Should reject if there is a database error while inserting user", async () => {
        
        const spyGet = jest.spyOn(db, 'get')
            .mockImplementation((sql, params, callback) => {
                return callback(null, null);
            });
        const spyRun = jest.spyOn(db, 'run')
            .mockImplementation((sql, params, callback) => {
                return callback(Error);
            });

        await expect(login.registerUser('newUser', 'password', 'name', 'surname')).rejects.toThrow(Error);
    });
});

describe("Login user", () => {
    test("User logged in successfully", async () => {
        const spyGet = jest.spyOn(db, 'get')
            .mockImplementation((sql, params, callback) => {
                return callback(null, {
                    id: 1,
                    username: user1.username,
                    name: user1.name,
                    surname: user1.surname,
                    salt: 'randomSalt',
                    password: crypto.scryptSync(user1.password, 'randomSalt', 64).toString('hex')});
            });

        const result = await login.Login(user1.username, user1.password);
        expect(result).toEqual({
            id: 1,
            username: user1.username,
            name: user1.name,
            surname: user1.surname
        });
    });
});