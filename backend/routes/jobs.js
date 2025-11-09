require("dotenv").config();
const express = require('express');
const router = express.Router();
const db = require('../db');
const { upload, supabaseUploadMiddleware } = require('../middleware/uploadMiddleware');
const nodemailer = require("nodemailer");

const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const { sendEmail } = require('./gmailMailer');

const oAuth2Client = new OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground' // redirect URI
);

oAuth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN,
});

// Create transporter dynamically when needed
async function createTransporter() {
  const accessToken = await oAuth2Client.getAccessToken();

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.GMAIL_USER,
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      accessToken: accessToken.token,
    },
  });
}

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
  const { force } = req.query; // e.g., /jobs/:id?force=true

  try {
    // Check if there are applicants
    const [applications] = await db.execute(
      'SELECT COUNT(*) AS total FROM applications WHERE job_id = ?',
      [id]
    );
    const applicantCount = applications[0].total;

    if (applicantCount > 0 && force !== 'true') {
      // Job has applicants — require confirmation
      return res.status(409).json({
        error: `This job has ${applicantCount} applicant(s). Confirm deletion to proceed.`,
        applicants: applicantCount,
      });
    }

    // Delete applicants (if any)
    await db.execute('DELETE FROM applications WHERE job_id = ?', [id]);

    // Delete the job itself
    await db.execute('DELETE FROM jobs WHERE id = ?', [id]);

    res.json({ message: 'Job and related applications deleted successfully.' });
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


// JOB SKILLS MATCHING
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

      // Lowercased universal skill set
      const universalSkillsSet = new Set([
        "communication", "teamwork", "time management", "problem solving",
        "critical thinking", "adaptability", "leadership", "work ethic", "active listening", "troubleshooting skills", "computer literacy", "digital literacy", "ms office proficiency"
      ]);

      const matchedSkills = seekerSkills.filter(skill => jobSkills.includes(skill));
      const matchedUniversal = matchedSkills.filter(skill => universalSkillsSet.has(skill));
      const matchedNonUniversal = matchedSkills.filter(skill => !universalSkillsSet.has(skill));

      // Only count universal skills if there's at least one non-universal match
      const skillMatchCount = matchedNonUniversal.length + (matchedNonUniversal.length > 0 ? matchedUniversal.length : 0);
      
      const isEducationMatched = jobEducation === seekerEducation;
      const educationMatch = (skillMatchCount > 0 && isEducationMatched) ? 1 : 0;
      
      const softOnlyMatch = matchedUniversal.length > 0 && matchedNonUniversal.length === 0;


      let disabilityMatch = 0;

      // Only give disability match points when seeker is PWD
      if (seekerDisabilityStatus === 'PWD' && jobDisabilityStatus === 'PWD') {
        disabilityMatch = 1;
      }

      // You could also include this logic if you want to treat jobs with "Open to All" differently later
      // For now, only exact "PWD"-to-"PWD" matches are scored

      const matchScore = (disabilityMatch * 1000) + (educationMatch * 1) + skillMatchCount;

      const hasSkillMatch = skillMatchCount > 0;

      return {
        ...job,
        matchScore,
        educationMatch,
        disabilityMatch: (disabilityMatch === 1 && hasSkillMatch) ? 1 : 0,
        softOnlyMatch,
        hasSkillMatch,
        isEducationMatched 
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

// Apply for job
router.post(
  '/applications/detailed',
  upload.fields([
    { name: 'pdsFile' },
    { name: 'ApplicationLetterFile' },
    { name: 'performanceRatingFile' },
    { name: 'eligibilityFile' },
    { name: 'diplomaFile' },
    { name: 'torFile' },
    { name: 'trainingsFile' }
  ]),
  supabaseUploadMiddleware,
  async (req, res) => {
    const { job_id, seeker_id } = req.body;

    try {
      await db.execute(
        `INSERT INTO applications 
          (job_id, seeker_id, pds_url, application_letter_url, performance_rating_url, eligibility_url, diploma_url, tor_url, trainings_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          job_id,
          seeker_id,
          req.savedFiles.pdsFile || null,
          req.savedFiles.ApplicationLetterFile || null,
          req.savedFiles.performanceRatingFile || null,
          req.savedFiles.eligibilityFile || null,
          req.savedFiles.diplomaFile || null,
          req.savedFiles.torFile || null,
          req.savedFiles.trainingsFile || null
        ]
      );

      const [[seeker]] = await db.execute(
        'SELECT name, email FROM users WHERE id = ?', [seeker_id]
      );
      const [[job]] = await db.execute('SELECT title FROM jobs WHERE id = ?', [job_id]);

      await db.execute(
        'INSERT INTO notifications (user_id, message) VALUES (?, ?)',
        [seeker_id, `You successfully applied for "${job.title}".`]
      );

      // ✅ Fully await email send
      await sendEmail(
        seeker.email,
        'Application Confirmation',
        `
          <p>Hi <strong>${seeker.name}</strong>,</p>
          <p>Your application for "<strong>${job.title}</strong>" has been received. Thank you for applying!</p>
          <p>Our HR Team will review your application and contact you for the next steps.</p>
          <p>Warm Regards,<br/>HR Team</p>
        `
      );

      res.status(201).json({ message: "Application submitted successfully!" });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

router.post(
  '/applications/additional-requirements',
  upload.fields([
    { name: 'sssFile', maxCount: 1 },
    { name: 'pagibigFile', maxCount: 1 },
    { name: 'philhealthFile', maxCount: 1 }
  ]),
  supabaseUploadMiddleware,
  async (req, res) => {
    const { seeker_id, job_id } = req.body;

    try {
      const sssUrl = req.savedFiles.sssFile || null;
      const pagibigUrl = req.savedFiles.pagibigFile || null;
      const philhealthUrl = req.savedFiles.philhealthFile || null;

      // ✅ Update application record
      await db.execute(
        `UPDATE applications 
         SET sss_url = COALESCE(?, sss_url),
             pagibig_url = COALESCE(?, pagibig_url),
             philhealth_url = COALESCE(?, philhealth_url)
         WHERE seeker_id = ? AND job_id = ?`,
        [sssUrl, pagibigUrl, philhealthUrl, seeker_id, job_id]
      );

      // ✅ Add notification (optional)
      await db.execute('INSERT INTO notifications (user_id, message) VALUES (?, ?)', [
        seeker_id,
        `Your additional employment requirements for Job ID ${job_id} have been uploaded successfully.`,
      ]);

      // ✅ Respond with the updated document info
      res.status(200).json({
        message: "Additional requirements uploaded successfully!",
        uploaded: {
          sss: !!sssUrl,
          pagibig: !!pagibigUrl,
          philhealth: !!philhealthUrl,
        },
      });

    } catch (err) {
      console.error("Error uploading additional requirements:", err);
      res.status(500).json({ error: "Server error uploading additional requirements." });
    }
  }
);

// ✅ Fetch already uploaded additional requirements for a seeker
router.get('/applications/additional-documents', async (req, res) => {
  const { seeker_id, job_id } = req.query;

  try {
    const [rows] = await db.execute(
      `SELECT sss_url, pagibig_url, philhealth_url 
       FROM applications 
       WHERE seeker_id = ? AND job_id = ?`,
      [seeker_id, job_id]
    );

    if (rows.length === 0) {
      return res.json({ sss: null, pagibig: null, philhealth: null });
    }

    const record = rows[0];
    res.json({
      sss: record.sss_url || null,
      pagibig: record.pagibig_url || null,
      philhealth: record.philhealth_url || null
    });
  } catch (err) {
    console.error("Error fetching uploaded documents:", err);
    res.status(500).json({ error: "Server error fetching uploaded documents." });
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
    // 1. Get job's requirements
    const [jobRows] = await db.execute('SELECT * FROM jobs WHERE id = ?', [jobId]);
    if (jobRows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }
    const job = jobRows[0];
    const jobSkills = job.skills?.split(',').map(s => s.trim().toLowerCase()) || [];
    const jobEducation = job.education?.toLowerCase() || '';
    const jobDisabilityStatus = job.disability_status || 'Non-PWD';

    // 2. Fetch applicants including all file URLs
    const [applicants] = await db.execute(`
      SELECT 
        u.id, u.name, u.email, u.education, u.skills, u.disability_status, 
        u.date_of_birth, u.address, u.phone_number, u.pwd_id_image,
        a.pds_url, a.application_letter_url, a.diploma_url, a.tor_url,
        a.eligibility_url, a.performance_rating_url, a.trainings_url,
        a.sss_url, a.pagibig_url, a.philhealth_url, 
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

      const universalSkillsSet = new Set([
        "communication", "teamwork", "time management", "problem solving",
        "critical thinking", "adaptability", "leadership", "work ethic"
      ]);

      const matchedSkills = seekerSkills.filter(skill => jobSkills.includes(skill));
      const matchedUniversal = matchedSkills.filter(skill => universalSkillsSet.has(skill));
      const matchedNonUniversal = matchedSkills.filter(skill => !universalSkillsSet.has(skill));

      const skillMatchCount = matchedNonUniversal.length + (matchedNonUniversal.length > 0 ? matchedUniversal.length : 0);
      const educationMatch = (skillMatchCount > 0 && jobEducation === seekerEducation) ? 1 : 0;

      let disabilityMatch = 0;
      if (seekerDisabilityStatus === 'PWD' && jobDisabilityStatus === 'PWD') {
        disabilityMatch = 1;
      }

      const matchScore = (disabilityMatch * 1000) + (educationMatch * 1) + skillMatchCount;

      return {
        ...applicant,
        matchScore,
        age: calculateAge(applicant.date_of_birth),
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


// Update application status
router.put('/applications/:applicationId/status', async (req, res) => {
  const { applicationId } = req.params;
  const { status, interviewTime } = req.body;
  const { createMeetEvent } = require('../services/googleCalendarService');

  const validStatuses = ['shortlisted', 'interviewed', 'selected', 'rejected'];
  if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status value.' });

  try {
    const [updateResult] = await db.execute(
      'UPDATE applications SET status = ? WHERE id = ?',
      [status, applicationId]
    );
    if (updateResult.affectedRows === 0) return res.status(404).json({ error: 'Application not found.' });

    const [[applicant]] = await db.execute(`
      SELECT a.seeker_id, u.name, u.email, j.title AS job_title
      FROM applications a
      JOIN users u ON a.seeker_id = u.id
      JOIN jobs j ON a.job_id = j.id
      WHERE a.id = ?
    `, [applicationId]);

    if (!applicant) return res.status(404).json({ error: 'Applicant not found.' });

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
      html = `<p>Hi <strong>${applicant.name}</strong>,</p>
        <p>Thank you for attending the interview for the <strong>${applicant.job_title}</strong> position.</p>
        <p>We'll contact you about the next steps.</p>
        <p>Best regards,<br/>HR Team</p>`;
      notificationMessage = `You were marked as interviewed for "${applicant.job_title}".`;

    } else if (status === 'selected') {
      subject = `Congratulations! You're selected for ${applicant.job_title}`;
      html = `<p>Hi <strong>${applicant.name}</strong>,</p>
        <p>We’re thrilled to inform you that you’ve been <strong>selected</strong> for the <strong>${applicant.job_title}</strong> position.</p>
        <p>Check the SkillLink Website for next steps.</p>
        <p>Best regards,<br/>HR Team</p>`;
      notificationMessage = `🎉 Congratulations! You’ve been selected for "${applicant.job_title}".`;

    } else if (status === 'rejected') {
      subject = `Application Update - ${applicant.job_title}`;
      html = `<p>Hi <strong>${applicant.name}</strong>,</p>
        <p>Thank you for applying for <strong>${applicant.job_title}</strong>. Unfortunately, you were not selected at this time.</p>
        <p>Best regards,<br/>HR Team</p>`;
      notificationMessage = `Your application for "${applicant.job_title}" was rejected.`;
    }

    // ✅ Fully await email send
    await sendEmail(applicant.email, subject, html);

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
