import { useEffect, useState } from "react"
import { Container, Row, Col, Badge, Tabs, Tab  } from "react-bootstrap"
import { } from "react-bootstrap"
import axios from "axios"
import { useNavigate } from 'react-router-dom';
import "./JobApplicationsPage.css"
import config from "../config"

const API_URL = config.API_URL

function JobApplicationsPage() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate();
  const seekerId = JSON.parse(localStorage.getItem("user"))?.id
  const [selectedTab, setSelectedTab] = useState("applied");


  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await axios.get(`${API_URL}/jobs/applications/seeker/${seekerId}`)
        setApplications(res.data)
      } catch (err) {
        console.error("Error fetching applications:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [seekerId])

  const filteredApplications = applications.filter(app => 
    (selectedTab === "applied" && app.status === "applied") ||
    (selectedTab === "shortlisted" && app.status === "shortlisted") ||
    (selectedTab === "interview" && app.status === "interview") ||
    (selectedTab === "rejected" && app.status === "rejected")
  );

  const getStatusBadge = (status) => {
    const statusConfig = {
      applied: { variant: "dark", text: "Applied" },
      shortlisted: { variant: "warning", text: "Shortlisted" },
      interview: { variant: "primary", text: "Interviewed" },
      accepted: { variant: "success", text: "Accepted" },
      rejected: { variant: "danger", text: "Rejected" },
    }

    const config = statusConfig[status] || { variant: "secondary", text: "Unknown" }
    return <Badge bg={config.variant}>{config.text}</Badge>
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    })
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  if (loading) {
    return (
      <div className="dashboard-wrapper">
        <Container>
          <div className="loading-state">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading your applications...</p>
          </div>
        </Container>
      </div>
    )
  }

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header-section">
        <Container>
          <div className="header-content">
            <div className="header-left">
              <div className="header-icon">
                <i className="fas fa-file-alt"></i>
              </div>
              <div className="header-text">
                <h1 className="dashboard-title">My Job Applications</h1>
                <p className="dashboard-subtitle">Track the jobs you've applied for</p>
              </div>
            </div>
            <div className="header-stats">
              <div className="stat-item">
                <span className="stat-number">{applications.length}</span>
                <span className="stat-label">Total Applications</span>
              </div>
            </div>
          </div>
        </Container>
      </div>

      <Container className="applications-container">
        <Tabs
          activeKey={selectedTab}
          onSelect={(k) => setSelectedTab(k)}
          className="mb-4"
          justify
        >
          <Tab eventKey="applied" title="Applied" />
          <Tab eventKey="shortlisted" title="Shortlisted" />
          <Tab eventKey="interview" title="Interviewed" />
          <Tab eventKey="rejected" title="Rejected" />
        </Tabs>

        {filteredApplications.length === 0 ? (
          <div className="no-applications-wrapper">
            <div className="no-applications-icon">
              <i className="fas fa-file-alt"></i>
            </div>
            <h3 className="no-applications-title">No {selectedTab} Applications</h3>
            <p className="no-applications-text">No job applications found for this status.</p>
          </div>
        ) : (
          <div className="applications-list">
            {filteredApplications.map((app) => (
              <div key={app.id} className="application-item">
                <div className="application-border"></div>
                <div className="application-content">
                  <Row className="align-items-center">
                    <Col lg={6} className="application-main">
                      <div className="application-title-section">
                        <h4 className="application-title">{app.title}</h4>
                        <div className="application-badges">{getStatusBadge(app.status || "pending")}</div>
                      </div> { console.log (app) }
                    </Col>
                    <Col lg={4} className="application-stats">
                      <div className="application-dates">
                        <div className="date-item">
                          <span className="date-label">Applied on</span>
                          <span className="date-value">
                            {formatDate(app.applied_at)} | {formatTime(app.applied_at)}
                          </span>
                        </div>
                        {app.updated_at && app.updated_at !== app.applied_at && (
                          <div className="date-item">
                            <span className="date-label">Updated:</span>
                            <span className="date-value">
                              {formatDate(app.updated_at)} | {formatTime(app.updated_at)}
                            </span>
                          </div>
                        )}
                      </div>
                    </Col>
                    <Col lg={2} className="application-actions">
                      <div className="action-buttons">
                        <button
                          className="action-btn navy-blue-btn"
                          title="View Job"
                          onClick={() => navigate(`/jobs/${app.job_id}`)}
                        >
                          <i className="fas fa-eye me-2"></i> View Job
                        </button>
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>

    </div>
  )
}

export default JobApplicationsPage
