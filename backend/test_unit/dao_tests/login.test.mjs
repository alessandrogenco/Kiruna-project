import { describe, test, expect, jest, afterEach } from "@jest/globals";
import db from "../../db/db.mjs"

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
});