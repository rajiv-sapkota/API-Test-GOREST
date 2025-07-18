import { generateFakeuser } from "../fakerData/data";
const data = generateFakeuser();
describe("API tests using Cypress for GOREST API POSTS", () => {
  let userId: number;
  let postID: number;
  let postId: number;

  before(() => {
    // Fetch a valid user to associate the post with
    cy.request("GET", "/users").then((response) => {
      userId = response.body[0].id;
    });
    cy.request("GET", "/posts").then((response) => {
      postId = response.body[0].id;
    });
  });

  it("TC-POSTS-101: Should get all the Posts of the Users", () => {
    cy.request("GET", "/posts").then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body).to.be.an("array");
      response.body.forEach((post: any) => {
        expect(post).to.have.all.keys("id", "user_id", "title", "body");
      });
    });
  });

  it("TC-POSTS-102: Should create a new post with valid data", () => {
    const postData = {
      user_id: userId,
      title: "Test Post",
      body: "This is a test post.",
    };

    cy.request({
      method: "POST",
      url: "/posts",
      headers: {
        Authorization: `Bearer ${Cypress.env("token")}`,
      },
      body: postData,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.include(postData);
      postID = response.body.id;
      Cypress.env("postID", postID);
    });
  });

  it("TC-POSTS-103: Should get a post by valid ID", () => {
    const id = Cypress.env("postID");
    cy.request({
      method: "GET",
      url: `/posts/${id}`,
      headers: {
        Authorization: `Bearer ${Cypress.env("token")}`,
      },
    }).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body).to.have.all.keys("id", "user_id", "title", "body");
      expect(response.body.id).to.equal(id);
    });
  });

  it("TC-POSTS-104: Should update the post with valid data", () => {
    const updatedData = {
      title: "Updated  Post",
      body: "Updated content",
    };
    const id = Cypress.env("postID");

    cy.request({
      method: "PUT",
      url: `/posts/${id}`,
      headers: {
        Authorization: `Bearer ${Cypress.env("token")}`,
      },
      body: updatedData,
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.title).to.eq(updatedData.title);
      expect(res.body.body).to.eq(updatedData.body);
    });
  });
  it("TC-POSTS-205: Should delete the created post", () => {
    const id = Cypress.env("postID");
    cy.request({
      method: "DELETE",
      url: `/posts/${id}`,
      headers: {
        Authorization: `Bearer ${Cypress.env("token")}`,
      },
    }).then((res) => {
      expect(res.status).to.eq(204);
    });
  });
  it("TC-POSTS-106: Should try to create a new post without title", () => {
    const postData = {
      user_id: userId,
      body: "This is a test post.",
    };

    cy.request({
      method: "POST",
      url: "/posts",
      headers: {
        Authorization: `Bearer ${Cypress.env("token")}`,
      },
      body: postData,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(422);
      expect(response.body[0]).to.include({
        field: "title",
        message: "can't be blank",
      });
    });
  });
  it("TC-POSTS-107: Should try to create a new post without body", () => {
    cy.request({
      method: "POST",
      url: "/posts",
      headers: {
        Authorization: `Bearer ${Cypress.env("token")}`,
      },

      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(422);
      expect(response.body).to.deep.equal([
        {
          field: "user",
          message: "must exist",
        },
        {
          field: "user_id",
          message: "is not a number",
        },
        {
          field: "title",
          message: "can't be blank",
        },
        {
          field: "body",
          message: "can't be blank",
        },
      ]);
    });
  });

  it("TC-POSTS-108: Should try to create a new post with invalid user id", () => {
    const postData = {
      user_id: `${userId}+"a"`,
      body: "This is a test post.",
      title: "Test",
    };

    cy.request({
      method: "POST",
      url: "/posts",
      headers: {
        Authorization: `Bearer ${Cypress.env("token")}`,
      },
      body: postData,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(422);
      expect(response.body[0]).to.include({
        field: "user_id",
        message: "is not a number",
      });
    });
  });
  it("TC-POSTS-109: Should get a post by invalid ID", () => {
    const id = Cypress.env("postID");
    cy.request({
      method: "GET",
      url: `/posts/${id}+"a"`,
      headers: {
        Authorization: `Bearer ${Cypress.env("token")}`,
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.equal(404);
      expect(response.body).to.have.property("message", "Resource not found");
    });
  });
  it("TC-POSTS-110: Should try to update a post with empty body and title", () => {
    const postData = {
      user_id: `${userId}`,
    };

    cy.request({
      method: "POST",
      url: "/posts",
      headers: {
        Authorization: `Bearer ${Cypress.env("token")}`,
      },
      body: postData,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(422);
      expect(response.body).to.deep.equal([
        {
          field: "title",
          message: "can't be blank",
        },
        {
          field: "body",
          message: "can't be blank",
        },
      ]);
    });
  });
  it("TC-POSTS-111: Should list posts filtered by valid user id", () => {
    cy.request({
      method: "GET",
      url: `/posts?${userId}`,
      headers: {
        Authorization: `Bearer ${Cypress.env("token")}`,
      },
    }).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body).to.be.an("array");
      expect(response.body[0].user_id).to.equal(userId);
    });
  });
  it("TC-POSTS-112: Should list posts filtered by valid user id", () => {
    cy.request({
      method: "GET",
      url: `/posts?page=999`,
      headers: {
        Authorization: `Bearer ${Cypress.env("token")}`,
      },
    }).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body).to.be.an("array");
      expect(response.body).to.have.length(0);
    });
  });
  it("TC-POSTS-113: Should try to create a duplicate post", () => {
    const postData = {
      user_id: userId,
      title: "Test Post",
      body: "This is a test post.",
    };

    cy.request({
      method: "POST",
      url: "/posts",
      headers: {
        Authorization: `Bearer ${Cypress.env("token")}`,
      },
      body: postData,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.include(postData);
      postID = response.body.id;
      Cypress.env("postID", postID);
    });
  });
  it("TC-POSTS-114: Should try to creater post with too long title length", () => {
    const postData = {
      user_id: userId,
      title: data.title,
      body: "This is a test post.",
    };

    cy.request({
      method: "POST",
      url: "/posts",
      headers: {
        Authorization: `Bearer ${Cypress.env("token")}`,
      },
      body: postData,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(422);
      expect(response.body).to.deep.equal([
        {
          field: "title",
          message: "is too long (maximum is 200 characters)",
        },
      ]);
    });
  });
  it("TC-POSTS-115: Should try to update the post without Auth tooken", () => {
    const updatedData = {
      title: "Updated  Post",
      body: "Updated content",
    };

    cy.request({
      method: "PUT",
      url: `/posts/${postId}`,

      body: updatedData,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body).to.have.property(
        "message",
        "Authentication failed"
      );
    });
  });
  it("TC-POSTS-116: Should delete the post without auth token", () => {
    cy.request({
      method: "PUT",
      url: `/posts/${postId}`,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body).to.have.property(
        "message",
        "Authentication failed"
      );
    });
  });
  it("TC-POSTS-117: Should try to update the post with only title", () => {
    const updatedData = {
      title: "Updated  Post",
    };

    cy.request({
      method: "PUT",
      url: `/posts/${postId}`,

      body: updatedData,
      headers: {
        Authorization: `Bearer ${Cypress.env("token")}`,
      },
      failOnStatusCode: false,
    }).then((response) => {
      console.log(response.body);
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property("title", updatedData.title);
    });
  });
  it("TC-POSTS-118:Should test if default headers are returned with response body", () => {
    cy.request({
      method: "HEAD",
        url: "/posts",
      failOnStatusCode:false
    }).then((response) => {
        expect(response.status).to.eq(404)
      expect(response.headers).to.exist;
      expect(response.body).to.be.empty;
    });
  });
});
