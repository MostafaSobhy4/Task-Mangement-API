const swaggerJsdoc = require("swagger-jsdoc");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Task Management API",
            version: "1.0.0",
            description: "REST API for managing tasks and users",
        },
        servers: [
            {
                url: "http://localhost:2005",
            },
        ],
    },
    apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;