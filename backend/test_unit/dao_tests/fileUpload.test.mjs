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
        const errorMessage = "Failed to upload file";
    
        // Mock del metodo db.run per chiamare il callback con un errore
        jest.spyOn(db, "get").mockImplementation((query, params, callback) => {
          callback(new Error());
        });
    
        // Act & Assert
        const result = await expect(document.addOriginalResource(documentId, resource)).rejects.toThrow(new Error(errorMessage));
        
        });

});