import { useParams, Link, useNavigate } from "react-router-dom"; 
import { useEffect, useState } from "react";
import axios from "axios";
import { Container, Spinner, Alert, Badge, Button } from "react-bootstrap"; 
import config from '../config';

const API_URL = config.API_URL;

function JobDetails() {
    const { id } = useParams();
    const navigate = useNavigate(); 
    const seekerId = JSON.parse(localStorage.getItem("user"))?.id;

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [applied, setApplied] = useState(false);
    const [appliedAt, setAppliedAt] = useState(null);
    const [applicationStatus, setApplicationStatus] = useState(null);

    // ✅ Track uploaded additional documents
    const [uploadedDocs, setUploadedDocs] = useState({
        sss: false,
        pagibig: false,
        philhealth: false,
    });

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
                params: { job_id: id, seeker_id: seekerId },
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

        // ✅ Fetch already uploaded documents (optional new backend route)
        const fetchUploadedDocs = async () => {
            try {
                const res = await axios.get(`${API_URL}/jobs/applications/additional-documents`, {
                params: { job_id: id, seeker_id: seekerId },
                });
                setUploadedDocs({
                sss: !!res.data.sss,
                pagibig: !!res.data.pagibig,
                philhealth: !!res.data.philhealth,
                });
            } catch (err) {
                console.error("Error fetching uploaded documents:", err);
            }
        };
    
        fetchJob();
        checkIfApplied();
        fetchUploadedDocs();
    }, [id, seekerId]);

    if (loading)
        return <Container className="mt-5 text-center"><Spinner animation="border" /></Container>;

    if (error)
        return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;

    // ✅ Upload handler with confirmation
    const handleUpload = async (e) => {
        e.preventDefault();

        if (!window.confirm("Are you sure you want to upload these documents?")) return;

        const formData = new FormData();
        formData.append("seeker_id", seekerId);
        formData.append("job_id", id);

        if (e.target.sss?.files[0]) formData.append("sssFile", e.target.sss.files[0]);
        if (e.target.pagibig?.files[0]) formData.append("pagibigFile", e.target.pagibig.files[0]);
        if (e.target.philhealth?.files[0]) formData.append("philhealthFile", e.target.philhealth.files[0]);

        try {
        const res = await axios.post(`${API_URL}/jobs/applications/additional-requirements`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Documents uploaded successfully!");

        // ✅ Refresh uploadedDocs state to hide uploaded inputs
        const updated = res.data.uploaded || {}; 
        setUploadedDocs({
            sss: uploadedDocs.sss || !!updated.sss,
            pagibig: uploadedDocs.pagibig || !!updated.pagibig,
            philhealth: uploadedDocs.philhealth || !!updated.philhealth,
        });
        } catch (err) {
        console.error(err);
        alert("Error uploading documents. Please try again.");
        }
    };

    return (
        <div>
            <div className="dashboard-header-section py-5">
                <Container>
                    <div className="mb-3">
                        <Button className="bg-primary text-white" onClick={() => navigate('/')}>
                        ← Back to Home
                        </Button>
                    </div>

                    <div className="d-flex align-items-center flex-column gap-4">
                        <h2 className="text-center fw-bold">{job.title}</h2>

                        <div className="d-flex flex-column justify-content-center w-100">
                        {applied ? (
                            <button className="btn btn-danger rounded-5 py-2 px-5 fs-5 mx-auto" disabled>
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
                            You applied on <strong>{new Date(appliedAt).toLocaleString()}</strong>
                            </p>
                        )}

                        {/* ✅ Additional Upload Section */}
                        {applicationStatus === "selected" && (
                            <div className="mt-5 mx-auto text-center bg-light p-4 rounded-4" style={{ maxWidth: "600px" }}>
                            <h5 className="mb-3 text-black">Upload Additional Requirements</h5>
                            <p className="text-muted mb-4">
                                Please upload your SSS, Pag-IBIG, and PhilHealth documents for HR processing.
                            </p>

                            <form onSubmit={handleUpload}>
                                {/* ✅ SSS */}
                                {!uploadedDocs.sss ? (
                                <div className="mb-3 text-start">
                                    <label className="form-label fw-bold">SSS Document</label>
                                    <input type="file" name="sss" className="form-control" accept=".pdf,.jpg,.jpeg,.png" required />
                                </div>
                                ) : (
                                <div className="mb-3 text-start">
                                    <label className="form-label fw-bold">SSS Document</label>
                                    <p className="text-success mb-0"><i className="bi bi-check-circle me-2"></i>Uploaded</p>
                                </div>
                                )}

                                {/* ✅ Pag-IBIG */}
                                {!uploadedDocs.pagibig ? (
                                <div className="mb-3 text-start">
                                    <label className="form-label fw-bold">Pag-IBIG Document</label>
                                    <input type="file" name="pagibig" className="form-control" accept=".pdf,.jpg,.jpeg,.png" required />
                                </div>
                                ) : (
                                <div className="mb-3 text-start">
                                    <label className="form-label fw-bold">Pag-IBIG Document</label>
                                    <p className="text-success mb-0"><i className="bi bi-check-circle me-2"></i>Uploaded</p>
                                </div>
                                )}

                                {/* ✅ PhilHealth */}
                                {!uploadedDocs.philhealth ? (
                                <div className="mb-3 text-start">
                                    <label className="form-label fw-bold">PhilHealth Document</label>
                                    <input type="file" name="philhealth" className="form-control" accept=".pdf,.jpg,.jpeg,.png" required />
                                </div>
                                ) : (
                                <div className="mb-3 text-start">
                                    <label className="form-label fw-bold">PhilHealth Document</label>
                                    <p className="text-success mb-0"><i className="bi bi-check-circle me-2"></i>Uploaded</p>
                                </div>
                                )}

                                {/* Only show Upload button if something still needs upload */}
                                {(!uploadedDocs.sss || !uploadedDocs.pagibig || !uploadedDocs.philhealth) && (
                                <button type="submit" className="btn btn-success px-4 mt-3">
                                    Upload Documents
                                </button>
                                )}
                            </form>
                            </div>
                        )}
                        </div>
                    </div>
                </Container>
            </div>
            <div className="px-4">
                <Container className="bg-white rounded shadow p-0 mb-4">
                    <div className="px-5 pt-4 pb-1">
                        <h3>Job Summary</h3>
                    </div>
                    <hr />
                    <div className="px-sm-5 px-3 pt-2 pb-4">
                        <div className="d-flex flex-md-row flex-column gap-md-5 mb-3">
                            <p><strong>Education:</strong> {job.education}</p>
                            <p><strong>Employment Type:</strong> {job.employment_type}</p>
                            <p><strong>Disability Status:</strong> {job.disability_status}</p>
                        </div>
                        <p style={{ whiteSpace: "pre-line" }}>{job.description}</p>
                    </div>
                </Container>

                <Container className="bg-white rounded shadow px-sm-5 px-3 py-4 mb-5">
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
        </div>
    );
}

export default JobDetails;
