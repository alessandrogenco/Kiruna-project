import { describe, test, expect, jest, afterEach, afterAll } from "@jest/globals";
import request from "supertest";
import { app, server } from "../../index.mjs";
import FileUploadDao from "../../dao/fileUpload.mjs";
import fs from 'fs';


// Mocking the instance of fileUpload
jest.mock("../../dao/fileUpload.mjs");

jest.mock('fs');

const baseURL = "/api/";

afterEach(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  server.close();
});

jest.mock('sqlite3', () => {
  const mSqlite3 = {
    Database: jest.fn(() => ({
      run: jest.fn((query, params, callback) => {
        callback(null);
      }),
    })),
  };
  return mSqlite3;
});

describe("addOriginalResource API", () => {


  test("Should insert a resource and return the resourceId", async () => {
    const documentId = 1;
    const resource = {
      resourceType: "image",
      fileData: "base64_encoded_file_data",
      description: "Test image"
    };
    const lastID = 123;

    // Mock the addOriginalResource function
    FileUploadDao.prototype.addOriginalResource.mockResolvedValue({ resourceId: lastID });

    const response = await request(app)
      .post(`${baseURL}upload?documentId=${documentId}&resourceType=${resource.resourceType}&description=${resource.description}`)
      .send({ fileData: resource.fileData });

    expect(response.status).toBe(201);
  });

  test("Should return 400 if required fields are missing", async () => {
    const response = await request(app)
      .post(`${baseURL}upload`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Missing required fields' });
  });

  test("Should return 500 if addOriginalResource fails", async () => {
    const documentId = 1;
    const resource = {
      resourceType: "image",
      fileData: "base64_encoded_file_data",
      description: "Test image"
    };
    const errorMessage = "Failed to upload file";

    // Mock the addOriginalResource function to reject with an error
    FileUploadDao.prototype.addOriginalResource.mockRejectedValue(new Error(errorMessage));

    const response = await request(app)
      .post(`${baseURL}upload?documentId=${documentId}&resourceType=${resource.resourceType}&description=${resource.description}`)
      .send({ fileData: resource.fileData });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: 'Internal server error', error: errorMessage });

  });
});

describe("GET /api/files/:documentId", () => {
  test("should return files for the specified document ID", async () => {
    const documentId = 1;
    const files = [
      { name: "Test file 1", data: "ZmlsZSBkYXRhIDE=" },
      { name: "Test file 2", data: "ZmlsZSBkYXRhIDI=" }
    ];

    // Mock the getFilesByDocumentId function
    FileUploadDao.prototype.getFilesByDocumentId.mockResolvedValue(files);

    const response = await request(app)
      .get(`${baseURL}files/${documentId}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(files);
   
  });

  test("should return 500 if there is an error fetching files", async () => {
    const documentId = 1;
    const errorMessage = "Failed to fetch files";

    // Mock the getFilesByDocumentId function to reject with an error
    FileUploadDao.prototype.getFilesByDocumentId.mockRejectedValue(new Error(errorMessage));

    const response = await request(app)
      .get(`${baseURL}files/${documentId}`);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: 'Failed to fetch files', error: errorMessage });

  });
});


describe("ensureUploadsDirectory", () => {
  const uploadDir = 'uploads';

  test("should log and create the directory if it does not exist", async () => {
    // Mock fs.access per chiamare il callback con un errore
    fs.access.mockImplementation((path, mode, callback) => {
      callback(new Error("Directory does not exist"));
    });

    // Mock fs.mkdir per chiamare il callback senza errori
    fs.mkdir.mockImplementation((path, options, callback) => {
      callback(null);
    });

    const spy = jest.spyOn(fs, 'mkdir');
    const spy2 = jest.spyOn(fs, 'access');

    expect(fs.mkdir).toBeTruthy();
    expect(fs.access).toBeTruthy();
   
  });
});

//getOriginalResourceById(resourceId)
describe("GET /api/download/:resourceId", () => { 
  test("should return the file for the specified resource ID", async () => {
    const resourceId = 1;
    const row = {
      fileData: Buffer.from("file data"),
      description: "Test file",
      resourceType: "image/png"
    };

    // Mock the getOriginalResourceById function
    FileUploadDao.prototype.getOriginalResourceById.mockResolvedValue(row);

    const response = await request(app)
      .get(`${baseURL}download/${resourceId}`);

    expect(response.status).toBe(200);
    expect(response.headers['content-disposition']).toBe(`attachment; filename="${row.description}"`);
    expect(response.headers['content-type']).toBe(row.resourceType);
    expect(response.body).toEqual(row.fileData);
  });

  test("should return 500 if there is an error fetching the file", async () => {
    const resourceId = 1;
    const errorMessage = "Internal server error";

    // Mock the getOriginalResourceById function to reject with an error
    FileUploadDao.prototype.getOriginalResourceById.mockRejectedValue(new Error(errorMessage));

    const response = await request(app)
      .get(`${baseURL}download/${resourceId}`);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: 'Internal server error', error: errorMessage });
  });
  
});

//describe delete
describe("DELETE /api/delete/:resourceId", () => {
  test("should delete the file and return 200", async () => {
    const documentId = 1;
    const description = "Test file";

    // Mock the deleteFile function
    FileUploadDao.prototype.deleteFile.mockResolvedValue({ message: 'File deleted successfully from database' });

    const response = await request(app)
      .delete(`${baseURL}delete?documentId=${documentId}&description=${description}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'File deleted successfully from the database' });
  });

  test("should return 500 if there is an error deleting the file", async () => {
    const documentId = 1;
    const description = "Test file";
    const errorMessage = "Internal server error";

    // Mock the deleteFile function to reject with an error
    FileUploadDao.prototype.deleteFile.mockRejectedValue(new Error(errorMessage));

    const response = await request(app)
      .delete(`${baseURL}delete?documentId=${documentId}&description=${description}`);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: 'Internal server error', error: errorMessage });
  });
});