import { describe, test, expect, jest, afterEach } from "@jest/globals";
import { server } from "../../index.mjs";
import request from "supertest";

// import the dao
import LoginDao from "../../dao/login.mjs"

const login = new LoginDao();
const user1 = {username: "luca.rossi", password: "abcdef", name: "Luca", surname: "Rossi"};

// define baseurl
const baseURL = "/api/";

afterEach(()=>{
    jest.restoreAllMocks()
});

afterAll(() => {
    server.close();
});

describe("POST Register a new user", () => {
    test("Successfully registered a new user", async () => {
        const spyDao = jest.spyOn(LoginDao.prototype, "registerUser").mockResolvedValueOnce({
            username: user1.username,
            name: user1.name,
            surname: user1.surname,
            salt: expect.any(String)
        });

        const app = (await import("../../index")).app;
        const response = await request(app).post(baseURL + "register").send({
            username: user1.username,
            name: user1.name,
            surname: user1.surname,
            password: user1.password
        });

        expect(response.status).toBe(201);
        expect(spyDao).toHaveBeenCalledTimes(1);
        expect(spyDao).toHaveBeenCalledWith(
            user1.username,
            user1.password,
            user1.name,
            user1.surname
        );
        expect(response.body).toEqual({
            username: user1.username,
            name: user1.name,
            surname: user1.surname,
            salt: expect.any(Object)
        });
        
    });

    test("Should reject if username already exists", async () => {
        const spyDao = jest.spyOn(LoginDao.prototype, "registerUser").mockRejectedValueOnce(new Error('Username already exists. Please choose another one.'));

        const app = (await import("../../index")).app;
        const response = await request(app).post(baseURL + "register").send({
            username: user1.username,
            name: user1.name,
            surname: user1.surname,
            password: user1.password
        });

        expect(response.status).toBe(409);
        expect(spyDao).toHaveBeenCalledTimes(1);
        expect(spyDao).toHaveBeenCalledWith(
            user1.username,
            user1.password,
            user1.name,
            user1.surname
        );
    });

    test("Should reject if a field is missing", async () => {
        const app = (await import("../../index")).app;
        const response = await request(app).post(baseURL + "register").send({
            username: user1.username,
            surname: user1.surname,
            password: user1.password
        });

        expect(response.status).toBe(400);
    });

    test("Should reject if an internal server error occurs", async () => {
        const spyDao = jest.spyOn(LoginDao.prototype, "registerUser").mockRejectedValueOnce(new Error());

        const app = (await import("../../index")).app;
        const response = await request(app).post(baseURL + "register").send({
            username: user1.username,
            name: user1.name,
            surname: user1.surname,
            password: user1.password
        });

        expect(response.status).toBe(500);
        expect(spyDao).toHaveBeenCalledTimes(1);
        expect(spyDao).toHaveBeenCalledWith(
            user1.username,
            user1.password,
            user1.name,
            user1.surname
        );
    });
});

describe("POST Login user", () => {
    test("User logged in successfully", async () => {
        const spyDao = jest.spyOn(LoginDao.prototype, "Login").mockResolvedValueOnce({
            id: 1,
            username: user1.username,
            name: user1.name,
            surname: user1.surname
        });

        const app = (await import("../../index")).app;
        const response = await request(app).post(baseURL + "login").send({
            username: user1.username,
            password: user1.password
        });

        expect(response.status).toBe(200);
        expect(spyDao).toHaveBeenCalledTimes(1);
        expect(spyDao).toHaveBeenCalledWith(
            user1.username,
            user1.password
        );
        expect(response.body).toEqual({
            message: 'Login successful',
            user: {
                id: 1,
                username: user1.username,
                name: user1.name,
                surname: user1.surname
            }
        });  
    });

    test("Should reject if a field is missing", async () => {
        const app = (await import("../../index")).app;
        const response = await request(app).post(baseURL + "login").send({
            username: user1.username
        });

        expect(response.status).toBe(400);
    });

    test("Should reject if invalid username or password", async () => {
        const spyDao = jest.spyOn(LoginDao.prototype, "Login").mockResolvedValueOnce(false);

        const app = (await import("../../index")).app;
        const response = await request(app).post(baseURL + "login").send({
            username: user1.username,
            password: user1.password
        });

        expect(response.status).toBe(401);
        expect(spyDao).toHaveBeenCalledTimes(1);
        expect(spyDao).toHaveBeenCalledWith(
            user1.username,
            user1.password
        );
        expect(response.body).toEqual({ 
            message: 'Invalid username or password.' 
        });
    });
});