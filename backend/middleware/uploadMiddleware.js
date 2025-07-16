const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Base upload directory
const baseUploadDir = path.join(__dirname, '../uploads');

// Ensure base uploads directory exists
if (!fs.existsSync(baseUploadDir)) {
  fs.mkdirSync(baseUploadDir, { recursive: true });
}

// Create nested directory if it doesn't exist
const ensureDirExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.body.seeker_id || req.body.userId || req.params.id || 'unknown';

    let folder = 'misc';
    if (file.fieldname === 'profilePicture' || file.fieldname === 'pds') {
      folder = 'profile';
    } else {
      const jobId = req.body.job_id || 'general';
      folder = `applications/${jobId}`;
    }

    // Store relative path to /uploads
    const relativePath = path.join(userId.toString(), folder);
    const fullPath = path.join(baseUploadDir, relativePath);

    // Save the relative directory in the request so you can use it in your route handler
    if (!req.uploadPaths) req.uploadPaths = {};
    req.uploadPaths[file.fieldname] = relativePath;

    ensureDirExists(fullPath);
    cb(null, fullPath);
  },

  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '_');
    const uniqueName = Date.now() + '-' + safeName;

    // Save full relative path (without /uploads) for this file
    if (!req.savedFiles) req.savedFiles = {};
    const field = file.fieldname;
    const dir = req.uploadPaths?.[field] || '';
    req.savedFiles[field] = path.join(dir, uniqueName); // ← relative path only

    cb(null, uniqueName);
  }
});

// Allowed file types
const allowedTypes = {
  profilePicture: ['image/jpeg', 'image/jpg', 'image/png'],
  default: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
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

    cb(new Error(`Invalid file type for ${field}. Type: ${mime}`));
  },
});

module.exports = upload;
