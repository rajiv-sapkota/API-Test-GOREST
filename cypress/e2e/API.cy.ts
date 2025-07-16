import { generateFakeuser } from "../fakerData/data";
const userData = generateFakeuser();

describe("API test using Cypress for GOREST API", () => {
  let userId: number;
  let invalidId: number = 123;
  let userEmail: string;
  before(() => {
    cy.request("GET", "/users").then((response) => {
      userId = response.body[0].id;
      userEmail = response.body[0].email;
    });
  });

  it("TC-101:Should get all the users", () => {
    cy.request("GET", "/users").then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body).to.be.an("array");
      response.body.forEach((user: any) => {
        expect(user).to.have.all.keys(
          "id",
          "name",
          "email",
          "gender",
          "status"
        );
      });
    });
  });

  it("TC-102:Should get user by valid id", () => {
    expect(userId).to.exist;
    cy.request("GET", `/users/${userId}`).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body).to.have.all.keys(
        "id",
        "name",
        "email",
        "gender",
        "status"
      );
    });
  });

  it("TC-103:Assert response for invalid id", () => {
    cy.request({
      method: "GET",
      url: `/users/${invalidId}`,
      headers: {
        Authorization: Cypress.env("token"),
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.equal(404);
      expect(response.body.message).to.eq("Resource not found");
    });
  });

  it("TC-104:Should create new user with valid data", () => {
    const data = {
      name: userData.firstName,
      email: userData.email,
      gender: userData.gender,
      status: "active",
    };

    cy.request({
      method: "POST",
      url: "/users",
      headers: {
        Authorization: `Bearer ${Cypress.env("token")}`,
      },
      body: data,
    }).then((response) => {
      expect(response.status).to.equal(201);
      expect(response.body).to.have.property("id");
      expect(response.body).to.include({
        name: data.name,
        email: data.email,
        gender: data.gender,
        status: data.status,
      });
    });
  });

  it("TC-105:Should try to create user without email and validate response", () => {
    const data = {
      name: userData.firstName,
      gender: userData.gender,
      status: "active",
    };

    cy.request({
      method: "POST",
      url: "/users",
      headers: {
        Authorization: `Bearer ${Cypress.env("token")}`,
      },
      body: data,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.equal(422);
      expect(response.body[0]).to.include({
        field: "email",
        message: "can't be blank",
      });
    });
  });

  it("TC-106:Should try to create user with invalid email and assert response", () => {
    const data = {
      name: userData.firstName,
      email: "testmail.com",
      gender: userData.gender,
      status: "active",
    };
    cy.request({
      method: "POST",
      url: "/users",
      headers: {
        Authorization: `Bearer ${Cypress.env("token")}`,
      },
      body: data,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.equal(422);
      expect(response.body[0]).to.have.property("field", "email");
      expect(response.body[0]).to.have.property("message", "is invalid");
    });
  });

  it("TC-107:Should try to create user with duplicate email and assert response", () => {
    const data = {
      name: userData.firstName,
      email: userEmail,
      gender: userData.gender,
      status: "active",
    };
    cy.request({
      method: "POST",
      url: "/users",
      headers: {
        Authorization: `Bearer ${Cypress.env("token")}`,
      },
      body: data,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.equal(422);
      expect(response.body[0]).to.have.property("field", "email");
      expect(response.body[0]).to.have.property(
        "message",
        "has already been taken"
      );
    });
  });

  it("TC-108:Should try to get users of page 2 and assert response", () => {
    cy.request({
      method: "GET",
      url: "/users?page=2",
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body).to.be.an("array");
      response.body.forEach((user: any) => {
        expect(user).to.have.all.keys(
          "id",
          "name",
          "email",
          "gender",
          "status"
        );
      });
    });
  });
  //works single but not when all are run
  it("TC-109:Should update user details and assert response", () => {
    const data = {
      name: userData.firstName,
      email: userData.email,
      gender: userData.gender,
      status: "active",
    };

    cy.request({
      method: "PUT",
      url: `users/${userId}`,
      headers: {
        Authorization: `Bearer ${Cypress.env("token")}`,
      },
      body: data,
      failOnStatusCode: false,
    }).then((response) => {
      Cypress.log({
        name: "Log",
        message: " Checking user ID and other details....",
      });
      expect(response.body.id).to.equal(userId);

      expect(response.body).to.include({
        id: userId,
        name: data.name,
        gender: data.gender,
        status: data.status,
        email: data.email,
      });
    });
  });

  it("TC-110:Should try to update non existant user and assert response", () => {
    const data = {
      name: userData.firstName,
      email: userData.email,
      gender: userData.gender,
      status: "active",
    };
    cy.request({
      method: "PUT",
      url: "/users/2sw2w23",
      headers: {
        Authorization: `Bearer ${Cypress.env("token")}`,
      },
      body: data,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.equal(404);
      expect(response.body).to.have.property("message", "Resource not found");
    });
  });

  it("TC-111:Should try to update user without body and assert response ", () => {
    cy.request({
      method: "PUT",
      url: `/users/${userId}`,
      headers: {
        Authorization: `Bearer ${Cypress.env("token")}`,
      },

      //failOnStatusCode:false
    }).then((response) => {
      expect(response.status).to.equal(200);
    });
  });

  it("TC-112:Should delete a existing user and assert response", () => {
    cy.request({
      method: "DELETE",
      url: `/users/${userId}`,
      headers: {
        Authorization: `Bearer ${Cypress.env("token")}`,
      },
    }).then((response) => {
      expect(response.status).to.equal(204);
    });
  });

  it("TC-114:Should try to delete an user with invalid id and assert response", () => {
    cy.request({
      method: "DELETE",
      url: "/users/${invalidId}",
      headers: {
        Authorization: `Bearer ${Cypress.env("token")}`,
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.equal(404);
      expect(response.body).to.have.property("message", "Resource not found");
    });
  });

  it("TC-113:Should try to delete a already deleted user and assert response", () => {
    cy.log("Deleting a user");
    cy.request({
      method: "DELETE",
      url: `/users/${userId}`,
      headers: {
        Authorization: `Bearer ${Cypress.env("token")}`,
      },
    }).then((response) => {
      expect(response.status).to.equal(204);
    });
    cy.log("Trying to delete same user again");
    cy.request({
      method: "DELETE",
      url: `/users/${userId}`,
      headers: {
        Authorization: `Bearer ${Cypress.env("token")}`,
      },
      failOnStatusCode: false, // Prevent Cypress from failing on 404
    }).then((res) => {
      expect(res.status).to.eq(404);
      expect(res.body).to.have.property("message", "Resource not found");
    });
  });

  it.only("TC-115:Should try to create a user with invalid gender and assert response ", () => {});
});
