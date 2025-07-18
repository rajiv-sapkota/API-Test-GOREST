// cypresponses/e2e/comments.cy.ts

describe("API tests for GOREST /comments endpoint", () => {
  let validPostId: number;
  let createdCommentId: number;

  before(() => {
    cy.request("GET", "/posts").then((res) => {
      validPostId = res.body[0].id;
    });
  });

  it("TC-CMNT-101: Get list of all comments", () => {
    cy.request("GET", "/comments").then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.be.an("array");
      res.body.forEach((comment: any) => {
        expect(comment).to.have.all.keys(
          "id",
          "post_id",
          "name",
          "email",
          "body"
        );
      });
    });
  });

  it("TC-CMNT-102: Create a valid comment", () => {
    const data = {
      post_id: validPostId,
      name: "Test User",
      email: "testuser@example.com",
      body: "This is a valid comment.",
    };
    cy.request({
      method: "POST",
      url: "/comments",
      headers: {
        Authorization: `Bearer ${Cypress.env("token")}`,
      },
      body: data,
    }).then((res) => {
      expect(res.status).to.eq(201);
      expect(res.body).to.include(data);
      createdCommentId = res.body.id;
      Cypress.env("createdCommentId", createdCommentId);
    });
  });

  it("TC-CMNT-103: Get a comment by valid ID", () => {
      cy.request({
          method: "GET",
          url: `/comments/${createdCommentId}`,
          headers: {
              Authorization: `Bearer ${Cypress.env("token")}`
          }
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.id).to.eq(createdCommentId);
      expect(res.body).to.have.all.keys(
        "id",
        "post_id",
        "name",
        "email",
        "body"
      );
    });
  });

  it("TC-CMNT-104: Update a comment body & name", () => {
    const update = {
      name: "Updated User",
      body: "Updated body only",
    };
    cy.request({
      method: "PUT",
      url: `/comments/${createdCommentId}`,
      headers: {
        Authorization: `Bearer ${Cypress.env("token")}`,
      },
      body: update,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.name).to.eq(update.name);
      expect(res.body.body).to.eq(update.body);
    });
  });

  it("TC-CMNT-105: Delete an existing comment", () => {
    cy.request({
      method: "DELETE",
      url: `/comments/${createdCommentId}`,
      headers: {
        Authorization: `Bearer ${Cypress.env("token")}`,
      },
    }).then((res) => {
      expect(res.status).to.eq(204);
    });
  });

  it("TC-CMNT-106: Create comment without name", () => {
    const data = {
      post_id: validPostId,
      email: "test@example.com",
      body: "Missing name field.",
    };
    cy.request({
      method: "POST",
      url: "/comments",
      headers: {
        Authorization: `Bearer ${Cypress.env("token")}`,
      },
      body: data,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(422);
      expect(res.body[0].field).to.eq("name");
    });
  });

  it("TC-CMNT-107: Create comment without email", () => {
    const data = {
      post_id: validPostId,
      name: "No Email",
      body: "Missing email",
    };
    cy.request({
      method: "POST",
      url: "/comments",
      headers: {
        Authorization: `Bearer ${Cypress.env("token")}`,
      },
      body: data,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(422);
      expect(res.body[0].field).to.eq("email");
    });
  });

  it("TC-CMNT-108: Create comment with invalid email format", () => {
    const data = {
      post_id: validPostId,
      name: "Invalid Email",
      email: "invalidemail",
      body: "Body is here",
    };
    cy.request({
      method: "POST",
      url: "/comments",
      headers: {
        Authorization: `Bearer ${Cypress.env("token")}`,
      },
      body: data,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(422);
      expect(res.body[0].field).to.eq("email");
      expect(res.body[0].message).to.include("invalid");
    });
  });

  it("TC-CMNT-109: Create comment without body", () => {
    const data = {
      post_id: validPostId,
      name: "Body Missing",
      email: "body@missing.com",
    };
    cy.request({
      method: "POST",
      url: "/comments",
      headers: {
        Authorization: `Bearer ${Cypress.env("token")}`,
      },
      body: data,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(422);
      expect(res.body[0].field).to.eq("body");
    });
  });

  it("TC-CMNT-110: Get comment with invalid ID", () => {
    cy.request({
      method: "GET",
      url: "/comments/99999999",
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(404);
      expect(res.body.message).to.include("Resource not found");
    });
  });

  it("TC-CMNT-111: Update comment with empty name & body", () => {
    const data = { name: "", body: "" };
    cy.request({
      method: "PUT",
      url: `/comments/${validPostId}`,
      headers: {
        Authorization: `Bearer ${Cypress.env("token")}`,
      },
      body: data,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(200);
    });
  });

  it("TC-CMNT-112: Delete comment with invalid ID", () => {
    cy.request({
      method: "DELETE",
      url: "/comments/9999999",
      headers: {
        Authorization: `Bearer ${Cypress.env("token")}`,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(404);
    });
  });

  it("TC-CMNT-113: Create comment with invalid post_id", () => {
    const data = {
      post_id: 9999999,
      name: "Wrong Post",
      email: "wrong@post.com",
      body: "This shouldn't work.",
    };
    cy.request({
      method: "POST",
      url: `/comments/`,
      headers: {
        Authorization: `Bearer ${Cypress.env("token")}`,
      },
      body: data,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(422);
      //expect(res.body[0].field).to.eq("post_id");
    });
  });

  it("TC-CMNT-114: List comments filtered by post_id", () => {
    cy.request(`GET`, `/comments?post_id=${validPostId}`).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.be.an("array");
      res.body.forEach((item: any) => {
        expect(item.post_id).to.eq(validPostId);
      });
    });
  });

  it("TC-CMNT-115: Create comment without authentication token", () => {
    const data = {
      post_id: validPostId,
      name: "No Token",
      email: "notoken@test.com",
      body: "Should be unauthorized.",
    };
    cy.request({
      method: "POST",
      url: "/comments",
      body: data,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401);
    });
  });
});
