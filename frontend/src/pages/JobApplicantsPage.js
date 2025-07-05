import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Table, Container, Spinner, Alert, Badge, Button } from "react-bootstrap";
import axios from "axios";

function JobApplicantsPage() {
  const { jobId } = useParams();
  const [applicants, setApplicants] = useState([]);
  const [jobTitle, setJobTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [applicantsRes, jobRes] = await Promise.all([
          axios.get(`http://localhost:5000/jobs/applicants/${jobId}`),
          axios.get(`http://localhost:5000/jobs/${jobId}`),
        ]);

        setApplicants(applicantsRes.data);
        setJobTitle(jobRes.data.title);
      } catch (err) {
        console.error("Error loading applicants or job title", err);
        setError("Failed to load applicants or job info.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jobId]);

  if (loading) return <Container className="mt-5 text-center"><Spinner animation="border" /></Container>;
  if (error) return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;

  return (
    <Container className="my-4">
      <h3>Applicants for <span className="fw-bold">{jobTitle}</span></h3>

      {applicants.length === 0 ? (
        <Alert variant="light">No applicants yet for this job.</Alert>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Seeker Name</th>
              <th>Email</th>
              <th>Education</th>
              <th>Skills</th>
              <th>Disability</th>
              <th>Applied At</th>
            </tr>
          </thead>
          <tbody>
            {applicants.map((applicant, i) => (
              <tr key={i}>
                <td>{applicant.name}</td>
                <td>{applicant.email}</td>
                <td>{applicant.education}</td>
                <td>{applicant.skills}</td>
                <td>{applicant.disability_status}</td>
                <td>{new Date(applicant.applied_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Link to="/admin-dashboard" className="btn btn-primary mb-3">← Back to Dashboard</Link>
    </Container>
  );
}

export default JobApplicantsPage;
