import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Container, Row, Col, Button, Form, Badge } from 'react-bootstrap';

function SeekerDashboard() {
  const [matchingJobs, setMatchingJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [search, setSearch] = useState('');
  const [seekerSkills, setSeekerSkills] = useState([]);

  const seekerId = JSON.parse(localStorage.getItem('user'))?.id;

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/jobs/seeker/${seekerId}`);
        setMatchingJobs(res.data.matchingJobs);
        setAllJobs(res.data.allJobs);
        const seeker = res.data.seeker;
        if (seeker?.skills) {
          setSeekerSkills(seeker.skills.split(',').map(s => s.trim().toLowerCase()));
        }
      } catch (err) {
        console.error('Error fetching jobs:', err);
      }
    };

    fetchJobs();
  }, [seekerId]);

  // Get jobs to display (filtered by search)
  const jobsToShow = (showAll ? allJobs : matchingJobs).filter(job =>
    job.title.toLowerCase().includes(search.toLowerCase()) ||
    job.description.toLowerCase().includes(search.toLowerCase())
  );

  // Count skill matches
  const getSkillMatchCount = (jobSkills) => {
    if (!jobSkills || !Array.isArray(seekerSkills)) return 0;
    const jobSkillList = jobSkills.split(',').map(s => s.trim().toLowerCase());
    return seekerSkills.filter(skill => jobSkillList.includes(skill)).length;
  };

  // Visual intensity for match levels
  const getMatchBadge = (count) => {
    if (count >= 4) return <Badge bg="success">Strong Match</Badge>;
    if (count >= 2) return <Badge bg="warning">Moderate Match</Badge>;
    if (count >= 1) return <Badge bg="secondary">Weak Match</Badge>;
    return null;
  };

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>{showAll ? 'All Job Listings' : 'Matching Job Listings'}</h2>
        <Button variant="primary" onClick={() => setShowAll(!showAll)}>
          {showAll ? 'Show Matching Only' : 'Show All Jobs'}
        </Button>
      </div>

      <Form className="mb-4">
        <Form.Control
          type="text"
          placeholder="Search by title or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Form>

      <Row>
        {jobsToShow.length === 0 ? (
          <p>No jobs found.</p>
        ) : (
          jobsToShow.map((job) => {
            const matchCount = getSkillMatchCount(job.skills);
            const matchBadge = getMatchBadge(matchCount);

            return (
              <Col md={6} lg={4} key={job.id} className="mb-4">
                <Card border={matchCount >= 2 ? 'success' : ''}>
                  <Card.Body>
                  <Card.Title>{job.title} {matchBadge}</Card.Title>
                    {job.matchScore >= 100 && <Badge bg="info">Education Match</Badge>}

                    <Card.Text>{job.description}</Card.Text>
                    <p><strong>Education Required:</strong> {job.education}</p>
                    <p><strong>Skills:</strong> {job.skills}</p>
                  </Card.Body>
                </Card>
              </Col>
            );
          })
        )}
      </Row>
    </Container>
  );
}

export default SeekerDashboard;
