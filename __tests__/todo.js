/* eslint-disable no-undef */
const request = require("supertest");
var cheerio = require("cheerio");
const db = require("../models/index");
const app = require("../app");
//const todo = require("../models/todo");
let server, agent;
function extractCsrfToken(res) {
  var $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}
const login = async (agent, username, password) => {
  let res = await agent.get("/login");
  let csrfToken = extractCsrfToken(res);
  res = await agent.post("/session").send({
    email: username,
    password: password,
    _csrf: csrfToken,
  });
};

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

  test("Signup", async () => {
    let res = await agent.get("/signup");
    const csrfToken = extractCsrfToken(res);
    res = await agent.post("/users").send({
      firstName: "Test",
      lastName: "User A",
      email: "reddy123@gmail.com",
      password: "12345",
      _csrf: csrfToken,
    });
    expect(res.statusCode).toBe(302);
  });

  test("Sign out", async () => {
    let res = await agent.get("/todo");
    expect(res.statusCode).toBe(200);
    res = await agent.get("/signout");
    expect(res.statusCode).toBe(302);
    res = await agent.get("/todo");
    expect(res.statusCode).toBe(302);
  });

  test("responds with json at /todos", async () => {
    const agent = request.agent(server);
    await login(agent, "reddy123@gmail.com", "12345");
    const res = await agent.get("/todo");
    const csrfToken = extractCsrfToken(res);
    response = await agent.post("/todos").send({
      title: "buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302); //http status code
  });
  test("mark as complete", async () => {
    const agent = request.agent(server);
    await login(agent, "reddy123@gmail.com", "12345");
    let res = await agent.get("/todo");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    const groupedTodosResponse = await agent
      .get("/todo")
      .set("Accept", "application/json");

    const parsedGroupedResponse = JSON.parse(groupedTodosResponse.text);
    const dueTodayCount = parsedGroupedResponse.dueToday.length;
    const newTodo = parsedGroupedResponse.dueToday[dueTodayCount - 1];

    res = await agent.get("/todo");
    csrfToken = extractCsrfToken(res);

    const markCompleteResponse = await agent.put(`/todos/${newTodo.id}`).send({
      _csrf: csrfToken,
      completed: true,
    });
    const parsedUpdateResponse = JSON.parse(markCompleteResponse.text);
    expect(parsedUpdateResponse.completed).toBe(true);
  });
  test("Deleting todo test", async () => {
    const agent = request.agent(server);
    await login(agent, "reddy123@gmail.com", "12345");
    let res = await agent.get("/todo");
    let csrfToken = extractCsrfToken(res);

    await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });

    const groupedTodosResponse = await agent
      .get("/todo")
      .set("Accept", "application/json");
    const parsedGroupedTodosResponse = JSON.parse(groupedTodosResponse.text);
    const dueTodayCount = parsedGroupedTodosResponse.dueToday.length;
    const newTodo = parsedGroupedTodosResponse.dueToday[dueTodayCount - 1];

    res = await agent.get("/todo");
    csrfToken = extractCsrfToken(res);

    const deleteTodo = await agent
      .delete(`/todos/${newTodo.id}`)
      .send({ _csrf: csrfToken });

    const deleteTodoResponse = JSON.parse(deleteTodo.text);

    expect(deleteTodoResponse.success).toBe(true);
  });
  test("mark todo as incomplete", async () => {
    const agent = request.agent(server);
    await login(agent, "reddy123@gmail.com", "12345");
    let res = await agent.get("/todo");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "buy milk",
      dueDate: new Date().toISOString(),
      completed: true,
      _csrf: csrfToken,
    });
    const groupedTodosResponse = await agent
      .get("/todo")
      .set("Accept", "application/json");

    const parsedGroupedResponse = JSON.parse(groupedTodosResponse.text);
    const dueTodayCount = parsedGroupedResponse.dueToday.length;
    const newTodo = parsedGroupedResponse.dueToday[dueTodayCount - 1];

    res = await agent.get("/todo");
    csrfToken = extractCsrfToken(res);

    const markCompleteResponse = await agent.put(`/todos/${newTodo.id}`).send({
      completed: false,
      _csrf: csrfToken,
    });
    const parsedUpdateResponse = JSON.parse(markCompleteResponse.text);
    expect(parsedUpdateResponse.completed).toBe(false);
  });
  //test(" Delete todo using ID", async () => {
  //const response = await agent.post("/todos").send({
  //title: "Delete todo",
  //dueDate: new Date().toISOString(),
  //completed: false,
  //});
  //const parsedResponse = JSON.parse(response.text);
  //const todoID = parsedResponse.id;
  //expect(parsedResponse.title).toBe("Delete todo");
  //const deletetodo = await agent.delete(`/todos/${todoID}`);
  //const parsedremoveResponse = JSON.parse(deletetodo.text);
  //expect(parsedremoveResponse).toBe(true);
  //});
});
