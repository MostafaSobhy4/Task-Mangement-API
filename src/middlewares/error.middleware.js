const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;

  if (err.name === "ValidationError") {
    statusCode = 400;
  }

  if (err.name === "CastError") {
    statusCode = 400;
    err.message = "Invalid task ID";
  }

  res.status(statusCode).json({
    status: "Fail",
    message: err.message || "Something went wrong",
  });
};

module.exports = errorHandler;
