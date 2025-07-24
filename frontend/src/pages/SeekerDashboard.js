import { useEffect, useState } from "react"
import axios from "axios"
import { Card, Container, Row, Col, Button, Form, Badge } from "react-bootstrap"
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import VerifyEmailModal from "../components/VerifyEmailModal";
import IncompleteProfileModal from "../components/IncompleteProfileModal";
import "./SeekerDashboard.css"
import config from '../config';

const API_URL = config.API_URL;

function SeekerDashboard() {
  const { user } = useAuth();
  const [showIncompleteProfileModal, setShowIncompleteProfileModal] = useState(false);
  const [matchingJobs, setMatchingJobs] = useState([])
  const [allJobs, setAllJobs] = useState([])
  const [showAll, setShowAll] = useState(false)
  const [search, setSearch] = useState("")
  const [seekerSkills, setSeekerSkills] = useState([])
  const [filterEmployment, setFilterEmployment] = useState('')
  const [filterDisability, setFilterDisability] = useState('')
  const [seekerDisability, setSeekerDisability] = useState("")
  const [applications, setApplications] = useState([]);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [isVerified, setIsVerified] = useState(true);
  const seekerId = JSON.parse(localStorage.getItem("user"))?.id

  useEffect(() => {

    const checkProfileCompletion = async () => {
      if (!user?.id) return;
      try {
        const res = await axios.get(`${API_URL}/api/users/${user.id}`);
        const profile = res.data;
        
        // Define required fields
        const requiredFields = [
          profile.name,
          profile.skills,
          profile.education,
          profile.phone_number,
          profile.address,
          profile.bio
        ];
    
        const isIncomplete = requiredFields.some(field => !field || field.trim() === "");
    
        if (isIncomplete) {
          setShowIncompleteProfileModal(true);
        }
      } catch (err) {
        console.error("Error checking profile completion:", err);
      }
    };

    const fetchJobs = async () => {
      try {
        const res = await axios.get(`${API_URL}/jobs/seeker/${seekerId}`)
        setMatchingJobs(res.data.matchingJobs)
        setAllJobs(res.data.allJobs)
        const seeker = res.data.seeker
  
        // Check verification
        if (seeker?.is_verified === 0) {
          setIsVerified(false);
          setShowVerifyModal(true); // This comes first
        } else {
          checkProfileCompletion(); // Only check if verified
        }
        
        checkProfileCompletion();
  
        if (seeker?.skills) {
          setSeekerSkills(seeker.skills.split(",").map((s) => s.trim().toLowerCase()))
        }
        if (seeker?.disability_status) {
          setSeekerDisability(seeker.disability_status)
        }
        console.log(seeker)
      } catch (err) {
        console.error("Error fetching jobs:", err)
      }
    }
  
    const fetchApplications = async () => {
      try {
        const res = await axios.get(`${API_URL}/jobs/applications/seeker/${seekerId}`);
        setApplications(res.data);
      } catch (err) {
        console.error("Error fetching applications:", err);
      }
    };
    
    fetchApplications();
    fetchJobs();
  }, [seekerId])
  


  // Count skill matches
  const getEnhancedMatchCount = (job) => {
    if (!job.skills || !Array.isArray(seekerSkills)) return 0;
  
    const jobSkillList = job.skills.split(",").map((s) => s.trim().toLowerCase());
    const skillMatchCount = seekerSkills.filter((skill) => jobSkillList.includes(skill)).length;
  
    // Bonus match value if PWD seeker and job is also PWD
    const disabilityBonus = (seekerDisability === 'PWD' && job.disability_status === 'PWD') ? 1 : 0;
  
    return skillMatchCount + disabilityBonus;
  };
  

  // Get jobs to display (filtered by search)
  const jobsToShow = (showAll ? allJobs : matchingJobs)
  .filter(
    (job) =>
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.description.toLowerCase().includes(search.toLowerCase())
  )
  .filter(
    (job) =>
      (filterEmployment === '' || job.employment_type === filterEmployment) &&
      (filterDisability === '' || job.disability_status === filterDisability)
  )
  .filter((job) => {
    if (!showAll && seekerDisability === 'PWD' && job.disability_status === 'Non-PWD') {
      return false;
    }
    return true;
  })
  .filter((job) => {
    const skillMatches = getEnhancedMatchCount(job);
    return showAll || skillMatches > 0;
  });

  // Visual intensity for match levels
  const getMatchBadge = (count) => {
    if (count >= 6) return <Badge bg={null} className="match-badge strong-match">Strong Skills Match</Badge>
    if (count >= 4) return <Badge bg={null} className="match-badge moderate-match">Moderate Skills Match</Badge>
    if (count >= 2) return <Badge bg={null} className="match-badge weak-match">Weak Skills Match</Badge>
    if (count >= 1) return <Badge bg={null} className="match-badge weak-match">Very Weak Skills Match</Badge>
    return null
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
              <span className="stat-number">
                {
                  matchingJobs.filter((job) => getEnhancedMatchCount(job) > 0).length
                }
              </span>
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

      <Container className="dashboard-container mb-5 pb-3">
        {/* Controls Section */}
        <div className="controls-section">
          <div className="section-header">
            <div className="section-title-wrapper">
              <i className="fas fa-filter section-icon"></i>
              <h2 className="section-title">{showAll ? "All Job Listings" : "Matching Job Listings"}</h2>
            </div>
          </div>

          {/* Enhanced Search Bar and Filters */}
          <div className="search-filter-container">
            <div className="search-filter-left">
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
              <div className="filters-container">
                <Form.Select 
                  className="filter-form" 
                  value={filterEmployment} 
                  onChange={(e) => setFilterEmployment(e.target.value)}
                >
                  <option value="">All Employment Types</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </Form.Select>

                <Form.Select 
                  className="filter-form" 
                  value={filterDisability} 
                  onChange={(e) => setFilterDisability(e.target.value)}
                >
                  <option value="">All Disability Status</option>
                  <option value="PWD">PWD</option>
                  <option value="Non-PWD">Non-PWD</option>
                </Form.Select>
              </div>
            </div>
            
            <div className="toggle-button-container">
              <Button className="toggle-button" variant="warning" onClick={() => setShowAll(!showAll)}>
                <i className={`fas ${showAll ? "fa-star" : "fa-list"} me-2`}></i>
                {showAll ? "Show Matching Only" : "Show All Jobs"}
              </Button>
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
                const matchCount = getEnhancedMatchCount(job);
                const matchBadge = getMatchBadge(matchCount);
              
                return (
                  <Col xs={12} sm={6} lg={4} key={job.id} className="mb-4">
                    <Card className="job-card h-100">
                      <Card.Body className="job-card-body">
                        <div>
                          <div className="job-header">
                            <Card.Title className="job-title">{job.title}</Card.Title>
                            <div className="job-badges">
                              {job.disabilityMatch === 1 && seekerDisability === 'PWD' && (
                                <Badge bg={null} className="disability-badge">
                                  <i className="fas fa-wheelchair me-1"></i> PWD Friendly
                                </Badge>
                              )}
                              {job.educationMatch === 1 && matchCount > 0 && (
                                <Badge bg={null} className="education-badge">
                                  <i className="fas fa-graduation-cap me-1"></i>
                                  Education Match
                                </Badge>
                              )}
                              {matchBadge}
                            </div>
                          </div>
                          <Card.Text className="job-description multiline-truncate">{job.description}</Card.Text>
                        </div>

                        <div>
                          <div className="job-details">
                            <div className="detail-item">
                              <div className="detail-header m-0">
                                <i className="fas fa-graduation-cap detail-icon"></i>
                                <strong>Education Required:</strong>
                              </div>
                              <p className="detail-text">{job.education}</p>
                            </div>

                            <div className="detail-item">
                              <div className="detail-header m-0">
                                <i className="fas fa-wheelchair detail-icon"></i>
                                <strong>Disability Status:</strong>
                              </div>
                              <p className="detail-text">
                                {job.disability_status === 'PWD' ? (
                                  <span>PWD-Friendly</span>
                                ) : (
                                  <span>Not PWD-Friendly</span>
                                )}
                              </p>
                            </div>

                            <div className="detail-item">
                              <div className="detail-header m-0">
                                <i className="fas fa-briefcase detail-icon"></i>
                                <strong>Employment Type:</strong>
                              </div>
                              <p className="detail-text">{job.employment_type}</p>
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

                          <Link to={`/jobs/${job.id}`} className="btn navy-blue-btn w-100 mt-3">
                            <i className="fas fa-eye me-2"></i>
                            View Details
                          </Link>

                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                )
              })
            )}
          </Row>
      </Container>
      <VerifyEmailModal 
        show={showVerifyModal} 
        onClose={() => {
          setShowVerifyModal(false);
          if (!isVerified && showIncompleteProfileModal) {
            setTimeout(() => setShowIncompleteProfileModal(true), 100); 
          }
        }} 
        name={user?.name}
      />

      <IncompleteProfileModal 
        show={!showVerifyModal && showIncompleteProfileModal}
      />

    </div>
  )
}

export default SeekerDashboard