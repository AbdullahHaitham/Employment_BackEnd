// middleware/uploadMiddleware.js
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary"); // لو cloudinary.js جوه config

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "cv_uploads",
    allowed_formats: ["pdf", "png", "jpg", "jpeg"],
  },
});

const upload = multer({ storage });

module.exports = upload; 

