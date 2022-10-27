/* eslint-disable no-undef */
const request = require("supertest");

const db = require("../models/index");
const app = require("../app");
const todo = require("../models/todo");
let server, agent;

describe("Todo test suite ", () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(3000, () => {});
    agent = request.agent(server);
  });
  afterAll(async () => {
    await db.sequelize.close();
    server.close();
  });
  test("responds with json at /todos", async () => {
    const response = await agent.post("/todos").send({
      title: "buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
    });
    expect(response.statusCode).toBe(200);
    expect(response.header["content-type"]).toBe(
      "application/json; charset=utf-8"
    );
    const parsedResponse = JSON.parse(response.text);
    expect(parsedResponse.id).toBeDefined();
  });
  test("mark as complete", async () => {
    const response = await agent.post("/todos").send({
      title: "buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
    });
    const parsedResponse = JSON.parse(response.text);
    const todoID = parsedResponse.id;
    expect(parsedResponse.completed).toBe(false);
    const markAscompleteresponse = await agent
      .put(`/todos/${todoID}/markAsCompleted`)
      .send();
    const parsedUpdateResponse = (JSON.parsedUpdatedResponse = JSON.parse(
      markAscompleteresponse.text
    ));
    expect(parsedUpdateResponse.completed).toBe(true);
  });
  test(" Delete todo using ID", async () => {
    const response = await agent.post("/todos").send({
      title: "Delete todo",
      dueDate: new Date().toISOString(),
      completed: false,
    });
    const parsedResponse = JSON.parse(response.text);
    const todoID = parsedResponse.id;
    expect(parsedResponse.title).toBe("Delete todo");
    const deletetodo = await agent.delete(`/todos/${todoID}`);
    const parsedremoveResponse = JSON.parse(deletetodo.text);
    expect(parsedremoveResponse).toBe(true);
  });
});
