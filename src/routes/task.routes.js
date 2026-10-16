const express = require("express");
const {
  getTasks,
  getTaskByID,
  createTask,
  updateTask,
  deleteTask,
} = require("../controllers/task.controller");
const Router = express.Router();

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks
 *     tags:
 *       - Tasks
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
 */
Router.get("/", getTasks);
/**
 * @swagger
 * /api/task/:id:
 *   get:
 *     summary: Get task by id
 *     tags:
 *       - Task
 *     responses:
 *       200:
 *         description: Task retrieved successfully
 */
Router.get("/:id", getTaskByID);
Router.post("/", createTask);
Router.post("/:id", updateTask);
Router.patch("/:id", updateTask);
Router.delete("/:id", deleteTask);

module.exports = Router;
