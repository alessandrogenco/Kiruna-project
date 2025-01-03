import { describe, test, expect, jest, afterEach } from "@jest/globals";
import FileUploadDao from "../../dao/fileUpload.mjs";
import db from "../../db/db.mjs";
import fs from 'fs';

const document = new FileUploadDao();

afterEach(() => {
    jest.restoreAllMocks();
});

    //describe add original resources
    describe("addOriginalResources", () => {
      test("should insert resources and resolve with resource IDs", async () => {
          // Arrange
          const documentId = 1;
          const files = [
              { path: 'path/to/file1', mimetype: 'image/png', originalname: 'file1.png' },
              { path: 'path/to/file2', mimetype: 'image/jpeg', originalname: 'file2.jpg' }
          ];
          const fileBuffers = [Buffer.from('file data 1'), Buffer.from('file data 2')];
          const lastIDs = [456, 456];

          // Mock fs.readFile to call the callback with file buffers
          jest.spyOn(fs, "readFile").mockImplementation((filePath, callback) => {
              const index = files.findIndex(file => file.path === filePath);
              callback(null, fileBuffers[index]);
          });

          // Mock db.run to call the callback with lastID
          jest.spyOn(db, "run").mockImplementation(function (query, params, callback) {
            callback.call({ lastID: lastIDs[1] }, null);
        });

        // Act
        const result = await document.addOriginalResources(documentId, files);

        // Assert
        expect(result).toEqual({ resourcesIds: lastIDs.map(id => ({ resourceId: id })) });
    });

    test("should reject with an error message when reading a file fails", async () => {
      // Arrange
      const documentId = 1;
      const files = [
          { path: 'path/to/file1', mimetype: 'image/png', originalname: 'file1.png' }
      ];
      const errorMessage = "Failed to read file";

      // Mock fs.readFile to call the callback with an error
      jest.spyOn(fs, "readFile").mockImplementation((filePath, callback) => {
          callback(new Error(errorMessage));
      });

      // Act & Assert
      await expect(document.addOriginalResources(documentId, files)).rejects.toThrow(errorMessage);
      expect(fs.readFile).toHaveBeenCalledTimes(files.length);
    
  });


  //error in db run

  test("should reject with an error message when the query fails", async () => {
    // Arrange
    const documentId = 1;
    const files = [
      { path: 'path/to/file1', mimetype: 'image/png', originalname: 'file1.png' }
    ];
    const errorMessage = "Failed to upload file";

    // Mock fs.readFile to call the callback with file buffers
    jest.spyOn(fs, "readFile").mockImplementation((filePath, callback) => {
      callback(null, Buffer.from('file data'));
    });

    // Mock db.run to call the callback with an error
    jest.spyOn(db, "run").mockImplementation((query, params, callback) => {
      callback(new Error(errorMessage));
    });

    // Act & Assert
    await expect(document.addOriginalResources(documentId, files)).rejects.toThrow(errorMessage);
    expect(fs.readFile).toHaveBeenCalledTimes(files.length);
    expect(db.run).toHaveBeenCalledTimes(files.length);
  } );

  } );

  //get files by document id
  describe("getFilesByDocumentId", () => {
    test("should fetch files and resolve with the files array", async () => {
      // Arrange
      const documentId = 1;
      const rows = [
        { description: "Test file 1", fileData: Buffer.from("file data 1") },
        { description: "Test file 2", fileData: Buffer.from("file data 2") }
      ];
  
      // Mock del metodo db.all per chiamare il callback senza errori e con delle righe
      jest.spyOn(db, "all").mockImplementation((query, params, callback) => {
        callback(null, rows);
      });
    
  
      // Act
      const result = await document.getFilesByDocumentId(documentId);
  
      // Assert
      expect(result).toEqual([
        { name: "Test file 1", data: "ZmlsZSBkYXRhIDE=" },
        { name: "Test file 2", data: "ZmlsZSBkYXRhIDI=" }
      ]);
      expect(db.all).toHaveBeenCalledWith(
        expect.any(String),
        [documentId],
        expect.any(Function)
      );
    });


    //test error in db all

    test("should reject with an error message when the query fails", async () => {
      // Arrange
      const documentId = 1;
      const errorMessage = "Failed to fetch files";
  
      // Mock del metodo db.all per chiamare il callback con un errore
      jest.spyOn(db, "all").mockImplementation((query, params, callback) => {
        callback(new Error(errorMessage));
      });
  
      // Act & Assert
      await expect(document.getFilesByDocumentId(documentId)).rejects.toThrow(errorMessage);
      expect(db.all).toHaveBeenCalledWith(
        expect.any(String),
        [documentId],
        expect.any(Function)
      );

    });
  } );  

