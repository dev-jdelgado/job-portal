import { useEffect, useState } from "react"
import { Container, Badge, Tabs, Tab, Form } from "react-bootstrap";
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 576);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 576);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    (selectedTab === "interviewed" && app.status === "interviewed") ||
    (selectedTab === "selected" && app.status === "selected") ||
    (selectedTab === "rejected" && app.status === "rejected")
  );

  const statusCounts = {
    applied: applications.filter(app => app.status === "applied").length,
    shortlisted: applications.filter(app => app.status === "shortlisted").length,
    interviewed: applications.filter(app => app.status === "interviewed").length,
    selected: applications.filter(app => app.status === "selected").length,
    rejected: applications.filter(app => app.status === "rejected").length,
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      applied: { variant: "dark", text: "Applied" },
      shortlisted: { variant: "success", text: "Shortlisted" },
      interviewed: { variant: "success", text: "Interviewed" },
      selected: { variant: "success", text: "Selected" },
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
        
      {isMobile ? (
        <Form.Select
          className="mb-4"
          value={selectedTab}
          onChange={(e) => setSelectedTab(e.target.value)}
        >
          <option value="applied">Applied ({statusCounts.applied})</option>
          <option value="shortlisted">Shortlisted ({statusCounts.shortlisted})</option>
          <option value="interviewed">Interviewed ({statusCounts.interviewed})</option>
          <option value="selected">Selected ({statusCounts.selected})</option>
          <option value="rejected">Rejected ({statusCounts.rejected})</option>
        </Form.Select>
      ) : (
        <Tabs
          activeKey={selectedTab}
          onSelect={(k) => setSelectedTab(k)}
          className="mb-4"
          justify
        >
          <Tab eventKey="applied" title={`Applied (${statusCounts.applied})`} />
          <Tab eventKey="shortlisted" title={`Shortlisted (${statusCounts.shortlisted})`} />
          <Tab eventKey="interviewed" title={`Interviewed (${statusCounts.interviewed})`} />
          <Tab eventKey="selected" title={`Selected (${statusCounts.selected})`} />
          <Tab eventKey="rejected" title={`Rejected (${statusCounts.rejected})`} />
        </Tabs>
      )}


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
                <div className="application-content">
                  <div className="d-flex flex-sm-row flex-column align-items-center justify-content-between gap-sm-5 gap-2">
                    <div className="d-flex flex-lg-row flex-column justify-content-between align-items-lg-center align-items-start w-100">
                      <div className="application-main">
                        <div className="application-title-section">
                          <h4 className="application-title">{app.title}</h4>
                          <div className="application-badges">{getStatusBadge(app.status || "pending")}</div>
                        </div>
                      </div>
                      <div className="application-stats">
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
                      </div>
                    </div>
                    <div className="application-actions">
                      <div className="action-buttons w-100">
                        <button
                          className="action-btn navy-blue-btn w-100"
                          title="View Job"
                          onClick={() => navigate(`/jobs/${app.job_id}`)}
                        >
                          <i className="fas fa-eye me-2"></i> View Job
                        </button>
                      </div>
                    </div>
                  </div>
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
