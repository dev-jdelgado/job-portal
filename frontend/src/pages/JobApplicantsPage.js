import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom"; // Make sure useParams is imported
import { Container, Spinner, Alert, Button, ButtonGroup, Row, Col } from "react-bootstrap";
import axios from "axios";
import { ApplicantCard } from "../components/ApplicantCard";
import { ApplicantDetailsModal } from "../components/ApplicantDetailsModal";
import { InterviewScheduleModal } from "../components/InterviewScheduleModal"; 
import config from '../config';

const API_URL = config.API_URL;


function JobApplicantsPage() {
  const { jobId } = useParams();
  const [applicants, setApplicants] = useState([]);
  const [jobTitle, setJobTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [statusLoadingId, setStatusLoadingId] = useState(null);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_URL}/jobs/applicants/${jobId}`);
        setApplicants(res.data);
        if (res.data.length > 0) {
          setJobTitle(res.data[0].job_title);
        } else {
          const jobRes = await axios.get(`${API_URL}/jobs/${jobId}`);
          setJobTitle(jobRes.data.title);
        }
      } catch (err) {
        setError("Failed to load applicant information.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jobId]);


  const handleStatusUpdate = async (applicationId, newStatus) => {
    if (newStatus === 'shortlisted') {
      setSelectedAppId(applicationId);
      setShowScheduleModal(true);
      return;
    }
  
    setStatusLoadingId(applicationId); // Start loading
  
    try {
      await axios.put(`${API_URL}/jobs/applications/${applicationId}/status`, { status: newStatus });
      setApplicants(applicants.map(app =>
        app.applicationId === applicationId ? { ...app, status: newStatus } : app
      ));
    } catch (err) {
      alert("Failed to update status.");
    } finally {
      setStatusLoadingId(null); // Stop loading
    }
  };
  
  const handleConfirmSchedule = async (interviewDate) => {
    setStatusLoadingId(selectedAppId); // Start loading
  
    try {
      await axios.put(`${API_URL}/jobs/applications/${selectedAppId}/status`, {
        status: 'shortlisted',
        interviewTime: interviewDate.toISOString(),
      });
  
      setApplicants(applicants.map(app =>
        app.applicationId === selectedAppId ? { ...app, status: 'shortlisted' } : app
      ));
    } catch (err) {
      alert("Failed to schedule interview.");
    } finally {
      setStatusLoadingId(null); // Stop loading
      setShowScheduleModal(false);
    }
  };
  
  

  const handleShowModal = (applicant) => {
    setSelectedApplicant(applicant);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedApplicant(null);
  };

  const filteredAndSortedApplicants = useMemo(() => {
    return applicants
      .filter(app => filterStatus === 'all' || app.status === filterStatus)
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [applicants, filterStatus]);

  if (loading) return <Container className="mt-5 text-center"><Spinner animation="border" /></Container>;
  if (error) return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;

  return (
    <>
      <Container className="my-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
          <div>
            <h3>Applicants for:</h3>
            <h1 className="fw-bold">{jobTitle}</h1>
          </div>
          <Link to="/admin-dashboard" className="btn btn-secondary">← Back to Dashboard</Link>
        </div>

        <div className="mb-4">
          <ButtonGroup>
            <Button variant={filterStatus === 'all' ? 'primary' : 'outline-primary'} onClick={() => setFilterStatus('all')}>All ({applicants.length})</Button>
            <Button variant={filterStatus === 'shortlisted' ? 'success' : 'outline-success'} onClick={() => setFilterStatus('shortlisted')}>Shortlisted ({applicants.filter(a => a.status === 'shortlisted').length})</Button>
            <Button variant={filterStatus === 'rejected' ? 'danger' : 'outline-danger'} onClick={() => setFilterStatus('rejected')}>Rejected ({applicants.filter(a => a.status === 'rejected').length})</Button>
          </ButtonGroup>
        </div>

        <Row>
          {filteredAndSortedApplicants.length > 0 ? (
            filteredAndSortedApplicants.map((applicant) => (
              <Col md={12} lg={6} key={applicant.applicationId}>
                <ApplicantCard
                  applicant={applicant}
                  onStatusUpdate={handleStatusUpdate}
                  onViewDetails={handleShowModal}
                  isLoading={statusLoadingId === applicant.applicationId}
                />
              </Col>
            ))
          ) : (
            <Col>
              <Alert variant="info">No applicants match the current filter.</Alert>
            </Col>
          )}
        </Row>
      </Container>
      
      <ApplicantDetailsModal
        show={showModal}
        onHide={handleCloseModal}
        applicant={selectedApplicant}
      />
      <InterviewScheduleModal
        show={showScheduleModal}
        onHide={() => setShowScheduleModal(false)}
        onConfirm={handleConfirmSchedule}
      />
    </>
  );
}

export default JobApplicantsPage;