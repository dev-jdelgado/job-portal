import { useState, useEffect } from "react";
import { Button, Container, Toast, ToastContainer, Card, Row, Col, Badge, Alert, Modal } from "react-bootstrap";
import {
    BsBriefcaseFill,
    BsPeopleFill,
    BsCheckCircleFill,
    BsPlusCircleFill,
    BsPencilSquare,
    BsTrash3Fill,
    BsExclamationCircleFill,
    BsInfoCircleFill,
} from "react-icons/bs";
import JobPostModal from "../components/JobPostModal";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { Link } from 'react-router-dom';
import config from '../config';
import './AdminDashboard.css'; // Main style source

const API_URL = config.API_URL;

// Helper component for stat cards for consistency
const StatCard = ({ icon, value, label, header }) => (
    <Card className="stats-card h-100">
        <Card.Header className="d-flex align-items-center">
            {icon}
            {header}
        </Card.Header>
        <Card.Body className="text-center p-md-2 p-0">
            <div className="stats-value">{value}</div>
            <div className="stats-description">{label}</div>
        </Card.Body>
    </Card>
);

// New JobCard component to replace table rows
const JobCard = ({ job, onEdit, onDelete, getBadgeVariant }) => (
    <Card className="jobs-table-card mb-3">
        <Card.Body>
            <Row className="align-items-center">
                {/* Job Title & Description */}
                <Col xs={12} md={5} className="order-3 order-md-1 my-md-0 my-3">
                    <h5 className="job-title">{job.title}</h5>
                    <p className="m-0">{job.description?.substring(0, 100)}...</p>
                </Col>

                {/* Applicant Count */}
                <Col xs={4} md={2} className="order-1 order-md-3 text-md-center">
                    <strong className="d-block stats-value" style={{ fontSize: '1.5rem' }}>
                        {job.applicant_count || 0}
                    </strong>
                    <span className="stats-description">Applicants</span>
                </Col>

                {/* Employment Type & Education Badges */}
                <Col xs={12} md={2} className="order-4 order-md-2">
                    <Badge bg={getBadgeVariant(job.employment_type)} className="me-2 mb-1">
                        {job.employment_type}
                    </Badge>
                    <Badge bg="secondary" pill className="fw-normal mb-1">
                        {job.education}
                    </Badge>
                </Col>

                {/* Action Buttons */}
                <Col xs={8} md={3} className="order-2 order-md-4 text-md-end">
                    <div className="d-flex flex-row gap-1 justify-content-end">
                        <Button
                            className="navy-blue-btn admin-btn"
                            size="sm"
                            as={Link}
                            to={`/admin/job/${job.id}/applicants`}
                            title="View Applicants"
                        >
                            <BsPeopleFill />
                        </Button>
                        <Button
                            className="navy-blue-btn admin-btn"
                            size="sm"
                            onClick={() => onEdit(job, 1)}
                            title="Edit Job"
                        >
                            <BsPencilSquare />
                        </Button>
                        <Button
                            className="navy-blue-btn admin-btn"
                            size="sm"
                            onClick={() => onDelete(job)}
                            title="Delete Job"
                        >
                            <BsTrash3Fill />
                        </Button>
                    </div>
                </Col>
            </Row>
        </Card.Body>
        <Card.Footer className="text-muted small">
            Posted on: {new Date(job.created_at).toLocaleDateString()}
        </Card.Footer>
    </Card>
);


function AdminDashboard() {
    // ... (All existing state declarations remain the same)
    const [showModal, setShowModal] = useState(false)
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState("")
    const [adminJobs, setAdminJobs] = useState([])
    const [jobStats, setJobStats] = useState({
      totalJobs: 0,
      activeJobs: 0,
      totalApplications: 0,
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

    // ... (All handler functions and useEffect remain the same)
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
            activeJobs: jobsRes.data.length, 
            totalApplications,
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
    
      const handleDeleteJob = async (forceDelete = false) => {
        if (!jobToDelete) return;
      
        try {
          const url = `${API_URL}/jobs/${jobToDelete.id}${forceDelete ? '?force=true' : ''}`;
          await axios.delete(url);
      
          setAdminJobs(prev => prev.filter(job => job.id !== jobToDelete.id));
          setToastMessage("Job deleted successfully!");
          setToastVariant("danger");
          setToastIconType("exclamation");
          setShowToast(true);
      
          setJobStats(prev => ({
            ...prev,
            totalJobs: prev.totalJobs - 1,
            activeJobs: prev.activeJobs - 1,
          }));
      
        } catch (err) {
          console.error("Error deleting job:", err);
      
          // ⚠️ If the backend says "confirmation needed"
          if (err.response?.status === 409) {
            const confirmDelete = window.confirm(
              `⚠️ ${err.response.data.error}\n\nDo you want to delete this job and all its applicants?`
            );
            if (confirmDelete) {
              // Retry deletion with force=true
              return handleDeleteJob(true);
            } else {
              return;
            }
          }
      
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
      
    const getBadgeVariant = (type) => {
        if (typeof type !== "string") return "secondary"; // default/fallback
        switch (type.toLowerCase()) {
            case "full-time": return "primary";
            case "part-time": return "info";
            case "contract": return "success";
            case "internship": return "secondary";
            default: return "light";
        }
    };

    if (loading) { /* ... loading spinner ... */ }

    return (
        <div className="">
            <div className="dashboard-header">
                <Container>
                    <div className="d-flex flex-sm-row flex-column align-items-center justify-content-between gap-3">
                        <div className="w-100 text-start">
                            <h1 className="dashboard-title"><BsBriefcaseFill className="me-3" />Admin Dashboard</h1>
                            <p className="dashboard-subtitle">Manage your job postings and track applications</p>
                        </div>
                        <div xs="auto" className="text-end w-100">
                            <Button 
                                onClick={() => { setSelectedJob(null); setShowModal(true); }} 
                                className="btn-post-job"
                            >
                                <BsPlusCircleFill className="me-2" />
                                Post New Job
                            </Button>
                        </div>
                    </div>
                </Container>
            </div>

            <Container className="py-4">
                {error && <Alert variant="danger">{error}</Alert>}

                {/* Stats Cards */}
                <Row className="mb-4">
                    <Col md={4} className="mb-3">
                        <StatCard icon={<BsBriefcaseFill className="me-2" />} header="Total Jobs" value={jobStats.totalJobs} label="Jobs Posted" />
                    </Col>
                    <Col md={4} className="mb-3">
                        <StatCard icon={<BsCheckCircleFill className="me-2" />} header="Active Jobs" value={jobStats.activeJobs} label="Currently Active" />
                    </Col>
                    <Col md={4} className="mb-3">
                        <StatCard icon={<BsPeopleFill className="me-2" />} header="Total Applications" value={jobStats.totalApplications} label="Received" />
                    </Col>
                </Row>

                {/* Jobs List */}
                <h3 className="jobs-table-title">Your Job Postings</h3>
                <p className="jobs-table-subtitle mb-3">Manage and track all your posted positions</p>
                
                {adminJobs.length === 0 && !loading ? (
                    <div className="empty-state">
                        <BsBriefcaseFill size={40} className="mb-3" />
                        <h5>No Jobs Posted Yet</h5>
                        <p>Start by posting your first job to attract top talent!</p>
                    </div>
                ) : (
                    adminJobs.map((job) => (
                        <JobCard 
                            key={job.id} 
                            job={job} 
                            onEdit={handleEditJob} 
                            onDelete={(jobToDelete) => {
                                setJobToDelete(jobToDelete);
                                setShowDeleteModal(true);
                            }}
                            getBadgeVariant={getBadgeVariant} 
                        />
                    ))
                )}
            </Container>

            {/* Modals and Toasts */}
            <JobPostModal
                show={showModal}
                handleClose={() => { setShowModal(false); setSelectedJob(null); }}
                adminId={adminId}
                onJobPosted={handleJobPosted}
                jobToEdit={selectedJob}
                startStep={selectedJob ? 1 : 1}
            />

            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton className="modal-header">
                    <Modal.Title className="modal-title">Confirm Deletion</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {jobToDelete?.applicant_count > 0 ? (
                    <>
                        <p>
                        <strong>Warning:</strong> This job has{" "}
                        <strong>{jobToDelete.applicant_count}</strong>{" "}
                        {jobToDelete.applicant_count === 1 ? "applicant" : "applicants"}.
                        </p>
                        <p>
                        Deleting this job will also <strong>remove all associated applications</strong>. 
                        Are you sure you want to continue?
                        </p>
                    </>
                    ) : (
                    <p>
                        Are you sure you want to delete the job posting for{" "}
                        <strong>{jobToDelete?.title}</strong>? This action cannot be undone.
                    </p>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                    Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDeleteJob}>
                    {jobToDelete?.applicant_count > 0 ? "Yes, Delete Anyway" : "Yes, Delete"}
                    </Button>
                </Modal.Footer>
            </Modal>

            <ToastContainer position="top-end" className="p-3">
                <Toast onClose={() => setShowToast(false)} show={showToast} delay={4000} autohide>
                    <Toast.Body className={`toast-success text-white bg-${toastVariant} rounded d-flex align-items-center`}>
                        <span className="me-2 d-flex align-items-center">
                            {toastIconType === "check" && <BsCheckCircleFill />}
                            {toastIconType === "info" && <BsInfoCircleFill />}
                            {toastIconType === "exclamation" && <BsExclamationCircleFill />}
                        </span>
                        {toastMessage}
                    </Toast.Body>
                </Toast>
            </ToastContainer>
        </div>
    );
}

export default AdminDashboard;