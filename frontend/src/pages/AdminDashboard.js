import { useState, useEffect } from "react"
import { Button, Container, Toast, ToastContainer, Table, Card, Row, Col, Badge, Spinner, Alert, Modal } from "react-bootstrap"
import {
  BsBriefcaseFill,
  BsPeopleFill,
  BsEyeFill,
  BsCheckCircleFill,
  BsPlusCircleFill,
  BsPencilSquare,
  BsTrash3Fill,
  BsExclamationCircleFill, 
  BsInfoCircleFill
} from "react-icons/bs"
import JobPostModal from "../components/JobPostModal"
import { useAuth } from "../context/AuthContext"
import axios from "axios"
import styles from "./AdminDashboard.css"
import { Link } from 'react-router-dom';
import config from '../config';

const API_URL = config.API_URL;


function AdminDashboard() {
  const [showModal, setShowModal] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [adminJobs, setAdminJobs] = useState([])
  const [jobStats, setJobStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    recentViews: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuth()
  const [selectedJob, setSelectedJob] = useState(null)
  const [startStep, setStartStep] = useState(1)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [jobToDelete, setJobToDelete] = useState(null)
  const [toastVariant, setToastVariant] = useState("success")
  const [toastIconType, setToastIconType] = useState("check")

  const adminId = user?.id

  const fetchAdminJobs = async () => {
    if (!adminId) return;
  
    setLoading(true);
    setError(null);
  
    try {
      const jobsRes = await axios.get(`${API_URL}/jobs/admin/${adminId}`);
      setAdminJobs(jobsRes.data);
  
      const countRes = await axios.get(`${API_URL}/jobs/admin/${adminId}/applications/count`);
      const totalApplications = countRes.data.total_applications;
  
      const stats = {
        totalJobs: jobsRes.data.length,
        activeJobs: jobsRes.data.length, // you can add logic to filter inactive jobs
        totalApplications,
        recentViews: Math.floor(Math.random() * 500), // still mock
      };
  
      setJobStats(stats);
    } catch (err) {
      console.error("Error fetching admin jobs or applications:", err);
      setError("Failed to load your jobs. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchAdminJobs()
  }, [adminId])

  const handleJobPosted = (type = "create") => {
    if (type === "update") {
      setToastMessage("Job updated successfully!")
      setToastVariant("primary")
      setToastIconType("info")
    } else {
      setToastMessage("Job posted successfully!")
      setToastVariant("success")
      setToastIconType("check") 
    }
    setShowToast(true)
    fetchAdminJobs()
  }

  const handleEditJob = (job, step = 1) => {
    setSelectedJob(job)
    setStartStep(step)
    setShowModal(true)
  }

  const handleDeleteJob = async () => {
    if (!jobToDelete) return;
  
    try {
      await axios.delete(`${API_URL}/jobs/${jobToDelete.id}`);
      
      setAdminJobs((prev) => prev.filter((job) => job.id !== jobToDelete.id));
      setToastMessage("Job deleted successfully!");
      setToastVariant("danger");
      setToastIconType("exclamation");
      setShowToast(true);
  
      setJobStats((prev) => ({
        ...prev,
        totalJobs: prev.totalJobs - 1,
        activeJobs: prev.activeJobs - 1,
      }));
    } catch (err) {
      console.error("Error deleting job:", err);
  
      const msg = err.response?.data?.error || "Failed to delete job. Please try again.";
  
      setToastMessage(msg);
      setToastVariant("danger");
      setToastIconType("exclamation");
      setShowToast(true);
    } finally {
      setShowDeleteModal(false);
      setJobToDelete(null);
    }
  };
  
  
  

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
      return "success";
    case "internship":
      return "secondary";
    default:
      return "light";
    }
  };

  const getBadgeVariantDisability = (type) => {
  if (typeof type !== "string") return "light"; // default/fallback

  switch (type.toLowerCase()) {
    case "non-pwd":
      return "success"; 
    case "pwd":
      return "danger"; 
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
                Admin Dashboard
              </h1>
              <p className={styles.dashboardSubtitle}>Manage your job postings and track applications</p>
            </Col>
            <Col lg={4} className="text-lg-end d-flex justify-content-end gap-3">


              {user?.role === 'admin' && (
                <div>
                  <Link to="/admin/create-user" className="btn btn-primary">
                    <BsPlusCircleFill className="me-2" />
                    Add Admin
                  </Link>
                </div>
              )}
              <Button onClick={() => setShowModal(true)} className="btn btn-primary">
                <BsPlusCircleFill className="me-2" />
                Post New Job
              </Button>
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="mb-5 pb-3">
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
          <Card.Body className="">
            {adminJobs.length === 0 ? (
              <div className={styles.emptyState}>
                <div className="d-flex align-items-center gap-2">
                  <BsBriefcaseFill />
                  <h5 className="m-0">No Jobs Posted Yet</h5>
                </div>
                <p>Start by posting your first job to attract top talent!</p>
              </div>
            ) : (
              <Table responsive className={styles.jobsTable}>
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Education</th>
                    <th>Skills</th>
                    <th>Applicants</th>
                    <th>Posted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {adminJobs.map((job) => (
                    <tr key={job.id}>
                      <td>
                        <div className='fw-semibold'>{job.title}</div>
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
                        <Badge bg={getBadgeVariantDisability(job.disability_status)} className={styles.badge}>
                          {job.disability_status}
                        </Badge>
                      </td>
                      <td>{job.education}</td>
                      <td>
                        <span title={job.skills}>
                          {job.skills.length > 30 ? `${job.skills.substring(0, 30)}...` : job.skills}
                        </span>
                      </td>
                      <td>
                        <span>{job.applicant_count || 0}</span>
                      </td>
                      <td>{formatDate(job.created_at)}</td>
                      <td>
                        <div className={'${styles.actionButtons} d-flex gap-1'}>
                          <Button
                            variant="success"
                            size="sm"
                            as={Link}
                            to={`/admin/job/${job.id}/applicants`}
                            title="View Applicants"
                          >
                            <BsPeopleFill />
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            className={styles.btnView}
                            onClick={() => handleViewJob(job.id)}
                            title="View Job"
                          >
                            <BsEyeFill />
                          </Button>
                          <Button
                            variant="warning"
                            size="sm"
                            onClick={() => handleEditJob(job, 2)}
                            title="Edit Skills"
                          >
                            <BsPencilSquare />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            className={styles.btnDelete}
                            onClick={() => {
                              setJobToDelete(job)
                              setShowDeleteModal(true)
                            }}
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
        handleClose={() => { setShowModal(false); setSelectedJob(null); }}
        adminId={adminId}
        onJobPosted={handleJobPosted}
        jobToEdit={selectedJob}
        startStep={selectedJob ? 1 : 2}  // 👈 Automatically decide starting step
      />

      {/* Toast Notifications */}
      <ToastContainer position="top-end" className="px-4 py-3">
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={4000}
          autohide
          className={styles.successToast}
        >
          <Toast.Body className={`fs-5 text-white bg-${toastVariant} rounded d-flex align-items-center`}>
          <span className="me-2 d-flex align-items-center">
            {toastIconType === "check" && <BsCheckCircleFill />}
            {toastIconType === "info" && <BsInfoCircleFill />}
            {toastIconType === "exclamation" && <BsExclamationCircleFill />}
          </span>
          {toastMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete <strong>{jobToDelete?.title}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteJob}>
            Yes, Delete
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  )
}

export default AdminDashboard
