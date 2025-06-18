"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Card, Container, Row, Col, Button, Form, Badge } from "react-bootstrap"
import "./SeekerDashboard.css"

function SeekerDashboard() {
  const [matchingJobs, setMatchingJobs] = useState([])
  const [allJobs, setAllJobs] = useState([])
  const [showAll, setShowAll] = useState(false)
  const [search, setSearch] = useState("")
  const [seekerSkills, setSeekerSkills] = useState([])

  const seekerId = JSON.parse(localStorage.getItem("user"))?.id

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/jobs/seeker/${seekerId}`)
        setMatchingJobs(res.data.matchingJobs)
        setAllJobs(res.data.allJobs)
        const seeker = res.data.seeker
        if (seeker?.skills) {
          setSeekerSkills(seeker.skills.split(",").map((s) => s.trim().toLowerCase()))
        }
      } catch (err) {
        console.error("Error fetching jobs:", err)
      }
    }

    fetchJobs()
  }, [seekerId])

  // Get jobs to display (filtered by search)
  const jobsToShow = (showAll ? allJobs : matchingJobs).filter(
    (job) =>
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.description.toLowerCase().includes(search.toLowerCase()),
  )

  // Count skill matches
  const getSkillMatchCount = (jobSkills) => {
    if (!jobSkills || !Array.isArray(seekerSkills)) return 0
    const jobSkillList = jobSkills.split(",").map((s) => s.trim().toLowerCase())
    return seekerSkills.filter((skill) => jobSkillList.includes(skill)).length
  }

  // Visual intensity for match levels
  const getMatchBadge = (count) => {
    if (count >= 4) return <Badge bg={null} className="match-badge strong-match">Strong Match</Badge>
    if (count >= 2) return <Badge bg={null} className="match-badge moderate-match">Moderate Match</Badge>
    if (count >= 1) return <Badge bg={null} className="match-badge weak-match">Weak Match</Badge>
    return null
  }

  // Get card styling based on match count
  const getCardClass = (matchCount) => {
    const baseClass = "job-card h-100"
    if (matchCount >= 4) return `${baseClass} strong-match-card`
    if (matchCount >= 2) return `${baseClass} moderate-match-card`
    return baseClass
  }

  return (
    <div className="dashboard-wrapper">
      {/* Professional Header */}
      <div className="dashboard-header-section">
        <Container>
          <div className="header-content">
            <div className="header-left">
              <div className="header-icon">
                <i className="fas fa-briefcase"></i>
              </div>
              <div className="header-text">
                <h1 className="dashboard-title">Job Dashboard</h1>
                <p className="dashboard-subtitle">Find your perfect career opportunity</p>
              </div>
            </div>
            <div className="header-stats">
              <div className="stat-item">
                <span className="stat-number">{matchingJobs.length}</span>
                <span className="stat-label">Matches</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{allJobs.length}</span>
                <span className="stat-label">Total Jobs</span>
              </div>
            </div>
          </div>
        </Container>
      </div>

      <Container className="dashboard-container">
        {/* Controls Section */}
        <div className="controls-section">
          <div className="section-header">
            <div className="section-title-wrapper">
              <i className="fas fa-filter section-icon"></i>
              <h2 className="section-title">{showAll ? "All Job Listings" : "Matching Job Listings"}</h2>
            </div>
            <Button className="toggle-button" onClick={() => setShowAll(!showAll)}>
              <i className={`fas ${showAll ? "fa-star" : "fa-list"} me-2`}></i>
              {showAll ? "Show Matching Only" : "Show All Jobs"}
            </Button>
          </div>

          {/* Enhanced Search Bar */}
          <div className="search-wrapper">
            <div className="search-input-wrapper">
              <i className="fas fa-search search-icon"></i>
              <Form.Control
                type="text"
                placeholder="Search by title or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        </div>

        {/* Jobs Grid */}
        <Row className="jobs-grid">
          {jobsToShow.length === 0 ? (
            <Col xs={12}>
              <div className="no-jobs-wrapper">
                <div className="no-jobs-icon">
                  <i className="fas fa-briefcase"></i>
                </div>
                <h3 className="no-jobs-title">No jobs found</h3>
                <p className="no-jobs-text">Try adjusting your search criteria or view all jobs.</p>
              </div>
            </Col>
          ) : (
            jobsToShow.map((job) => {
              const matchCount = getSkillMatchCount(job.skills)
              const matchBadge = getMatchBadge(matchCount)

              return (
                <Col md={6} lg={4} key={job.id} className="mb-4">
                  <Card className={getCardClass(matchCount)}>
                    <Card.Body className="job-card-body">
                      <div className="job-header">
                        <Card.Title className="job-title">{job.title}</Card.Title>
                        <div className="job-badges">
                          {matchBadge}
                          {job.matchScore >= 100 && (
                            <Badge bg={null} className="education-badge">
                              <i className="fas fa-graduation-cap me-1"></i>
                              Education Match
                            </Badge>
                          )}
                        </div>
                      </div>

                      <Card.Text className="job-description">{job.description}</Card.Text>

                      <div className="job-details">
                        <div className="detail-item">
                          <div className="detail-header">
                            <i className="fas fa-graduation-cap detail-icon"></i>
                            <strong>Education Required:</strong>
                          </div>
                          <p className="detail-text">{job.education}</p>
                        </div>

                        <div className="detail-item">
                          <div className="detail-header">
                            <i className="fas fa-tools detail-icon"></i>
                            <strong>Skills:</strong>
                          </div>
                          <div className="skills-container">
                            {job.skills.split(",").map((skill, index) => (
                              <Badge bg={null} key={index} className="skill-badge">
                                {skill.trim()}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <Button className="view-details-btn w-100 mt-3">
                        <i className="fas fa-eye me-2"></i>
                        View Details
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              )
            })
          )}
        </Row>
      </Container>
    </div>
  )
}

export default SeekerDashboard
