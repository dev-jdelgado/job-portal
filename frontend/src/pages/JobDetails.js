import { useParams, Link } from "react-router-dom"
import { useEffect, useState } from "react"
import axios from "axios"
import { Container, Spinner, Alert, Badge } from "react-bootstrap"
import config from '../config';

const API_URL = config.API_URL;

function JobDetails() {
    const { id } = useParams()
    const [job, setJob] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const seekerId = JSON.parse(localStorage.getItem("user"))?.id;

    const [applied, setApplied] = useState(false);
    const [applyError, setApplyError] = useState(null);
    const [appliedAt, setAppliedAt] = useState(null);
    const [applicationStatus, setApplicationStatus] = useState(null);


    useEffect(() => {
        const fetchJob = async () => {
            try {
                const res = await axios.get(`${API_URL}/jobs/${id}`);
                setJob(res.data);
            } catch (err) {
                setError("Job not found.");
                console.error("Error fetching job details:", err);
            } finally {
                setLoading(false);
            }
        };
    
        const checkIfApplied = async () => {
            try {
              const res = await axios.get(`${API_URL}/jobs/applications/check`, {
                params: {
                  job_id: id,
                  seeker_id: seekerId,
                },
              });
          
              if (res.data.applied) {
                setApplied(true);
                setAppliedAt(res.data.applied_at);
                setApplicationStatus(res.data.status || 'applied');
              }
            } catch (err) {
              console.error("Error checking if already applied:", err);
            }
        };
    
        fetchJob();
        checkIfApplied();
    }, [id, seekerId]);
    

    if (loading) {
        return <Container className="mt-5 text-center"><Spinner animation="border" /></Container>
    }
    if (error) {
        return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>
    }
      
    return (
    <div>
        <div className="dashboard-header-section py-5">
            <Container>
                <div className="d-flex align-items-center flex-column gap-4">
                    <h2 className="text-center fw-bold">{job.title}</h2>
                    <div className=" d-flex flex-column justify-content-center w-100">
                        {applied ? (
                            <button
                                className="btn btn-danger rounded-5 py-2 px-5 fs-5 mx-auto"
                                disabled
                            >
                                Already Applied!
                            </button>
                        ) : (
                            <Link
                                to={`/apply/${id}`}
                                className="btn bg-success text-white rounded-5 py-2 px-5 fs-5 mx-auto text-decoration-none"
                            >
                                Apply for This Job!
                            </Link>
                        )}
                        {appliedAt && (
                            <p className="text-white mt-1 mb-0 mx-auto">
                                You applied on <strong>{new Date(appliedAt).toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true,
                                })}</strong>
                            </p>                          
                        )}
                        {applyError && (
                            <p className="text-danger mt-2">
                            <i className="fas fa-exclamation-circle me-2"></i>{applyError}
                            </p>
                        )}
                        
                        {applied && (
                        <div className="mt-4 mx-auto text-center">
                            <h5 className="text-white mb-4">Application Status Tracker</h5>
                            <div className="d-flex align-items-center justify-content-center flex-wrap gap-2">

                            {['applied', 'shortlisted', 'interviewed', 'selected', 'rejected'].map((step, i, steps) => {
                                const statusOrder = {
                                applied: 1,
                                shortlisted: 2,
                                interviewed: 3,
                                selected: 4,
                                rejected: 4, // final state
                                };

                                const current = statusOrder[applicationStatus] || 0;
                                const stepValue = statusOrder[step] || 0;

                                const isActive = stepValue <= current;
                                const isCurrent = stepValue === current;

                                return (
                                <div key={step} className="d-flex align-items-center">
                                    <div>
                                        <div
                                        className="rounded-circle d-flex align-items-center justify-content-center mx-auto"
                                        style={{
                                            width: '50px',
                                            height: '50px',
                                            backgroundColor: isActive ? (isCurrent ? '#198754' : '#198754') : '#dee2e6',
                                            color: isActive ? '#fff' : '#6c757d',
                                            fontWeight: 'bold',
                                            fontSize: '1.1rem',
                                        }}
                                        >
                                        {i + 1}
                                        </div>

                                        <div className="text-white small mt-1 text-center" style={{ width: "80px" }}>
                                        {step.charAt(0).toUpperCase() + step.slice(1)}
                                        </div>
                                    </div>
                                    
                                    {i < steps.length - 1 && (
                                    <div
                                        style={{
                                        height: '3px',
                                        width: '40px',
                                        marginBottom: '20px',
                                        backgroundColor: statusOrder[steps[i + 1]] <= current ? '#198754' : '#dee2e6',
                                        }}
                                    ></div>
                                    )}
                                </div>
                                );
                            })}

                            </div>
                        </div>
                        )}


                    </div>
                    
                </div>
            </Container>
        </div>

        <Container className="bg-white rounded shadow p-0 mb-4">
            <div className="px-5 pt-4 pb-1">
                <h3>Job Summary</h3>
            </div>
            <hr />
            <div className="px-5 pt-2 pb-4">
                <div className="d-flex gap-5 mb-3">
                    <p><strong>Education:</strong> {job.education}</p>
                    <p><strong>Employment Type:</strong> {job.employment_type}</p>
                    <p><strong>Disability Status:</strong> {job.disability_status}</p>
                </div>
                
                <p style={{ whiteSpace: "pre-line" }}>{job.description}</p>

            </div>
        </Container>
        <Container className="bg-white rounded shadow px-5 py-4 mb-5">
            <div className="mb-3">
                <strong>Skills Required:</strong>
                <div className="mt-1">
                {job.skills.split(',').map((skill, i) => (
                    <Badge key={i} className="me-1 bg-blue">{skill.trim()}</Badge>
                ))}
                </div>
            </div>
        </Container>
    </div>
    )
}

export default JobDetails
