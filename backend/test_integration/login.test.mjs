import { describe, test, expect, jest, afterEach } from "@jest/globals";
import { server } from "../index.mjs";
import request from "supertest";
import { cleanup } from "../db/cleanup.mjs";
// import the dao
import LoginDao from "../dao/login.mjs"

const login = new LoginDao();
const user1 = {username: "luca.rossi", password: "abcdef", name: "Luca", surname: "Rossi"};

// define baseurl
const baseURL = "/api/";

beforeAll(async () => {
    await cleanup();
})

afterEach(()=>{
    jest.restoreAllMocks()
});

afterAll(async () => {
    await cleanup();
    server.close();
});

describe("POST Register a new user", () => {
    test("Successfully registered a new user", async () => {
        const app = (await import("../index")).app;
        const response = await request(app).post(baseURL + "register").send({
            username: user1.username,
            name: user1.name,
            surname: user1.surname,
            password: user1.password
        });

        expect(response.status).toBe(201);
        expect(response.body).toEqual({
            username: user1.username,
            name: user1.name,
            surname: user1.surname,
            salt: expect.any(String)
        });
    });

    test("Should reject if username already exists", async () => {
        const app = (await import("../index")).app;
        const response = await request(app).post(baseURL + "register").send({
            username: user1.username,
            name: user1.name,
            surname: user1.surname,
            password: user1.password
        });

        expect(response.status).toBe(409);
    });

    test("Should reject if a field is missing", async () => {
        const app = (await import("../index")).app;
        const response = await request(app).post(baseURL + "register").send({
            username: user1.username,
            surname: user1.surname,
            password: user1.password
        });

        expect(response.status).toBe(400);
    });

});