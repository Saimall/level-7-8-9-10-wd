/* eslint-disable no-unused-vars */

const express = require("express"); //importing express
const app = express(); // creating new application
const bodyParser = require("body-parser");
app.use(bodyParser.json());
const path = require("path");
const { Todo } = require("./models");
const todo = require("./models/todo");
app.use(express.static(path.join(__dirname,'public')));
//SET EJS AS VIEW ENGINE
 app.set("view engine","ejs");
 app.get("/",async(request,response)=>{
  const allTodos = await Todo.getTodos();
  if(request.accepts("html")){
    response.render('index',{
      allTodos
    });
  }else{
    response.json({
      allTodos
    });
  }
  
 });
 

app.get("/todos", async (request, response) => {
  // defining route to displaying message
  console.log("Todo list");
  try {
    const todoslist = await Todo.findAll();
    return response.send(todoslist);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});
app.get("/todos/:id", async function (request, response) {
  try {
    const todo = await Todo.findByPk(request.params.id);
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.post("/todos", async (request, response) => {
  console.log("creating new todo", request.body);
  try {
    const todo = await Todo.addTodo({
      title: request.body.title,
      dueDate: request.body.dueDate,
      commpleted: false,
    });
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});
//PUT https://mytodoapp.com/todos/123/markAscomplete
app.put("/todos/:id/markAsCompleted", async (request, response) => {
  console.log("we have to update a todo with ID:", request.params.id);
  const todo = await Todo.findByPk(request.params.id);
  try {
    const updatedtodo = await todo.markAsCompleted();
    return response.json(updatedtodo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});
app.delete("/todos/:id", async (request, response) => {
  console.log("delete a todo with ID:", request.params.id);
  try {
    const tododelete = await Todo.findByPk(request.params.id);
    if (tododelete) {
      await tododelete.destroy();
      return response.json(true);
    } else {
      return response.json(false);
    }
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});
module.exports = app;
