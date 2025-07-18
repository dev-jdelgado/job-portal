require("dotenv").config();
const express = require('express');
const router = express.Router();
const db = require('../db');
const nodemailer = require("nodemailer");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Nodemailer transporter setup (re-using your existing setup)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// === ROUTE TO SEND VERIFICATION EMAIL ===
router.post('/send-verification', async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required.' });
  }

  try {
    // 1. Fetch user email
    const [rows] = await db.execute('SELECT email FROM users WHERE id = ?', [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    const userEmail = rows[0].email;

    // 2. Create a verification token that expires in 1 hour
    const verificationToken = jwt.sign(
      { id: userId },
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );

    // 3. Save the token to the user's record 
    await db.execute(
      'UPDATE users SET verification_token = ? WHERE id = ?',
      [verificationToken, userId]
    );

    // 4. Create the verification URL for the frontend
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

    // 5. Send the email
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: userEmail,
      subject: 'Verify Your Email Address',
      html: `
        <p>Hello,</p>
        <p>Thank you for registering. Please click the link below to verify your email address:</p>
        <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Verify Email</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    });

    res.json({ message: 'Verification email sent successfully.' });

  } catch (error) {
    console.error('Error sending verification email:', error);
    res.status(500).json({ error: 'Server error while sending verification email.' });
  }
});


// === ROUTE TO HANDLE EMAIL VERIFICATION ===
router.post('/verify-email', async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Verification token is required.' });
  }

  try {
    // 1. Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // 2. Update the user's status to verified
    const [result] = await db.execute(
      'UPDATE users SET is_verified = 1, verification_token = NULL WHERE id = ?',
      [userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found or already verified.' });
    }

    res.json({ message: 'Email verified successfully!' });

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid or expired verification link.' });
    }
    console.error('Error verifying email:', error);
    res.status(500).json({ error: 'Server error during email verification.' });
  }
});

// === ROUTE TO CHANGE PASSWORD (for authenticated users) ===
router.post('/change-password', async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;

  if (!userId || !currentPassword || !newPassword) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    // 1. Get the user's current hashed password from the DB
    const [rows] = await db.execute('SELECT password FROM users WHERE id = ?', [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    const hashedPasswordFromDB = rows[0].password;

    // 2. Compare the provided current password with the one in the DB
    const isMatch = await bcrypt.compare(currentPassword, hashedPasswordFromDB);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect current password.' });
    }

    // 3. Hash the new password
    const salt = await bcrypt.genSalt(10);
    const newHashedPassword = await bcrypt.hash(newPassword, salt);

    // 4. Update the database with the new password
    await db.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [newHashedPassword, userId]
    );

    res.json({ message: 'Password changed successfully.' });

  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

// === ROUTE TO REQUEST A PASSWORD RESET (FORGOT PASSWORD) ===
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  try {
    // 1. Find user by email
    const [rows] = await db.execute('SELECT id, email FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.json({ message: 'If a user with that email exists, a password reset link has been sent.' });
    }
    const user = rows[0];

    // 2. Create a short-lived password reset token (e.g., 15 minutes)
    const resetToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET, 
      { expiresIn: '15m' }
    );

    // 3. Create the password reset URL for the frontend
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // 4. Send the reset email
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <p>Hello,</p>
        <p>We received a request to reset your password. Click the link below to set a new one:</p>
        <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>This link will expire in 15 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    });

    res.json({ message: 'If a user with that email exists, a password reset link has been sent.' });

  } catch (error) {
    console.error('Error in forgot password:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});


// === ROUTE TO PERFORM THE PASSWORD RESET ===
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token and new password are required.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await db.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );

    res.json({ message: 'Password has been reset successfully.' });

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid or expired password reset link.' });
    }
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;