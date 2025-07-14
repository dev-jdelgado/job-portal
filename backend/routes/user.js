const express = require('express');
const router = express.Router();
const db = require('../db'); // Assuming your db connection is here
const upload = require('../middleware/uploadMiddleware'); // Using existing upload middleware

// GET user profile
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.execute('SELECT id, name, email, skills, education, disability_status, bio, profile_picture_url, resume_url FROM users WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// UPDATE user profile
router.put('/:id', upload.fields([{ name: 'profilePicture', maxCount: 1 }, { name: 'resume', maxCount: 1 }]), async (req, res) => {
  const { id } = req.params;
  const { name, email, bio, skills, education, disability_status } = req.body;

  // Paths for uploaded files
  const profilePictureUrl = req.files.profilePicture ? `/uploads/${req.files.profilePicture[0].filename}` : req.body.existingProfilePicture;
  const resumeUrl = req.files.resume ? `/uploads/${req.files.resume[0].filename}` : req.body.existingResume;

  try {
    const sql = `
      UPDATE users 
      SET name = ?, email = ?, bio = ?, skills = ?, education = ?, disability_status = ?, profile_picture_url = ?, resume_url = ?
      WHERE id = ?
    `;
    await db.execute(sql, [name, email, bio, skills, education, disability_status, profilePictureUrl, resumeUrl, id]);
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;