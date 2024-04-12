const multer = require("multer");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "public/assets";

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const rename = Date.now() + "-" + file.originalname;
    cb(null, rename);
  },
});

const limits = {
  fileSize: 10 * 1024 * 1024, // Limit file size to 10MB
};

const uploadPhoto = multer({
  storage,
  limits,
});

module.exports = uploadPhoto