"use client"

import { useState, useEffect } from "react"
import { Button, Container, Toast, ToastContainer, Table, Card, Row, Col, Badge, Spinner, Alert } from "react-bootstrap"
import {
  BsBriefcaseFill,
  BsPeopleFill,
  BsEyeFill,
  BsCheckCircleFill,
  BsPlusCircleFill,
  BsPencilSquare,
  BsTrash3Fill,
} from "react-icons/bs"
import JobPostModal from "../components/JobPostModal"
import { useAuth } from "../context/AuthContext"
import axios from "axios"
import styles from "./EmployerDashboard.css"

function EmployerDashboard() {
  const [showModal, setShowModal] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [employerJobs, setEmployerJobs] = useState([])
  const [jobStats, setJobStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    recentViews: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuth()

  const employerId = user?.id

  const fetchEmployerJobs = async () => {
    if (!employerId) return

    setLoading(true)
    setError(null)

    try {
      const res = await axios.get(`http://localhost:5000/jobs/employer/${employerId}`)
      setEmployerJobs(res.data)

      // Calculate stats
      const stats = {
        totalJobs: res.data.length,
        activeJobs: res.data.length, // Assuming all jobs are active for now
        totalApplications: Math.floor(Math.random() * 100), // Mock data
        recentViews: Math.floor(Math.random() * 500), // Mock data
      }
      setJobStats(stats)
    } catch (err) {
      console.error("Error fetching employer jobs:", err)
      setError("Failed to load your jobs. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployerJobs()
  }, [employerId])

  const handleJobPosted = () => {
    setToastMessage("Job posted successfully!")
    setShowToast(true)
    fetchEmployerJobs()
  }

  const handleEditJob = (jobId) => {
    // open an edit modal with pre-filled data
    setToastMessage(`Edit functionality for job ${jobId} coming soon!`)
    setShowToast(true)
  }

  const handleDeleteJob = async (jobId) => {
    if (window.confirm("Are you sure you want to delete this job posting?")) {
      try {
        // Uncomment when backend is ready
        // await axios.delete(`http://localhost:5000/jobs/${jobId}`);

        // Simulate successful deletion
        setEmployerJobs((prev) => prev.filter((job) => job.id !== jobId))
        setToastMessage("Job deleted successfully!")
        setShowToast(true)

        // Update stats
        setJobStats((prev) => ({
          ...prev,
          totalJobs: prev.totalJobs - 1,
          activeJobs: prev.activeJobs - 1,
        }))
      } catch (err) {
        console.error("Error deleting job:", err)
        setToastMessage("Failed to delete job. Please try again.")
        setShowToast(true)
      }
    }
  }

  const handleViewJob = (jobId) => {
    // will edit when the jobs posting is complete with details.
    setToastMessage(`Viewing job ${jobId} - feature coming soon!`)
    setShowToast(true)
  }

  const getBadgeVariant = (type) => {
  if (typeof type !== "string") return "light"; // default/fallback

  switch (type.toLowerCase()) {
    case "full-time":
      return "primary"; 
    case "part-time":
      return "info";
    case "contract":
      return "warning";
    case "internship":
      return "secondary";
    default:
      return "light";
  }
};


  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <Container className={styles.dashboardContainer}>
        <div className={styles.loadingContainer}>
          <Spinner animation="border" size="lg" className={styles.loadingSpinner} />
          <p className="mt-3">Loading your dashboard...</p>
        </div>
      </Container>
    )
  }

  return (
    <Container fluid className={styles.dashboardContainer}>
      {/* Header Section */}
      <div className={styles.dashboardHeader}>
        <Container>
          <Row className="align-items-center">
            <Col lg={8}>
              <h1 className={styles.dashboardTitle}>
                <BsBriefcaseFill className="me-3" />
                Employer Dashboard
              </h1>
              <p className={styles.dashboardSubtitle}>Manage your job postings and track applications</p>
            </Col>
            <Col lg={4} className="text-lg-end">
              <Button onClick={() => setShowModal(true)} className={styles.btnPostJob} size="lg">
                <BsPlusCircleFill className="me-2" />
                Post New Job
              </Button>
            </Col>
          </Row>
        </Container>
      </div>

      <Container>
        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        {/* Stats Cards */}
        <Row className={styles.statsRow}>
          <Col md={6} lg={3} className="mb-4">
            <Card className={styles.statsCard}>
              <Card.Header className="d-flex align-items-center">
                <BsBriefcaseFill className="me-2" />
                Total Jobs
              </Card.Header>
              <Card.Body className="text-center">
                <div className={styles.statsValue}>{jobStats.totalJobs}</div>
                <div className={styles.statsDescription}>Jobs Posted</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={3} className="mb-4">
            <Card className={styles.statsCard}>
              <Card.Header className="d-flex align-items-center">
                <BsCheckCircleFill className="me-2" />
                Active Jobs
              </Card.Header>
              <Card.Body className="text-center">
                <div className={styles.statsValue}>{jobStats.activeJobs}</div>
                <div className={styles.statsDescription}>Currently Active</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={3} className="mb-4">
            <Card className={styles.statsCard}>
              <Card.Header className="d-flex align-items-center">
                <BsPeopleFill className="me-2" />
                Applications
              </Card.Header>
              <Card.Body className="text-center">
                <div className={styles.statsValue}>{jobStats.totalApplications}</div>
                <div className={styles.statsDescription}>Total Applications</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={3} className="mb-4">
            <Card className={styles.statsCard}>
              <Card.Header className="d-flex align-items-center">
                <BsEyeFill className="me-2" />
                Views
              </Card.Header>
              <Card.Body className="text-center">
                <div className={styles.statsValue}>{jobStats.recentViews}</div>
                <div className={styles.statsDescription}>Recent Views</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Jobs Table */}
        <Card className={styles.jobsTableCard}>
          <Card.Header>
            <h3 className={styles.jobsTableTitle}>Your Job Postings</h3>
            <p className={styles.jobsTableSubtitle}>Manage and track all your posted positions</p>
          </Card.Header>
          <Card.Body className="p-0">
            {employerJobs.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>
                  <BsBriefcaseFill />
                </div>
                <h5>No Jobs Posted Yet</h5>
                <p>Start by posting your first job to attract top talent!</p>
                <Button onClick={() => setShowModal(true)} className={styles.btnPostJob}>
                  <BsPlusCircleFill className="me-2" />
                  Post Your First Job
                </Button>
              </div>
            ) : (
              <Table responsive className={styles.jobsTable}>
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Type</th>
                    <th>Level</th>
                    <th>Education</th>
                    <th>Skills</th>
                    <th>Posted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employerJobs.map((job) => (
                    <tr key={job.id}>
                      <td>
                        <div className={styles.jobTitle}>{job.title}</div>
                        {job.description && (
                          <div className={styles.jobDescription}>{job.description.substring(0, 100)}...</div>
                        )}
                      </td>
                      <td>
                        <Badge bg={getBadgeVariant(job.employment_type)} className={styles.badge}>
                          {job.employment_type}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg="secondary" className={styles.badge}>
                          {job.applicant_type}
                        </Badge>
                      </td>
                      <td>{job.education}</td>
                      <td>
                        <span title={job.skills}>
                          {job.skills.length > 30 ? `${job.skills.substring(0, 30)}...` : job.skills}
                        </span>
                      </td>
                      <td>{formatDate(job.created_at)}</td>
                      <td>
                        <div className={styles.actionButtons}>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className={styles.btnView}
                            onClick={() => handleViewJob(job.id)}
                            title="View Job"
                          >
                            <BsEyeFill />
                          </Button>
                          <Button
                            variant="outline-warning"
                            size="sm"
                            className={styles.btnEdit}
                            onClick={() => handleEditJob(job.id)}
                            title="Edit Job"
                          >
                            <BsPencilSquare />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className={styles.btnDelete}
                            onClick={() => handleDeleteJob(job.id)}
                            title="Delete Job"
                          >
                            <BsTrash3Fill />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      </Container>

      {/* Job Post Modal */}
      <JobPostModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        employerId={employerId}
        onJobPosted={handleJobPosted}
      />

      {/* Toast Notifications */}
      <ToastContainer position="top-end" className="p-3">
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={4000}
          autohide
          className={styles.successToast}
        >
          <Toast.Header>
            <BsCheckCircleFill className="me-2" />
            <strong className="me-auto">Success</strong>
          </Toast.Header>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  )
}

export default EmployerDashboard
