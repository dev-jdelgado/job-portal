// middleware/uploadMiddleware.js
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const upload = multer({ storage: multer.memoryStorage() });

const supabaseUploadMiddleware = async (req, res, next) => {
  if (!req.files) return next();

  req.savedFiles = {};

  for (const field in req.files) {
    const file = req.files[field][0];
    const userId = req.body.seeker_id || req.body.userId || req.params.id || 'unknown';
    const jobId = req.body.job_id || 'general';
    const safeName = file.originalname.replace(/\s+/g, '_');
    const uniqueName = `${Date.now()}-${safeName}`;

    let folder = 'misc';
    if (field === 'profilePicture' || field === 'pdsFile') folder = 'profile';
    else if (field === 'pwdIdImage') folder = 'pwdID';
    else folder = `applications/${jobId}`;

    const filePath = `${userId}/${folder}/${uniqueName}`;

    const { error } = await supabase.storage
      .from('skilllinkupload')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) return next(error);

    const { data } = supabase.storage.from('skilllinkupload').getPublicUrl(filePath);
    req.savedFiles[field] = data.publicUrl;
  }

  next();
};

module.exports = { upload, supabaseUploadMiddleware, supabase };
