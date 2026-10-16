const cloudinary = require("../config/cloudinary");

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "users/avatars",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      },
    );

    uploadStream.end(buffer);
  });
};

module.exports = uploadToCloudinary;
