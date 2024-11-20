import { describe, test, expect, jest, afterEach } from "@jest/globals";
import FileUploadDao from "../../dao/fileUpload.mjs";
import db from "../../db/db.mjs";

const document = new FileUploadDao();

afterEach(() => {
    jest.restoreAllMocks();
});

describe("addOriginalResource", () => {
    test("should insert a resource and resolve with the resourceId", async () => {
      // Arrange
      const documentId = 1;
      const resource = {
        resourceType: "image",
        fileData: Buffer.from("file data"),
        description: "Test image"
      };
      const lastID = 123;

      // Mock del metodo db.run per chiamare il callback senza errori e con un lastID
      jest.spyOn(db, "get").mockImplementation((query, params, callback) => {
        callback(null, { lastID });
      });
  
      // Act
      const result = await document.addOriginalResource(documentId, resource);
  
    expect(typeof result.resourceId).toBe("number");
   
    });

    test("should reject with an error message when the query fails", async () => {
        // Arrange
        const documentId = 1;
        const resource = 1;
        const errorMessage = "Cannot read properties of undefined (reading 'path')";
    
        // Mock del metodo db.run per chiamare il callback con un errore
        jest.spyOn(db, "get").mockImplementation((query, params, callback) => {
          callback(new Error());
        });
    
        // Act & Assert
        const result = await expect(document.addOriginalResource(documentId, resource)).rejects.toThrow(new Error(errorMessage));
        
        });
      });

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
            } );

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
    });

    describe("getOriginalResourceById", () => {
        test("should fetch a file and resolve with the file object", async () => {
            // Arrange
            const resourceId = 1;
            const row = {
              fileData: Buffer.from("file data"),
              description: "Test file",
              resourceType: "image"
            };
        
            // Mock del metodo db.get per chiamare il callback senza errori e con una riga
            jest.spyOn(db, "get").mockImplementation((query, params, callback) => {
              callback(null, row);
            });
        
            // Act
            const result = await document.getOriginalResourceById(resourceId);
        
            // Assert
            expect(result).toEqual(row);
            } );

            test("should reject with an error message when the query fails", async () => {
                // Arrange
                const resourceId = 1;
                const errorMessage = "Failed to fetch file";
            
                // Mock del metodo db.get per chiamare il callback con un errore
                jest.spyOn(db, "get").mockImplementation((query, params, callback) => {
                  callback(new Error(errorMessage));
                });
            
                // Act & Assert
                await expect(document.getOriginalResourceById(resourceId)).rejects.toThrow(errorMessage);
                expect(db.get).toHaveBeenCalledWith(
                  expect.any(String),
                  [resourceId],
                  expect.any(Function)
                );
              });
    });

