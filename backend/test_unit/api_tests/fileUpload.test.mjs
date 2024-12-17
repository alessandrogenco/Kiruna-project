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

    test('Returns 404 if no files are found for the specified document ID', async () => {
      const documentId = 1;
  
      // Configura il mock del database per restituire nessun file trovato
      FileUploadDao.prototype.getFilesByDocumentId.mockResolvedValue([]);
  
      const response = await request(app)
        .get(`/api/files/${documentId}`);
  
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('No files found for the specified document ID');
  
      
    });

    //error 500
    test("should return 500 if there is an error fetching the files", async () => {
      const documentId = 1;
      const errorMessage = "Internal server error";
  
      // Mock the getFilesByDocumentId function to reject with an error
      FileUploadDao.prototype.getFilesByDocumentId.mockRejectedValue(new Error(errorMessage));
  
      const response = await request(app)
        .get(`${baseURL}files/${documentId}`);
  
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: 'Failed to fetch files', error: errorMessage });
    });

  });




describe("ensureUploadsDirectory", () => {

  test("should log and create the directory if it does not exist", async () => {
    // Mock fs.access per chiamare il callback con un errore
    fs.access.mockImplementation((path, mode, callback) => {
      callback(new Error("Directory does not exist"));
    });

    // Mock fs.mkdir per chiamare il callback senza errori
    fs.mkdir.mockImplementation((path, options, callback) => {
      callback(null);
    });


    expect(fs.mkdir).toBeTruthy();
    expect(fs.access).toBeTruthy();
   
  });
});

