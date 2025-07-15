import React from 'react';
import { Modal, Button, Badge, Row, Col } from 'react-bootstrap';

const Icon = ({ className }) => <i className={className} style={{ marginRight: '8px' }}></i>;

export const ApplicantDetailsModal = ({ show, onHide, applicant }) => {
  if (!applicant) {
    return null;
  }

  const skills = applicant.skills ? applicant.skills.split(',').map(s => s.trim()) : [];

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title as="h4">{applicant.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col md={8}>
            <h5><Icon className="bi bi-person-lines-fill" />Applicant Details</h5>
            <hr />
            {/* --- NEW SECTION for Personal Info --- */}
            <Row className="mb-2">
              <Col sm={4} as="strong">Age</Col>
              <Col sm={8}>{applicant.age ? `${applicant.age} years old` : 'Not Provided'}</Col>
            </Row>
            <Row className="mb-2">
              <Col sm={4} as="strong">Address</Col>
              <Col sm={8}>{applicant.address || 'Not Provided'}</Col>
            </Row>
             <Row className="mb-2">
              <Col sm={4} as="strong">Phone</Col>
              <Col sm={8}>{applicant.phone_number || 'Not Provided'}</Col>
            </Row>
            {/* --- End of NEW SECTION --- */}
            <Row className="mb-2">
              <Col sm={4} as="strong">Email</Col>
              <Col sm={8}>{applicant.email}</Col>
            </Row>
            <Row className="mb-2">
              <Col sm={4} as="strong">Education</Col>
              <Col sm={8}>{applicant.education}</Col>
            </Row>
            <Row>
              <Col sm={4} as="strong">Skills</Col>
              <Col sm={8}>
                {skills.length > 0 ? skills.map((skill, i) => (
                  <Badge key={i} bg="dark" className="me-1 mb-1 fw-normal">{skill}</Badge>
                )) : <span className="text-muted">No skills listed</span>}
              </Col>
            </Row>
          </Col>
          <Col md={4} className="bg-light p-3 rounded">
            <p className="mb-1"><Icon className="bi bi-calendar-check" />Applied On</p>
            <strong>{new Date(applicant.applied_at).toLocaleString()}</strong>
            <hr />
            {/* --- NEW SECTION for PDS Download --- */}
            {applicant.pds_url && (
              <div className="d-grid">
                <Button as="a" href={applicant.pds_url} target="_blank" rel="noopener noreferrer" variant="primary">
                  <Icon className="bi bi-download" /> Download PDS
                </Button>
              </div>
            )}
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};