import { faker } from "@faker-js/faker";

describe("GOREST /todos API Tests", () => {
  let todoID: number;
  let userID: number;

  before(() => {
    cy.request("GET", "/users").then((res) => {
      userID = res.body[0].id;
      Cypress.env("userID", userID);
    });
  });

  const getDateOnly = () => faker.date.future().toISOString().split("T")[0];

  it("TC-TODOS-101: Get list of all todos", () => {
    cy.request("GET", "/todos").then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.be.an("array");
    });
  });

  it("TC-TODOS-102: Create a valid todo", () => {
    const testData = {
      user_id: userID,
      title: faker.lorem.sentence(),
      due_on: getDateOnly(),
      status: "pending",
    };
    cy.request({
      method: "POST",
      url: "/todos",
      headers: {
        Authorization: `Bearer ${Cypress.env("token")}`,
      },
      body: testData,
    }).then((res) => {
      expect(res.status).to.eq(201);
      expect(res.body).to.include({
        title: testData.title,
        user_id: testData.user_id,
        status: testData.status,
      });
      todoID = res.body.id;
      Cypress.env("todoID", todoID);
    });
  });

  it("TC-TODOS-103: Get a todo by valid ID", () => {
    const id = Cypress.env("todoID");
    cy.request({
      method: "GET",
      url: `/todos/${id}`,
      headers: {
        Authorization: `Bearer ${Cypress.env("token")}`,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.all.keys(
        "id",
        "user_id",
        "title",
        "due_on",
        "status"
      );
    });
  });

  it("TC-TODOS-104: Update todo title & status", () => {
    const id = Cypress.env("todoID");
    const updateData = {
      title: "Updated title",
      status: "completed",
    };
    cy.request({
      method: "PUT",
      url: `/todos/${id}`,
      headers: {
        Authorization: `Bearer ${Cypress.env("token")}`,
      },
      body: updateData,
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.title).to.eq(updateData.title);
      expect(res.body.status).to.eq(updateData.status);
    });
  });

  it("TC-TODOS-105: Delete an existing todo", () => {
    const id = Cypress.env("todoID");
    cy.request({
      method: "DELETE",
      url: `/todos/${id}`,
      headers: {
        Authorization: `Bearer ${Cypress.env("token")}`,
      },
    }).then((res) => {
      expect(res.status).to.eq(204);
    });
  });

  it("TC-TODOS-106: Create todo without title", () => {
    const testData = {
      user_id: userID,
      due_on: getDateOnly(),
      status: "pending",
    };
    cy.request({
      method: "POST",
      url: "/todos",
      headers: {
        Authorization: `Bearer ${Cypress.env("token")}`,
      },
      body: testData,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(422);
    });
  });

  it("TC-TODOS-107: Create todo without due_on", () => {
    const testData = {
      user_id: userID,
      title: "Missing due_on",
      status: "pending",
    };
    cy.request({
      method: "POST",
      url: "/todos",
      headers: {
        Authorization: `Bearer ${Cypress.env("token")}`,
      },
      body: testData,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(201);
      expect(res.body).to.have.property("due_on", null);
    });
  });

  it("TC-TODOS-108: Create todo with invalid status", () => {
    const testData = {
      user_id: userID,
      title: "Invalid status",
      due_on: getDateOnly(),
      status: "not-valid",
    };
    cy.request({
      method: "POST",
      url: "/todos",
      headers: {
        Authorization: `Bearer ${Cypress.env("token")}`,
      },
      body: testData,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(422);
    });
  });

  it("TC-TODOS-109: Create todo with invalid user_id", () => {
    const testData = {
      user_id: 0,
      title: "Invalid user",
      due_on: getDateOnly(),
      status: "pending",
    };
    cy.request({
      method: "POST",
      url: "/todos",
      headers: {
        Authorization: `Bearer ${Cypress.env("token")}`,
      },
      body: testData,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(422);
    });
  });

  it("TC-TODOS-110: Get todo with invalid ID", () => {
    cy.request({
      method: "GET",
      url: "/todos/999999",
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(404);
      expect(res.body.message).to.eq("Resource not found");
    });
  });

  it("TC-TODOS-111: Update todo with empty title", () => {
    const updateData = {
      title: "",
      status: "pending",
    };

    cy.request("GET", "/todos").then((response) => {
      const newTodoId = response.body[0].id;

      cy.request({
        method: "PUT",
        url: `/todos/${newTodoId}`,
        headers: {
          Authorization: `Bearer ${Cypress.env("token")}`,
        },
        body: updateData,
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.body).to.deep.equal([
          {
            field: "title",
            message: "can't be blank",
          },
        ]);
      });
    });
  });

  it("TC-TODOS-112: List todos filtered by user_id", () => {
    cy.request(`GET`, `/todos?user_id=${userID}`).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.be.an("array");
    });
  });

  it("TC-TODOS-113: List todos filtered by status = completed", () => {
    cy.request(`GET`, `/todos?status=completed`).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.be.an("array");
    });
  });

  it("TC-TODOS-114: Unauthorized create todo (missing token)", () => {
    const testData = {
      user_id: userID,
      title: "Unauthorized",
      due_on: getDateOnly(),
      status: "pending",
    };
    cy.request({
      method: "POST",
      url: "/todos",
      body: testData,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401);
    });
  });

  it("TC-TODOS-115: Delete todo with invalid ID", () => {
    cy.request({
      method: "DELETE",
      url: "/todos/999999",
      headers: {
        Authorization: `Bearer ${Cypress.env("token")}`,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(404);
    });
  });
});
