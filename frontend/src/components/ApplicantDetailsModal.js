import React from 'react';
import { Modal, Button, Badge, Row, Col } from 'react-bootstrap';
import config from '../config';

const API_URL = config.API_URL;
const Icon = ({ className }) => <i className={className} style={{ marginRight: '8px' }}></i>;

// Files that should trigger download instead of preview
const isForceDownloadType = (filename) => {
  const forceTypes = ['pdf', 'doc', 'docx'];
  const ext = filename?.split('.').pop()?.toLowerCase();
  return forceTypes.includes(ext);
};

export const ApplicantDetailsModal = ({ show, onHide, applicant }) => {
  if (!applicant) return null;

  const skills = applicant.skills ? applicant.skills.split(',').map(s => s.trim()) : [];

  // Map of all applicant files and their labels
  const files = [
    { key: 'application_letter_url', label: 'Application Letter' },
    { key: 'pds_url', label: 'PDS/Resume' },
    { key: 'performance_rating_url', label: 'Performance Rating' },
    { key: 'eligibility_url', label: 'Eligibility' },
    { key: 'diploma_url', label: 'Diploma' },
    { key: 'tor_url', label: 'TOR' },
    { key: 'trainings_url', label: 'Trainings' },
    { key: 'pwd_id_image', label: 'PWD ID' },
    // ✅ Added for Additional Requirements
    { key: 'sss_url', label: 'SSS' },
    { key: 'pagibig_url', label: 'Pag-IBIG' },
    { key: 'philhealth_url', label: 'PhilHealth' }
  ];

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title as="h4">{applicant.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col md={8}>
            <h5><Icon className="bi bi-person-lines-fill" />Applicant Details</h5>
            <hr />
            <Row className="mb-2">
              <Col sm={2} as="strong">Name</Col>
              <Col sm={10}>{applicant.name}</Col>
            </Row>
            <Row className="mb-2">
              <Col sm={2} as="strong">Age</Col>
              <Col sm={10}>{applicant.age ? `${applicant.age} years old` : 'Not Provided'}</Col>
            </Row>
            <Row className="mb-2">
              <Col sm={2} as="strong">Address</Col>
              <Col sm={10}>{applicant.address || 'Not Provided'}</Col>
            </Row>
            <Row className="mb-2">
              <Col sm={2} as="strong">Phone</Col>
              <Col sm={10}>{applicant.phone_number || 'Not Provided'}</Col>
            </Row>
            <Row className="mb-2">
              <Col sm={2} as="strong">Email</Col>
              <Col sm={10}>{applicant.email}</Col>
            </Row>
            <Row className="mb-2">
              <Col sm={2} as="strong">Education</Col>
              <Col sm={10}>{applicant.education || 'Not Provided'}</Col>
            </Row>
            <Row>
              <Col sm={2} as="strong">Skills</Col>
              <Col sm={10}>
                {skills.length > 0 ? skills.map((skill, i) => (
                  <Badge key={i} bg="primary" className="me-1 mb-1 fw-normal">{skill}</Badge>
                )) : <span className="text-muted">No skills listed</span>}
              </Col>
            </Row>
          </Col>

          <Col md={4} className="bg-light p-3 rounded">
            <p className="mb-1"><Icon className="bi bi-calendar-check m-0" />Applied On</p>
            <strong>{new Date(applicant.applied_at).toLocaleString()}</strong>
            <hr />

            <div className="d-grid gap-2">
              {files.map(file => {
                const fileUrl = applicant[file.key];
                if (!fileUrl) return null;
                // For PWD ID, only show if applicant is PWD
                if (file.key === 'pwd_id_image' && applicant.disability_status !== 'PWD') return null;

                return (
                  <div className="d-grid" key={file.key}>
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-primary"
                      download={isForceDownloadType(fileUrl) ? '' : undefined}
                    >
                      <Icon className={`bi ${isForceDownloadType(fileUrl) ? 'bi-download' : 'bi-eye'}`} /> 
                      {isForceDownloadType(fileUrl) ? `Download ${file.label}` : `View ${file.label}`}
                    </a>
                  </div>
                );
              })}
            </div>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="danger" onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};
