import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Container, Spinner, Alert, Form, Button, Card, Row, Col } from "react-bootstrap";
import axios from "axios";

function ApplyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const seekerId = JSON.parse(localStorage.getItem("user"))?.id;
  const seekerData = JSON.parse(localStorage.getItem("user")) || {};

  // Form state
  const [formData, setFormData] = useState({
    coverLetter: "",
    cvFile: null,
    portfolioFile: null,
    expectedSalary: "",
    availabilityDate: "",
    additionalInfo: ""
  });

  // Check if already applied
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/jobs/${id}`);
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
        const res = await axios.get(`http://localhost:5000/jobs/applications/check`, {
          params: {
            job_id: id,
            seeker_id: seekerId,
          },
        });

        if (res.data.applied) {
          setApplied(true);
        }
      } catch (err) {
        console.error("Error checking if already applied:", err);
      }
    };

    fetchJob();
    checkIfApplied();
  }, [id, seekerId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    // Validate required fields
    if (!formData.coverLetter.trim()) {
      setSubmitError("Cover letter is required.");
      setSubmitting(false);
      return;
    }

    if (!formData.cvFile) {
      setSubmitError("CV/Resume file is required.");
      setSubmitting(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("job_id", job.id);
      formDataToSend.append("seeker_id", seekerId);
      formDataToSend.append("cover_letter", formData.coverLetter);
      formDataToSend.append("expected_salary", formData.expectedSalary);
      formDataToSend.append("availability_date", formData.availabilityDate);
      formDataToSend.append("additional_info", formData.additionalInfo);
      
      if (formData.cvFile) {
        formDataToSend.append("cv_file", formData.cvFile);
      }
      
      if (formData.portfolioFile) {
        formDataToSend.append("portfolio_file", formData.portfolioFile);
      }

      const res = await axios.post("http://localhost:5000/jobs/applications/detailed", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSubmitSuccess(true);
      setTimeout(() => {
        navigate(`/job-details/${id}`);
      }, 2000);

    } catch (err) {
      console.error("Application error:", err);
      setSubmitError(err.response?.data?.message || "Something went wrong while submitting your application.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" style={{ color: "#002D5A" }} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (applied) {
    return (
      <Container className="mt-5">
        <Alert variant="info">
          <Alert.Heading>Already Applied!</Alert.Heading>
          <p>You have already submitted an application for this job position.</p>
          <Button variant="outline-primary" onClick={() => navigate(`/job-details/${id}`)}>
            View Job Details
          </Button>
        </Alert>
      </Container>
    );
  }

  if (submitSuccess) {
    return (
      <Container className="mt-5">
        <Alert variant="success">
          <Alert.Heading>Application Submitted Successfully!</Alert.Heading>
          <p>Your application has been sent to the employer. You will be redirected to the job details page shortly.</p>
        </Alert>
      </Container>
    );
  }

  return (
    <div style={{ backgroundColor: "#FFF5D1", minHeight: "100vh" }}>
      <div className="py-4" style={{ backgroundColor: "#002D5A" }}>
        <Container>
          <h2 className="text-white text-center fw-bold mb-0">Apply for Position</h2>
        </Container>
      </div>

      <Container className="py-4">
        <Row>
          <Col lg={8} className="mx-auto">
            {/* Job Summary Card */}
            <Card className="mb-4 shadow-sm">
              <Card.Body>
                <h4 className="fw-bold mb-3" style={{ color: "#002D5A" }}>
                  {job.title}
                </h4>
                <Row>
                  <Col md={6}>
                    <p className="mb-1"><strong>Education:</strong> {job.education}</p>
                    <p className="mb-1"><strong>Employment Type:</strong> {job.employment_type}</p>
                  </Col>
                  <Col md={6}>
                    <p className="mb-1"><strong>Disability Status:</strong> {job.disability_status}</p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Application Form */}
            <Card className="shadow-sm">
              <Card.Header style={{ backgroundColor: "#1F74A9" }}>
                <h5 className="text-white mb-0">Application Details</h5>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  {/* Applicant Info (Read-only) */}
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-bold">Your Name</Form.Label>
                        <Form.Control
                          type="text"
                          value={seekerData.name || ""}
                          readOnly
                          style={{ backgroundColor: "#f8f9fa" }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-bold">Email Address</Form.Label>
                        <Form.Control
                          type="email"
                          value={seekerData.email || ""}
                          readOnly
                          style={{ backgroundColor: "#f8f9fa" }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Cover Letter */}
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">
                      Cover Letter <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={6}
                      name="coverLetter"
                      value={formData.coverLetter}
                      onChange={handleInputChange}
                      placeholder="Write a compelling cover letter explaining why you're the perfect fit for this position..."
                      required
                    />
                    <Form.Text className="text-muted">
                      Tip: Mention specific skills from the job requirements and explain how your experience aligns with their needs.
                    </Form.Text>
                  </Form.Group>

                  {/* CV/Resume Upload */}
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">
                      CV/Resume <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="file"
                      name="cvFile"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      required
                    />
                    <Form.Text className="text-muted">
                      Accepted formats: PDF, DOC, DOCX (Max size: 5MB)
                    </Form.Text>
                  </Form.Group>

                  {/* Portfolio Upload (Optional) */}
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Portfolio/Work Samples (Optional)</Form.Label>
                    <Form.Control
                      type="file"
                      name="portfolioFile"
                      accept=".pdf,.doc,.docx,.zip,.rar"
                      onChange={handleFileChange}
                    />
                    <Form.Text className="text-muted">
                      Upload portfolio, work samples, or certificates (Max size: 10MB)
                    </Form.Text>
                  </Form.Group>

                  {/* Expected Salary */}
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-bold">Expected Salary (Monthly)</Form.Label>
                        <Form.Control
                          type="text"
                          name="expectedSalary"
                          value={formData.expectedSalary}
                          onChange={handleInputChange}
                          placeholder="e.g., PHP 25,000 - 30,000"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-bold">Availability Date</Form.Label>
                        <Form.Control
                          type="date"
                          name="availabilityDate"
                          value={formData.availabilityDate}
                          onChange={handleInputChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Additional Information */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">Additional Information</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="additionalInfo"
                      value={formData.additionalInfo}
                      onChange={handleInputChange}
                      placeholder="Any additional information you'd like to share (certifications, achievements, etc.)"
                    />
                  </Form.Group>

                  {/* Error Display */}
                  {submitError && (
                    <Alert variant="danger" className="mb-3">
                      <i className="fas fa-exclamation-circle me-2"></i>
                      {submitError}
                    </Alert>
                  )}

                  {/* Submit Buttons */}
                  <div className="d-flex justify-content-between">
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => navigate(`/job-details/${id}`)}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting}
                      style={{ 
                        backgroundColor: "#F9D849", 
                        borderColor: "#F9D849",
                        color: "#000",
                        fontWeight: "bold"
                      }}
                    >
                      {submitting ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            className="me-2"
                          />
                          Submitting Application...
                        </>
                      ) : (
                        "Submit Application"
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default ApplyPage;