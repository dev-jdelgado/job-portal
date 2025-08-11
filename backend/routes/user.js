const express = require('express');
const router = express.Router();
const db = require('../db'); 
const upload = require('../middleware/uploadMiddleware');
const fs = require('fs'); 
const path = require('path'); 


router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.execute('SELECT id, name, email, is_verified, skills, education, disability_status, bio, date_of_birth, address, phone_number, profile_picture_url, pwd_id_image FROM users WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


router.put('/:id', upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'pds', maxCount: 1 },
    { name: 'pwdIdImage', maxCount: 1 } 
  ]), async (req, res) => {
  const { id } = req.params;
  const { name, email, bio, skills, education, disability_status, date_of_birth, address, phone_number } = req.body;

  try {
    // --- Delete old files before updating ---
    if (req.files.profilePicture || req.files.pds) {
        const [currentUserResult] = await db.execute('SELECT profile_picture_url FROM users WHERE id = ?', [id]);
        const currentUser = currentUserResult[0];

        if (currentUser) {
          // If a new profile picture is uploaded and an old one exists, delete the old one.
          if (req.files.profilePicture && currentUser.profile_picture_url) {
            const oldPath = path.join(
              __dirname,
              '..',
              'uploads',
              id.toString(),
              'profile',
              currentUser.profile_picture_url
            );
          
            fs.unlink(oldPath, err => {
              if (err) {
                if (err.code !== 'ENOENT') {
                  console.error("Error deleting old picture:", err);
                } else {
                  console.warn("Old picture not found:", oldPath);
                }
              }
            });
          }
        }
    }

    // --- Build the update object dynamically ---
    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (email) fieldsToUpdate.email = email;
    if (bio) fieldsToUpdate.bio = bio;
    if (skills) fieldsToUpdate.skills = skills;
    if (education) fieldsToUpdate.education = education;
    if (disability_status) fieldsToUpdate.disability_status = disability_status;
    if (date_of_birth) fieldsToUpdate.date_of_birth = date_of_birth;
    if (address) fieldsToUpdate.address = address;
    if (phone_number) fieldsToUpdate.phone_number = phone_number;

    if (req.files.profilePicture) {
        fieldsToUpdate.profile_picture_url = `${req.files.profilePicture[0].filename}`;
    }

    if (req.files.pwdIdImage) {
      fieldsToUpdate.pwd_id_image = `${req.files.pwdIdImage[0].filename}`;
    }
    
    if (Object.keys(fieldsToUpdate).length === 0) {
        return res.status(400).json({ message: 'No new information provided to update.' });
    }

    // Construct and execute the dynamic SQL query 
    const fieldNames = Object.keys(fieldsToUpdate);
    const sqlSetClause = fieldNames.map(field => `${field} = ?`).join(', ');
    const values = [...Object.values(fieldsToUpdate), id];

    const sql = `UPDATE users SET ${sqlSetClause} WHERE id = ?`;
    
    await db.execute(sql, values);
    
    res.json({ message: 'Profile updated successfully' });

  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;