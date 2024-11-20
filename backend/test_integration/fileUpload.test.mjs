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
    test("Successfully uploads a file", async () => {
        const app = (await import("../index")).app;
        const documentId = 1;
        const resource = {
          resourceType: "image",
          fileData: "base64_encoded_file_data",
          description: "Test image"
        };
        const response = await request(app).post(`${baseURL}upload?documentId=${documentId}&resourceType=${resource.resourceType}&description=${resource.description}`).send({
            file: "file"
        });

        expect(response.status).toBe(201);
        
        });

        test("Should return 400 if required fields are missing", async () => {
            const app = (await import("../index")).app;
            const response = await request(app)
              .post(`${baseURL}upload`)
              .send({});
        
            expect(response.status).toBe(400);
            expect(response.body).toEqual({ message: 'Missing required fields' });
          });
    });

describe("GET /api/files/:documentId", () => {
    test("Should return the files of a document", async () => {
        const app = (await import("../index")).app;
        const documentId = 1;
        const response = await request(app).get(`${baseURL}files/${documentId}`);

        expect(response.status).toBe(200);
    });

    test("Should return 404 if document does not exist", async () => {
        const app = (await import("../index")).app;
        const documentId = 999;
        const response = await request(app).get(`${baseURL}files/${documentId}`);

        expect(response.status).toBe(404);
    });
} );

//describe for getOriginalResourceById
describe("GET /api/files/:resourceId", () => {
    test("Should return the file of a document", async () => {
        const app = (await import("../index")).app;
        const resourceId = 1;
        const response = await request(app).get(`${baseURL}files/${resourceId}`);

        expect(response.status).toBe(200);
    });

    test("Should return 404 if document does not exist", async () => {
        const app = (await import("../index")).app;
        const resourceId = 999;
        const response = await request(app).get(`${baseURL}files/${resourceId}`);

        expect(response.status).toBe(404);
    });
} );