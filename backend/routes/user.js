const express = require('express');
const router = express.Router();
const db = require('../db'); 
const upload = require('../middleware/uploadMiddleware');
const fs = require('fs'); // Import File System for deleting old files
const path = require('path'); // Import Path for joining file paths

// GET user profile (this can remain the same, but let's add the new fields)
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // UPDATED: Select all the new fields as well
    const [rows] = await db.execute('SELECT id, name, email, skills, education, disability_status, bio, date_of_birth, address, phone_number, profile_picture_url, pds_url FROM users WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


router.put('/:id', upload.fields([{ name: 'profilePicture', maxCount: 1 }, { name: 'pds', maxCount: 1 }]), async (req, res) => {
  const { id } = req.params;
  const { name, email, bio, skills, education, disability_status, date_of_birth, address, phone_number } = req.body;

  try {
    // --- Delete old files before updating ---
    if (req.files.profilePicture || req.files.pds) {
        const [currentUserResult] = await db.execute('SELECT profile_picture_url, pds_url FROM users WHERE id = ?', [id]);
        const currentUser = currentUserResult[0];

        if (currentUser) {
          // If a new profile picture is uploaded and an old one exists, delete the old one.
          if (req.files.profilePicture && currentUser.profile_picture_url) {
            // FIX: Construct the correct absolute path by removing the leading slash from the stored URL
            const oldPath = path.join(__dirname, '..', currentUser.profile_picture_url.substring(1));
            fs.unlink(oldPath, err => {
              if (err) console.error("Error deleting old picture:", err);
            });
          }
          // If a new pds is uploaded and an old one exists, delete it.
          if (req.files.pds && currentUser.pds_url) {
            // FIX: Apply the same path correction here
            const oldPath = path.join(__dirname, '..', currentUser.pds_url.substring(1));
            fs.unlink(oldPath, err => {
              if (err) console.error("Error deleting old pds:", err);
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
        fieldsToUpdate.profile_picture_url = `/uploads/${req.files.profilePicture[0].filename}`;
    }
    if (req.files.pds) {
        fieldsToUpdate.pds_url = `/uploads/pdss/${req.files.pds[0].filename}`;
    }
    
    if (Object.keys(fieldsToUpdate).length === 0) {
        return res.status(400).json({ message: 'No new information provided to update.' });
    }

    // --- Construct and execute the dynamic SQL query ---
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