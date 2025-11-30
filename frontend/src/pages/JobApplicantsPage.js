import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Container, Spinner, Alert, Row, Col, Card, Tabs, Tab, Form } from "react-bootstrap"; // Import Tabs and Tab
import axios from "axios";
import { ApplicantCard } from "../components/ApplicantCard";
import { ApplicantDetailsModal } from "../components/ApplicantDetailsModal";
import { InterviewScheduleModal } from "../components/InterviewScheduleModal";
import { ApplicantScoreModal } from "../components/ApplicantScoreModal";
import { Toast, ToastContainer } from 'react-bootstrap';
import config from '../config';
import '../pages/AdminDashboard.css';

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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 767);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [selectedScoreApplicant, setSelectedScoreApplicant] = useState(null); 

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 767);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
        const fetchData = async () => {
          try {
            const res = await axios.get(`${API_URL}/jobs/applicants/${jobId}`); //
            setApplicants(res.data); //
            if (res.data.length > 0) {
              setJobTitle(res.data[0].job_title); //
            } else {
              const jobRes = await axios.get(`${API_URL}/jobs/${jobId}`); //
              setJobTitle(jobRes.data.title); //
            }
          } catch (err) {
            setError("Failed to load applicant information."); //
          } finally {
            setLoading(false); //
          }
        };
    
        fetchData();
      }, [jobId]);

      const handleScoreApplicant = (applicant) => {
        setSelectedScoreApplicant(applicant);
        setShowScoreModal(true);
      };
      
      const [toast, setToast] = useState({
        show: false,
        message: "",
        variant: "success", // can be 'success' or 'danger'
      });      

      const showToast = (message, variant = "success") => {
        setToast({ show: true, message, variant });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000); // auto-hide after 3s
      };

      const handleSaveScore = async (applicationId, scores, total) => {
        try {
          await axios.put(`${API_URL}/jobs/applications/${applicationId}/score`, {
            ...scores,
            totalScore: total
          });
        
          const updatedApplicants = applicants.map(app =>
            app.applicationId === applicationId
              ? { 
                  ...app, 
                  scoreEducation: scores.education,
                  scoreExperience: scores.experience,
                  scoreSkills: scores.skills,
                  scoreInterview: scores.interview,
                  scoreEthics: scores.ethics,
                  totalScore: total
                }
              : app
          );
        
          setApplicants(updatedApplicants);
        
          setSelectedScoreApplicant(prev =>
            prev?.applicationId === applicationId
              ? { 
                  ...prev,
                  scoreEducation: scores.education,
                  scoreExperience: scores.experience,
                  scoreSkills: scores.skills,
                  scoreInterview: scores.interview,
                  scoreEthics: scores.ethics,
                  totalScore: total
                }
              : prev
          );
        
          showToast("Score saved!", "success");
        } catch (err) {
          showToast("Failed to save score.", "danger");
        } finally {
          setShowScoreModal(false);
        }
      };

      const handleStatusUpdate = async (applicationId, newStatus) => {
        if (newStatus === 'shortlisted') {
          setSelectedAppId(applicationId); //
          setShowScheduleModal(true); //
          return;
        }
      
        setStatusLoadingId(applicationId); //
      
        try {
          await axios.put(`${API_URL}/jobs/applications/${applicationId}/status`, { status: newStatus }); //
          setApplicants(applicants.map(app =>
            app.applicationId === applicationId ? { ...app, status: newStatus } : app
          )); //
        } catch (err) {
          showToast("Failed to update status.", "danger");
        } finally {
          setStatusLoadingId(null); //
        }
      };
      
      const handleConfirmSchedule = async (interviewDate) => {
        setStatusLoadingId(selectedAppId); //
      
        try {
          await axios.put(`${API_URL}/jobs/applications/${selectedAppId}/status`, { //
            status: 'shortlisted', //
            interviewTime: interviewDate.toISOString(), //
          });
      
          setApplicants(applicants.map(app =>
            app.applicationId === selectedAppId ? { ...app, status: 'shortlisted' } : app
          )); //
        } catch (err) {
          showToast("Failed to schedule interview.", "danger");
        } finally {
          setStatusLoadingId(null); //
          setShowScheduleModal(false); //
        }
      };

      const handleShowModal = (applicant) => {
        setSelectedApplicant(applicant); //
        setShowModal(true); //
      };
    
      const handleCloseModal = () => {
        setShowModal(false); //
        setSelectedApplicant(null); //
      };
    

      const filteredAndSortedApplicants = useMemo(() => {
        let list = applicants
          .filter(app => filterStatus === 'all' || app.status === filterStatus);
      
        if (filterStatus === "interviewed") {
          // Sort by totalScore desc (undefined scores go last)
          return list.sort((a, b) => (b.totalScore ?? -1) - (a.totalScore ?? -1));
        }
      
        // Default sort by matchScore desc
        return list.sort((a, b) => b.matchScore - a.matchScore);
      }, [applicants, filterStatus]);
      

    // Helper to get counts for each tab
    const getCount = (status) => {
        if (status === 'all') return applicants.length;
        return applicants.filter(a => a.status === status).length;
    };

    if (loading) return <Container className="mt-5 text-center"><Spinner animation="border" /></Container>; //
    if (error) return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>; //

    return (
        <>
            <div className="dashboard-header">
                <Container>
                    <div className="d-flex flex-sm-row flex-column align-items-sm-center">
                        <Col className="text-start order-2 order-sm-1">
                            <h3 className="dashboard-subtitle" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Applicants for:</h3>
                            <h1 className="dashboard-title">{jobTitle}</h1>
                        </Col>
                        <Col className="d-flex align-items-start order-1 order-sm-2 mb-sm-0 mb-3" xs="auto">
                            <Link to="/admin-dashboard" className="btn btn-outline-light">← Back to Dashboard</Link>
                        </Col>
                    </div>
                </Container>
            </div>

            <Container className="my-4">
                <Card className="jobs-table-card">
                  {isMobile ? (
                    <Form.Select
                      className="mb-3"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="all">All ({getCount('all')})</option>
                      <option value="shortlisted">Shortlisted ({getCount('shortlisted')})</option>
                      <option value="interviewed">Interviewed ({getCount('interviewed')})</option>
                      <option value="selected">Selected ({getCount('selected')})</option>
                      <option value="rejected">Rejected ({getCount('rejected')})</option>
                    </Form.Select>
                  ) : (
                    <Tabs
                      activeKey={filterStatus}
                      onSelect={(k) => setFilterStatus(k)}
                      id="applicant-status-tabs"
                      className="mb-3 nav-tabs-custom"
                    >
                      <Tab eventKey="all" title={`All (${getCount('all')})`} />
                      <Tab eventKey="shortlisted" title={`Shortlisted (${getCount('shortlisted')})`} />
                      <Tab eventKey="interviewed" title={`Interviewed (${getCount('interviewed')})`} />
                      <Tab eventKey="selected" title={`Selected (${getCount('selected')})`} />
                      <Tab eventKey="rejected" title={`Rejected (${getCount('rejected')})`} />
                    </Tabs>
                  )}
                    <Card.Body>
                        <Row>
                            {filteredAndSortedApplicants.length > 0 ? (
                                filteredAndSortedApplicants.map((applicant) => (
                                    <Col md={12} key={applicant.applicationId}>
                                      <ApplicantCard
                                        applicant={applicant}
                                        onStatusUpdate={handleStatusUpdate}
                                        onViewDetails={handleShowModal}
                                        onScoreApplicant={handleScoreApplicant}
                                        isLoading={statusLoadingId === applicant.applicationId}
                                        currentTab={filterStatus} 
                                      />
                                    </Col>
                                ))
                            ) : (
                                <Col>
                                    <div className="empty-state">
                                        <h5>No Applicants Found</h5>
                                        <p>There are no applicants in this category.</p>
                                    </div>
                                </Col>
                            )}
                        </Row>
                    </Card.Body>
                </Card>
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
            <ApplicantScoreModal
              show={showScoreModal}
              onHide={() => setShowScoreModal(false)}
              applicant={selectedScoreApplicant}
              onSave={handleSaveScore}
            />
            <ToastContainer position="top-end" className="p-3">
              <Toast show={toast.show} bg={toast.variant} onClose={() => setToast(prev => ({ ...prev, show: false }))} delay={3000} autohide>
                <Toast.Body className="text-white">{toast.message}</Toast.Body>
              </Toast>
            </ToastContainer>

        </>
    );
}

export default JobApplicantsPage;