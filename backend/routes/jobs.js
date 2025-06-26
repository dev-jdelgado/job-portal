const express = require('express');
const router = express.Router();
const db = require('../db'); // your mysql2 connection

router.post('/', async (req, res) => {
    const { title, description, education, skills, employer_id } = req.body;
    try {
      const sql = `INSERT INTO jobs (title, description, education, skills, employer_id)
                   VALUES (?, ?, ?, ?, ?)`;
      await db.execute(sql, [title, description, education, skills, employer_id]);
      res.status(201).json({ message: 'Job posted successfully' });
    } catch (err) {
      console.error('Error posting job:', err);
      res.status(500).json({ error: 'Server error' });
    }
});

// New route to get jobs posted by a specific employer
router.get('/employer/:employerId', async (req, res) => {
    const { employerId } = req.params;
    try {
        const [rows] = await db.execute('SELECT * FROM jobs WHERE employer_id = ? ORDER BY created_at DESC', [employerId]);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching employer jobs:', err);
        res.status(500).json({ error: 'Server error' });
    }
});0 


router.get('/seeker/:id', async (req, res) => {
  const seekerId = req.params.id;

  try {
    // Get seeker
    const [seekerRows] = await db.execute('SELECT skills, education FROM users WHERE id = ?', [seekerId]);
    if (seekerRows.length === 0) return res.status(404).json({ message: 'Seeker not found' });

    const seeker = seekerRows[0];
    const seekerSkills = seeker.skills?.split(',').map(s => s.trim().toLowerCase()) || [];
    const seekerEducation = seeker.education?.toLowerCase() || '';

    const [jobs] = await db.execute('SELECT * FROM jobs');

    const rankedJobs = jobs.map(job => {
      const jobSkills = job.skills?.split(',').map(s => s.trim().toLowerCase()) || [];
      const jobEducation = job.education?.toLowerCase() || '';

      const skillMatchCount = seekerSkills.filter(skill => jobSkills.includes(skill)).length;
      const educationMatch = jobEducation === seekerEducation ? 1 : 0;

      return {
        ...job,
        matchScore: (educationMatch * 100) + skillMatchCount // prioritize education match
      };
    });

    // Sort descending by matchScore
    rankedJobs.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      seeker,
      matchingJobs: rankedJobs.filter(job => job.matchScore > 0),
      allJobs: rankedJobs
    });

  } catch (err) {
    console.error('Error fetching jobs:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


  

module.exports = router;
