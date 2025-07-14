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

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const fieldName = file.fieldname;

    // Define allowed MIME types for each field
    const mimeTypes = {
      profilePicture: ['image/jpeg', 'image/png', 'image/jpg'],
      pds: [
        'application/pdf',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ],
    };

    const allowed = mimeTypes[fieldName];
    if (allowed && allowed.includes(file.mimetype)) {
      return cb(null, true);
    }

    return cb(new Error(`Invalid file type for ${fieldName}`));
  },
});

module.exports = upload;
