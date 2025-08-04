require("dotenv").config();
const express = require('express');
const router = express.Router();
const db = require('../db');
const upload = require('../middleware/uploadMiddleware');
const nodemailer = require("nodemailer");


// Helper function to calculate age from date of birth
function calculateAge(dateString) {
  if (!dateString) return null;
  const today = new Date();
  const birthDate = new Date(dateString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// Set up nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});


// ADD Job Post
router.post('/', async (req, res) => {
  const { title, description, education, skills, admin_id, employment_type, disability_status } = req.body;

  try {
    const sql = `INSERT INTO jobs (title, description, education, skills, admin_id, employment_type, disability_status)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;

    await db.execute(sql, [
      title,
      description,
      education,
      skills,
      admin_id,
      employment_type || 'Full-time',
      disability_status || 'Non-PWD'
    ]);

    res.status(201).json({ message: 'Job posted successfully' });
  } catch (err) {
    console.error('Error posting job:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


// UPDATE Job Post
router.put('/:id', async (req, res) => {
  const { id } = req.params
  const { title, description, education, skills, employment_type, disability_status } = req.body

  try {
    const sql = `UPDATE jobs SET title=?, description=?, education=?, skills=?, employment_type=?, disability_status=? WHERE id=?`
    await db.execute(sql, [title, description, education, skills, employment_type, disability_status, id])
    res.json({ message: 'Job updated successfully' })
  } catch (err) {
    console.error('Error updating job:', err)
    res.status(500).json({ error: 'Server error' })
  }
})


// DELETE Job Post
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Check if there are applicants
    const [applications] = await db.execute('SELECT COUNT(*) as count FROM applications WHERE job_id = ?', [id]);
    const applicantCount = applications[0].count;

    if (applicantCount > 0) {
      return res.status(400).json({ error: 'Cannot delete job with applicants.' });
    }

    // Proceed to delete
    await db.execute('DELETE FROM jobs WHERE id = ?', [id]);
    res.json({ message: 'Job deleted successfully' });
  } catch (err) {
    console.error('Error deleting job:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


// GET jobs posted by a specific admin
router.get('/admin/:adminId', async (req, res) => {
    const { adminId } = req.params;
    try {
      const [rows] = await db.execute(`
        SELECT j.*, 
          (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) AS applicant_count
        FROM jobs j
        WHERE j.admin_id = ?
        ORDER BY j.created_at DESC
      `, [adminId]);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching admin jobs:', err);
        res.status(500).json({ error: 'Server error' });
    }
});0 


// GET matching jobs for a seeker
router.get('/seeker/:id', async (req, res) => {
  const seekerId = req.params.id;

  try {
    // Get seeker info
    const [seekerRows] = await db.execute('SELECT skills, education, disability_status, is_verified FROM users WHERE id = ?', [seekerId]);
    if (seekerRows.length === 0) return res.status(404).json({ message: 'Seeker not found' });

    const seeker = seekerRows[0];
    const seekerSkills = seeker.skills?.split(',').map(s => s.trim().toLowerCase()) || [];
    const seekerEducation = seeker.education?.toLowerCase() || '';
    const seekerDisabilityStatus = seeker.disability_status || 'Non-PWD';

    const [jobs] = await db.execute('SELECT * FROM jobs');

    const rankedJobs = jobs.map(job => {
      const jobSkills = job.skills?.split(',').map(s => s.trim().toLowerCase()) || [];
      const jobEducation = job.education?.toLowerCase() || '';
      const jobDisabilityStatus = job.disability_status || 'Non-PWD';

      const skillMatchCount = seekerSkills.filter(skill => jobSkills.includes(skill)).length;
      const educationMatch = jobEducation === seekerEducation ? 1 : 0;

      let disabilityMatch = 0;

      // Only give disability match points when seeker is PWD
      if (seekerDisabilityStatus === 'PWD' && jobDisabilityStatus === 'PWD') {
        disabilityMatch = 1;
      }

      // You could also include this logic if you want to treat jobs with "Open to All" differently later
      // For now, only exact "PWD"-to-"PWD" matches are scored

      const matchScore = (disabilityMatch * 1000) + (educationMatch * 1) + skillMatchCount;

      return {
        ...job,
        matchScore,
        educationMatch,
        disabilityMatch
      };
    });


    // Sort jobs by descending matchScore
    rankedJobs.sort((a, b) => b.matchScore - a.matchScore);

    const matchingJobs = rankedJobs.filter(job => {
      const hasMatch = job.matchScore > 0;
    
      // If seeker is PWD, exclude jobs marked as "Non-PWD"
      const isAccessible = !(seekerDisabilityStatus === 'PWD' && job.disability_status === 'Non-PWD');
    
      return hasMatch && isAccessible;
    });
    

    res.json({
      seeker,
      matchingJobs,
      allJobs: rankedJobs
    });
  } catch (err) {
    console.error('Error fetching jobs:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


// GET job by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.execute('SELECT * FROM jobs WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Job not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching job:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


// POST for Application
router.post('/applications', async (req, res) => {
  const { job_id, seeker_id } = req.body;

  try {
    await db.execute(
      'INSERT INTO applications (job_id, seeker_id) VALUES (?, ?)',
      [job_id, seeker_id]
    );

    res.status(201).json({ message: "Application submitted successfully!" });
  } catch (err) {
    console.error("Apply error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post('/applications/detailed', upload.fields([
  { name: 'pdsFile' },
  { name: 'ApplicationLetterFile' },
  { name: 'performanceRatingFile' },
  { name: 'eligibilityFile' },
  { name: 'diplomaFile' },
  { name: 'torFile' },
  { name: 'trainingsFile' }
]), async (req, res) => {
  const { job_id, seeker_id } = req.body;
  const files = req.files || {};

  try {
    // 1. Insert application
    await db.execute(
      `INSERT INTO applications 
        (job_id, seeker_id, pds_url, application_letter_url, performance_rating_url, eligibility_url, diploma_url, tor_url, trainings_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        job_id,
        seeker_id,
        files.pdsFile?.[0]?.filename || null,
        files.ApplicationLetterFile?.[0]?.filename || null,
        files.performanceRatingFile?.[0]?.filename || null,
        files.eligibilityFile?.[0]?.filename || null,
        files.diplomaFile?.[0]?.filename || null,
        files.torFile?.[0]?.filename || null,
        files.trainingsFile?.[0]?.filename || null
      ]
    );

    // 2. Get seeker info
    const [[seeker]] = await db.execute('SELECT name, email, phone_number FROM users WHERE id = ?', [seeker_id]);

    // 3. Get job title
    const [[job]] = await db.execute('SELECT title FROM jobs WHERE id = ?', [job_id]);

    // 4. Insert in-app notification
    await db.execute('INSERT INTO notifications (user_id, message) VALUES (?, ?)', [
      seeker_id,
      `You successfully applied for "${job.title}".`
    ]);

    // 5. Send email
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: seeker.email,
      subject: 'Application Confirmation',
      html: `
        <p style="margin: 0;">Hi <strong>${seeker.name}</strong>,</p><br>
        <p style="margin: 0;">Your application for the position "<strong>${job.title}</strong>" has been received. Thank you so much for applying with us! We truly appreciate the time and effort you’ve put into it.</p><br>
        <p style="margin: 0;">Our HR Team will be reviewing your application soon, and you can expect to hear from one of our team members via email or a phone call to guide you through the next steps.</p><br>
        <p style="margin: 0;">We truly appreciate your interest in applying, and we can’t wait to learn more about you!</p><br>
        <p style="margin: 0;">Warm Regards,</p>
        <p style="margin: 0;">HR</p>
      `,
    });
    

    res.status(201).json({ message: "Application submitted successfully!" });
  } catch (err) {
    console.error("Error:", err.stack || err);
    res.status(500).json({ error: "Server error" });
  }
});

// Remove Notification When Clicked
router.post('/notifications/mark-read/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await db.execute('UPDATE notifications SET is_read = 1 WHERE id = ?', [id]);
    res.sendStatus(200);
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET notifications for a user
router.get('/notifications/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const [rows] = await db.execute(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// GET applications for a seeker
router.get('/applications/seeker/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.execute(
      `SELECT a.*, j.title, j.description, j.employment_type, j.disability_status, j.education, j.skills
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       WHERE a.seeker_id = ?
       ORDER BY a.applied_at DESC`,
      [id]
    );

    res.json(rows);
  } catch (err) {
    console.error('Error fetching applications:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


// GET: check if seeker already applied to a job and return date
router.get('/applications/check', async (req, res) => {
  const { job_id, seeker_id } = req.query;

  try {
    const [rows] = await db.execute(
      'SELECT applied_at, status FROM applications WHERE job_id = ? AND seeker_id = ?',
      [job_id, seeker_id]
    );
    
    if (rows.length > 0) {
      return res.json({ 
        applied: true, 
        applied_at: rows[0].applied_at,
        status: rows[0].status || 'applied',
      });
    }

    res.json({ applied: false });
  } catch (err) {
    console.error("Error checking application status:", err);
    res.status(500).json({ error: "Server error" });
  }
});



// GET all applicants for a specific job with MATCH SCORE
router.get('/applicants/:jobId', async (req, res) => {
  const { jobId } = req.params;

  try {
    // ... (1. Get job's requirements - this part is unchanged) ...
    const [jobRows] = await db.execute('SELECT * FROM jobs WHERE id = ?', [jobId]);
    if (jobRows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }
    const job = jobRows[0];
    const jobSkills = job.skills?.split(',').map(s => s.trim().toLowerCase()) || [];
    const jobEducation = job.education?.toLowerCase() || '';
    const jobDisabilityStatus = job.disability_status || 'Non-PWD';

    // In GET /applicants/:jobId
    const [applicants] = await db.execute(`
      SELECT 
        u.id, u.name, u.email, u.education, u.skills, u.disability_status, 
        u.date_of_birth, u.address, u.phone_number, u.pwd_id_image,
        a.pds_url, a.application_letter_url, a.diploma_url, a.tor_url,
        a.eligibility_url, a.performance_rating_url, a.trainings_url,
        a.applied_at, a.id AS applicationId, a.status,
        a.job_id AS jobId,
        j.title AS job_title
      FROM applications a
      JOIN users u ON a.seeker_id = u.id
      JOIN jobs j ON a.job_id = j.id
      WHERE a.job_id = ?
    `, [jobId]);

    // 3. Calculate match score and age for each applicant
    const rankedApplicants = applicants.map(applicant => {
      const seekerSkills = applicant.skills?.split(',').map(s => s.trim().toLowerCase()) || [];
      const seekerEducation = applicant.education?.toLowerCase() || '';
      const seekerDisabilityStatus = applicant.disability_status || 'Non-PWD';

      const skillMatchCount = seekerSkills.filter(skill => jobSkills.includes(skill)).length;
      const educationMatch = jobEducation === seekerEducation ? 1 : 0;
      let disabilityMatch = 0;
      if (seekerDisabilityStatus === 'PWD' && jobDisabilityStatus === 'PWD') {
        disabilityMatch = 1;
      }
      
      const matchScore = (disabilityMatch * 1000) + (educationMatch * 1) + skillMatchCount;


      return {
        ...applicant,
        matchScore,
        age: calculateAge(applicant.date_of_birth), // ADDED age calculation
      };
    });

    res.json(rankedApplicants);
  } catch (err) {
    console.error("Error fetching applicants:", err);
    res.status(500).json({ error: "Server error" });
  }
});



// GET total number of applications across all jobs by an admin
router.get('/admin/:adminId/applications/count', async (req, res) => {
  const { adminId } = req.params;

  try {
    const [rows] = await db.execute(`
      SELECT COUNT(*) AS total_applications
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE j.admin_id = ?
    `, [adminId]);

    res.json(rows[0]); // returns { total_applications: number }
  } catch (err) {
    console.error('Error fetching application count:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


// UPDATE application status (shortlist/reject)
router.put('/applications/:applicationId/status', async (req, res) => {
  const { applicationId } = req.params;
  const { status, interviewTime } = req.body;
  const { createMeetEvent } = require('../services/googleCalendarService');


  const validStatuses = ['shortlisted', 'interviewed', 'selected', 'rejected'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value.' });
  }

  try {
    // 1. Update application status
    const [updateResult] = await db.execute(
      'UPDATE applications SET status = ? WHERE id = ?',
      [status, applicationId]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    // 2. Get applicant and job info
    const [[applicant]] = await db.execute(`
      SELECT a.seeker_id, u.name, u.email, j.title AS job_title
      FROM applications a
      JOIN users u ON a.seeker_id = u.id
      JOIN jobs j ON a.job_id = j.id
      WHERE a.id = ?
    `, [applicationId]);

    if (!applicant) {
      return res.status(404).json({ error: 'Applicant not found.' });
    }

    // 3. Send email
    let meetLink = null;

    let subject = '';
    let html = '';
    let notificationMessage = '';
    
    if (status === 'shortlisted') {
      const eventTime = interviewTime ? new Date(interviewTime) : new Date();
      meetLink = await createMeetEvent(
        `Interview for ${applicant.job_title}`,
        `Interview with ${applicant.name} for ${applicant.job_title}`,
        applicant.email,
        eventTime
      );
    
      const formattedDateTime = eventTime.toLocaleString('en-PH', {
        timeZone: 'Asia/Manila',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    
      subject = `You're shortlisted for ${applicant.job_title}`;
      html = `
        <p>Hi <strong>${applicant.name}</strong>,</p>
        <p>Congratulations! You've been <strong>shortlisted</strong> for the <strong>${applicant.job_title}</strong> role.</p>
        <p>Your interview is scheduled on <strong>${formattedDateTime}</strong>.</p>
        <p>Join via Google Meet: <a href="${meetLink}">${meetLink}</a></p>
        <p>Best regards,<br/>HR Team</p>
      `;
      notificationMessage = `You have been shortlisted for "${applicant.job_title}". Check your email for the interview schedule.`;
    
    } else if (status === 'interviewed') {
      subject = `Interview Update - ${applicant.job_title}`;
      html = `
        <p>Hi <strong>${applicant.name}</strong>,</p>
        <p>Thank you for attending the interview for the <strong>${applicant.job_title}</strong> position.</p>
        <p>We appreciate your time and interest. We'll contact you about the next steps.</p>
        <p>Best regards,<br/>HR Team</p>
      `;
      notificationMessage = `You were marked as interviewed for "${applicant.job_title}".`;
    
    } else if (status === 'selected') {
      subject = `Congratulations! You're selected for the position ${applicant.job_title}`;
      html = `
        <p>Hi <strong>${applicant.name}</strong>,</p>
        <p>We're thrilled to inform you that you’ve been <strong>selected</strong> for the <strong>${applicant.job_title}</strong> position.</p>
        <p>We will be reaching out with further instructions shortly.</p>
        <p>Congratulations again!</p>
        <p>Best regards,<br/>HR Team</p>
      `;
      notificationMessage = `🎉 Congratulations! You’ve been selected for "${applicant.job_title}".`;
    
    } else if (status === 'rejected') {
      subject = `Application Update - ${applicant.job_title}`;
      html = `
        <p>Hi <strong>${applicant.name}</strong>,</p>
        <p>Thank you for applying for <strong>${applicant.job_title}</strong>. Unfortunately, you were not selected at this time.</p>
        <p>We wish you the best in your job search.</p>
        <p>Best regards,<br/>HR Team</p>
      `;
      notificationMessage = `Your application for "${applicant.job_title}" was rejected.`;
    }
    
    await transporter.sendMail({ 
      from: process.env.GMAIL_USER, 
      to: applicant.email, 
      subject, 
      html 
    });

    await db.execute(
      'INSERT INTO notifications (user_id, message) VALUES (?, ?)', 
      [applicant.seeker_id, notificationMessage]
    );


    res.json({ message: 'Status updated, email and notification sent.' });
  } catch (err) {
    console.error('Error updating application status:', err);
    res.status(500).json({ error: 'Server error' });
  }
});



module.exports = router;
