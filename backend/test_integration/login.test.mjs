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

afterAll(() => {
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

describe("POST Login user", () => {
    test("User logged in successfully", async () => {
        const app = (await import("../index")).app;
        const response = await request(app).post(baseURL + "login").send({
            username: user1.username,
            password: user1.password
        });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            message: 'Login successful',
            user: {
                id: expect.any(Number),
                username: user1.username,
                name: user1.name,
                surname: user1.surname
            }
        });  
    });

    test("Should reject if a field is missing", async () => {
        const app = (await import("../index")).app;
        const response = await request(app).post(baseURL + "login").send({
            username: user1.username
        });

        expect(response.status).toBe(400);
    });

    test("Should reject if invalid username or password", async () => {
        const app = (await import("../index")).app;
        const response = await request(app).post(baseURL + "login").send({
            username: "invalidUsername",
            password: user1.password
        });

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ 
            message: 'Invalid username or password.' 
        });
    });

});

describe("GET Check user login", () => {
    test("User is logged in", async () => {
        const app = (await import("../index")).app;
        const agent = request.agent(app);
        await agent.post('/api/login').send({
            username: user1.username,
            password: user1.password
        });

        const response = await agent.get('/api/check-login');
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('User is logged in');
        expect(response.body.user).toBeDefined(); 
    });

    test("User is not logged in", async () => {
        const app = (await import("../index")).app;

        const response = await request(app).get('/api/check-login');
        expect(response.status).toBe(401);
        expect(response.body.message).toBe('User is not logged in');
    });

});