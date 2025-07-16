import { useEffect, useState } from "react";
import { Card, Container, Row, Col } from "react-bootstrap";
import axios from "axios";
import "./SeekerDashboard.css"; // reuse styles
import config from '../config';

const API_URL = config.API_URL;

function JobApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const seekerId = JSON.parse(localStorage.getItem("user"))?.id;

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await axios.get(`${API_URL}/jobs/applications/seeker/${seekerId}`);
        setApplications(res.data);
      } catch (err) {
        console.error("Error fetching applications:", err);
      }
    };

    fetchApplications();
  }, [seekerId]);

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
          </div>
        </Container>
      </div>

      <Container className="dashboard-container mb-5 pb-3">
        <Row>
          {applications.length === 0 ? (
            <Col xs={12}>
              <div className="no-jobs-wrapper">
                <div className="no-jobs-icon"><i className="fas fa-file-alt"></i></div>
                <h3 className="no-jobs-title">No Applications Found</h3>
                <p className="no-jobs-text">You haven’t applied for any jobs yet.</p>
              </div>
            </Col>
          ) : (
            applications.map((app) => (
              <Col md={6} lg={4} key={app.id} className="mb-4">
                <Card className="job-card h-100">
                  <Card.Body>
                    <Card.Title>{app.title}</Card.Title>
                    <Card.Text>{app.description.slice(0, 120)}...</Card.Text>
                    <div className="mt-2">
                      <p><strong>Applied on:</strong> {new Date(app.applied_at).toLocaleDateString()}</p>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))
          )}
        </Row>
      </Container>
    </div>
  );
}

export default JobApplicationsPage;
