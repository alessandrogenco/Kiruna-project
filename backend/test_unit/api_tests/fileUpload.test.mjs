import { describe, test, expect, jest, afterEach, afterAll } from "@jest/globals";
import request from "supertest";
import { app, server } from "../../index.mjs";
import FileUploadDao from "../../dao/fileUpload.mjs";

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

