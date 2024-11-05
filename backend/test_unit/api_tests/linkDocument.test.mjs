import { describe, test, expect, jest, afterEach } from "@jest/globals";
import { server } from "../../index.mjs";
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

        const app = (await import("../../index")).app;
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
        const app = (await import("../../index")).app;
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
        const app = (await import("../../index")).app;
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

        const app = (await import("../../index")).app;
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

        const app = (await import("../../index")).app;
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
