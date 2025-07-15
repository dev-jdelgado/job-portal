const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
    cb(null, uniqueName);
  },
});

// Allowed types per field
const allowedTypes = {
  profilePicture: ['image/jpeg', 'image/jpg', 'image/png'],
  default: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/zip',
    'application/x-rar-compressed'
  ]
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const field = file.fieldname;
    const mime = file.mimetype;

    const validTypes = allowedTypes[field] || allowedTypes.default;

    if (validTypes.includes(mime)) {
      return cb(null, true);
    }

    return cb(new Error(`Invalid file type for ${field}. Type: ${mime}`));
  },
});

module.exports = upload;
