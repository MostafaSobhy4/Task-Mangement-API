const taskRouter = require("./routes/task.routes");
const userRouter = require("./routes/user.routes");
const errorHandler = require("./middlewares/error.middleware");
const authMiddleware = require("./middlewares/auth.middleware");
const express = require("express");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const AppError = require("./utils/appError");
const { globalRateLimit } = require("./middlewares/ratelimit.middleware");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const app = express();

app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/tasks", globalRateLimit, authMiddleware, taskRouter);
app.use("/api/auth", userRouter);
app.use((req, res, next) => {
  next(new AppError("Route not found", 404));
});
app.use(errorHandler);
module.exports = app;
