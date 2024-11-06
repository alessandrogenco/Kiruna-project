import { describe, test, expect, jest, afterEach } from "@jest/globals";
import { app, server } from "../../index.mjs";
import request from "supertest";
import DocumentDao from "../../dao/document.mjs";

const document = new DocumentDao();
const baseURL = "/api/";

afterEach(() => {
    jest.restoreAllMocks();
});

afterAll(() => {
    server.close();
});

describe("POST Link Documents", () => {
    test("Successfully links documents with valid data", async () => {
        const spyDao = jest.spyOn(DocumentDao.prototype, "linkDocuments").mockResolvedValueOnce({
            idDocument1: 1,
            idDocument2: 2,
            date: "2024-11-05",
            type: "Informative document",
        });

        const response = await request(app).post(baseURL + "linkDocuments").send({
            id1: 1,
            id2: 2,
            linkDate: "2024-11-05",
            linkType: "Informative document",
        });

        expect(response.status).toBe(200);
        expect(spyDao).toHaveBeenCalledTimes(1);
        expect(spyDao).toHaveBeenCalledWith(1, 2, "2024-11-05", "Informative document");
        expect(response.body).toEqual({
            message: "Documents linked successfully",
            link: {
                idDocument1: 1,
                idDocument2: 2,
                date: "2024-11-05",
                type: "Informative document",
            },
        });
    });

    test("Should return 400 if link Date is an empty string", async () => {
        const response = await request(app).post(baseURL + "linkDocuments").send({
            id1: 1,
            id2: 2,
            linkDate: "",
            linkType: "Informative document",
        });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            message: "The link date must be a non-empty string",
        });
    });

    test("Should return 400 if Link Type is an empty string", async () => {
        const response = await request(app).post(baseURL + "linkDocuments").send({
            id1: 1,
            id2: 2,
            linkDate: "2024-11-05",
            linkType: "",
        });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            message: "The link type must be a non-empty string",
        });
    });

    test("Should return 409 if link already exists", async () => {
        const spyDao = jest.spyOn(DocumentDao.prototype, "linkDocuments").mockRejectedValueOnce(new Error("Link already exists"));

        const response = await request(app).post(baseURL + "linkDocuments").send({
            id1: 1,
            id2: 2,
            linkDate: "2024-11-05",
            linkType: "Informative document",
        });

        expect(response.status).toBe(409);
        expect(spyDao).toHaveBeenCalledTimes(1);
        expect(response.body).toEqual({
            message: "Link already exists",
        });
    });

    test("Should return 400 if an unexpected error occurs", async () => {
        const spyDao = jest.spyOn(DocumentDao.prototype, "linkDocuments").mockRejectedValueOnce(new Error("Unexpected error"));

        const response = await request(app).post(baseURL + "linkDocuments").send({
            id1: 1,
            id2: 2,
            linkDate: "2024-11-05",
            linkType: "Informative document",
        });

        expect(response.status).toBe(400);
        expect(spyDao).toHaveBeenCalledTimes(1);
        expect(response.body).toEqual({
            message: "Unexpected error",
        });
    });
});


describe("GET Document Links", () => {

    test("Successfully fetches document links", async () => {
        const mockLinks = [
            { idDocument1: 1, idDocument2: 2, date: "2024-11-05", type: "Reference" },
            { idDocument1: 1, idDocument2: 3, date: "2024-11-06", type: "Supplementary" }
        ];
        jest.spyOn(DocumentDao.prototype, "getDocumentLinks").mockResolvedValueOnce(mockLinks);

        const response = await request(app).get(baseURL + "documentLinks/1");

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            message: "Document links fetched successfully",
            links: mockLinks
        });
    });

    test("Returns a message if no links are found for the document", async () => {
        jest.spyOn(DocumentDao.prototype, "getDocumentLinks").mockResolvedValueOnce({ message: "No links found for this document" });

        const response = await request(app).get(baseURL + "documentLinks/1");

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            message: "No links found for this document"
        });
    });

    test("Should return 400 if an invalid document ID is provided", async () => {
        jest.spyOn(DocumentDao.prototype, "getDocumentLinks").mockRejectedValueOnce(new Error("Invalid document ID"));

        const response = await request(app).get(baseURL + "documentLinks/invalidId");

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            message: "Invalid document ID"
        });
    });

    test("Should handle internal server errors", async () => {
        jest.spyOn(DocumentDao.prototype, "getDocumentLinks").mockRejectedValueOnce(new Error("Internal server error"));

        const response = await request(app).get(baseURL + "documentLinks/1");

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            message: "Internal server error"
        });
    });
});


describe("PUT links", () => {
    test("Successfully updates a link", async () => {
        const spyDao = jest.spyOn(DocumentDao.prototype, "updateLink").mockResolvedValueOnce({
            idDocument1: 1,
            idDocument2: 2,
            newLinkDate: "2024-11-05",
            newLinkType: "Informative document"
        });

        const response = await request(app).put(baseURL + "links").send({
            idDocument1: 1,
            idDocument2: 2,
            newLinkDate: "2024-11-05",
            newLinkType: "Informative document"
        });

        expect(response.status).toBe(200);
        expect(spyDao).toHaveBeenCalledTimes(1);
        expect(spyDao).toHaveBeenCalledWith(1, 2, "2024-11-05", "related");
        expect(response.body).toEqual({
            message: 'Link updated successfully',
            link: {
                idDocument1: 1,
                idDocument2: 2,
                newLinkDate: "2024-11-05",
                newLinkType: "Informative document"
            }
        });
    });

    test("Should reject if newLinkDate is an empty string", async () => {
        const response = await request(app).put(baseURL + "links").send({
            idDocument1: 1,
            idDocument2: 2,
            newLinkDate: "",
            newLinkType: "Informative document"
        });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            message: 'The new link date must be a non-empty string'
        });
    });

    test("Should reject if newLinkType is an empty string", async () => {
        const response = await request(app).put(baseURL + "links").send({
            idDocument1: 1,
            idDocument2: 2,
            newLinkDate: "2024-11-05",
            newLinkType: ""
        });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            message: 'The new link type must be a non-empty string'
        });
    });

    test("Should return 404 if the link is not found", async () => {
        const spyDao = jest.spyOn(DocumentDao.prototype, "updateLink").mockRejectedValueOnce(new Error('Link not found'));

        const response = await request(app).put(baseURL + "links").send({
            idDocument1: 1,
            idDocument2: 2,
            newLinkDate: "2024-11-05",
            newLinkType: "Informative"
        });

        expect(response.status).toBe(404);
        expect(response.body).toEqual({
            message: 'Link not found'
        });
        expect(spyDao).toHaveBeenCalledTimes(1);
    });
});