import { describe, test, expect, jest, afterEach } from "@jest/globals";
import { server } from "../index.mjs";
import request from "supertest";
import { cleanup } from "../db/cleanup.mjs";
// import the dao
import FileUploadDao from "../dao/fileUpload.mjs"

const file = new FileUploadDao();

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

describe("POST /api/upload", () => {

        test("Should return 400 if required fields are missing", async () => {
            const app = (await import("../index")).app;
            const response = await request(app)
              .post(`${baseURL}upload`)
              .send({});
        
            expect(response.status).toBe(400);
            expect(response.body).toEqual({ message: 'No files uploaded' });
          });
    });

describe("GET /api/files/:documentId", () => {

    test("Should return 404 if document does not exist", async () => {
        const app = (await import("../index")).app;
        const documentId = 999;
        const response = await request(app).get(`${baseURL}files/${documentId}`);

        expect(response.status).toBe(404);
    });
} );

//describe for getOriginalResourceById
describe("GET /api/download/:resourceId", () => {

    test("Should return 404 if document does not exist", async () => {
        const app = (await import("../index")).app;
        const resourceId = "application/pdf";
        const response = await request(app).get(`${baseURL}download/${resourceId}`);

        expect(response.status).toBe(404);
    });
} );

//delete
// describe("DELETE /api/files/:resourceId", () => {
//     test("Error 500", async () => {
//         const app = (await import("../index")).app;
//         const documentId = 1;
//         const description = "Test file";
//         const response = await request(app).delete(`${baseURL}delete?documentId=${documentId}&description=${description}`);

//         expect(response.status).toBe(500);
//     });
// } );