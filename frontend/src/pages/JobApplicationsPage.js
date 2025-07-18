"use client"

import { useEffect, useState } from "react"
import { Container, Row, Col, Badge } from "react-bootstrap"
import axios from "axios"
import "./JobApplicationsPage.css"
import config from "../config"

const API_URL = config.API_URL

function JobApplicationsPage() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const seekerId = JSON.parse(localStorage.getItem("user"))?.id

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

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: "warning", text: "Pending" },
      reviewed: { variant: "info", text: "Reviewed" },
      accepted: { variant: "success", text: "Accepted" },
      rejected: { variant: "danger", text: "Rejected" },
      interview: { variant: "primary", text: "Interview" },
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
        {applications.length === 0 ? (
          <div className="no-applications-wrapper">
            <div className="no-applications-icon">
              <i className="fas fa-file-alt"></i>
            </div>
            <h3 className="no-applications-title">No Applications Found</h3>
            <p className="no-applications-text">You haven't applied for any jobs yet.</p>
          </div>
        ) : (
          <div className="applications-list">
            {applications.map((app, index) => (
              <div key={app.id} className="application-item">
                <div className="application-border"></div>
                <div className="application-content">
                  <Row className="align-items-center">
                    <Col lg={4} className="application-main">
                      <div className="application-title-section">
                        <h4 className="application-title">{app.title}</h4>
                        <div className="application-badges">{getStatusBadge(app.status || "pending")}</div>
                      </div>
                      <div className="application-dates">
                        <div className="date-item">
                          <span className="date-label">Applied:</span>
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

                    <Col lg={3} className="application-details">
                      <div className="detail-section">
                        <div className="detail-item">
                          <span className="detail-label">Company:</span>
                          <span className="detail-value">{app.company || "Not specified"}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Location:</span>
                          <span className="detail-value">{app.location || "Remote"}</span>
                        </div>
                      </div>
                    </Col>

                    <Col lg={3} className="application-stats">
                      <div className="stats-section">
                        <div className="stat-group">
                          <div className="stat-header">Application Stats:</div>
                          <div className="stat-row">
                            <span className="stat-label">Status:</span>
                            <span className="stat-value">{app.status || "Pending"}</span>
                          </div>
                          <div className="stat-row">
                            <span className="stat-label">Response:</span>
                            <span className="stat-value">{app.response_received ? "Yes" : "Waiting"}</span>
                          </div>
                        </div>
                      </div>
                    </Col>

                    <Col lg={2} className="application-actions">
                      <div className="action-buttons">
                        <button className="action-btn view-btn" title="View Details">
                          <i className="fas fa-eye"></i>
                        </button>
                        <button className="action-btn edit-btn" title="Edit Application">
                          <i className="fas fa-edit"></i>
                        </button>
                        <button className="action-btn link-btn" title="View Job Posting">
                          <i className="fas fa-external-link-alt"></i>
                        </button>
                        <button className="action-btn more-btn" title="More Options">
                          <i className="fas fa-ellipsis-h"></i>
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
