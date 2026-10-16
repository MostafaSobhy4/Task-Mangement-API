const Task = require("../models/Task");
const AppError = require("../utils/appError");
const asyncWrapper = require("../middlewares/asyncwrapper.middleware");
const logger = require("../utils/logger");

const getTasks = asyncWrapper(async (req, res) => {
  const { page = 1, limit = 10, search, sort, ...filter } = req.query;

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const tasks = await Task.find({ ...filter, user: req.user.id })
    .sort(sort)
    .limit(Number(limit))
    .skip(skip);

  const total = await Task.countDocuments({ ...filter, user: req.user.id });

  logger.info(
    `Tasks retrieved successfully for user: ${req.user.id}, count: ${total}`,
  );

  res.status(200).json({
    status: "Success",
    data: tasks,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
});
const getTaskByID = asyncWrapper(async (req, res) => {
  const id = req.params.id;
  const task = await Task.findOne({ _id: id, user: req.user.id });
  if (!task) {
    logger.warn(`Task not found: ${id}, user: ${req.user.id}`);
    throw new AppError("Task not found", 404);
  }
  logger.info(`Task retrieved successfully: ${task._id}`);
  res.status(200).json({ status: "Success", data: task });
});

const createTask = asyncWrapper(async (req, res) => {
  const data = { ...req.body, user: req.user.id };
  const task = await Task.create(data);
  logger.info(`Task created successfully: ${task._id} by user: ${req.user.id}`);
  res.status(201).json({ status: "Success", data: task });
});

const updateTask = asyncWrapper(async (req, res) => {
  const id = req.params.id;
  const data = req.body;
  const updatedTask = await Task.findOneAndUpdate(
    { _id: id, user: req.user.id },
    data,
    { new: true },
  );
  if (!updatedTask) {
    logger.warn(
      `Task update failed: task not found or unauthorized. ID: ${id}, user: ${req.user.id}`,
    );
    throw new AppError("Task not found", 404);
  }
  logger.info(`Task updated successfully: ${updatedTask._id}`);
  res.status(200).json({ status: "Success", data: updatedTask });
});

const deleteTask = asyncWrapper(async (req, res) => {
  const id = req.params.id;
  const deletedTask = await Task.findOneAndDelete({
    _id: id,
    user: req.user.id,
  });
  if (!deletedTask) {
    logger.warn(
      `Task delete failed: task not found or unauthorized. ID: ${id}, user: ${req.user.id}`,
    );
    throw new AppError("Task not found", 404);
  }
  logger.info(`Task deleted successfully: ${deletedTask._id}`);
  res.status(200).json({ status: "Success", data: null });
});

module.exports = {
  getTasks,
  getTaskByID,
  createTask,
  updateTask,
  deleteTask,
};
