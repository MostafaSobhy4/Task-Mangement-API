const multer = require("multer");
const storage = multer.memoryStorage();
const logger = require("../utils/logger");

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = file.originalname.split(".").pop();
    cb(null, file.fieldname + "-" + uniqueSuffix + "." + extension);
  },

  fileFilter: (req, file, cb) => {
    logger.info("Mimetype:", file.mimetype);
    logger.info("Original name:", file.originalname);

    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error(`Only images are allowed. Received: ${file.mimetype}`));
    }
  },
});

module.exports = upload;
