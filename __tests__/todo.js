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
    const res = await agent.get("/");
    const csrfToken = extractCsrfToken(res);
    const response = await agent.post("/todos").send({
      title: "buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302); //http status code
  });
  test("mark as complete", async () => {
    let res = await agent.get("/");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    const groupedTodoResponse = await agent
      .get("/")
      .set("Accept", "application/json");
    const parsedGroupedResponse = JSON.parse(groupedTodoResponse.text);
    const dueTodayCount = parsedGroupedResponse.dueToday.length;
    const latestTodo = parsedGroupedResponse.dueToday[dueTodayCount - 1];

    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);

    const markCompleteResponse = await agent
      .put(`/todos/${latestTodo.id}/markAsCompleted`)
      .send({
        _csrf: csrfToken,
      });
    const parsedUpdateResponse = JSON.parse(markCompleteResponse.text);
    expect(parsedUpdateResponse.completed).toBe(true);
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
