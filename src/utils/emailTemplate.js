const fs = require("fs");
const path = require("path");

const getEmailTemplate = (fileName) => {
  const filePath = path.join(__dirname, "../templates/emails", fileName);

  return fs.readFileSync(filePath, "utf-8");
};

module.exports = getEmailTemplate;
