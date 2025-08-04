import React from 'react';
import { Modal, Button, Badge, Row, Col } from 'react-bootstrap';
import config from '../config';

const API_URL = config.API_URL;
const Icon = ({ className }) => <i className={className} style={{ marginRight: '8px' }}></i>;

const isForceDownloadType = (filename) => {
  const ext = filename.split('.').pop().toLowerCase();
  return ['docx', 'xlsx'].includes(ext);
};

export const ApplicantDetailsModal = ({ show, onHide, applicant }) => {
  if (!applicant) {
    return null;
  }

  const skills = applicant.skills ? applicant.skills.split(',').map(s => s.trim()) : [];

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
            {/* --- NEW SECTION for Personal Info --- */}
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
            {/* --- End of NEW SECTION --- */}
            <Row className="mb-2">
              <Col sm={2} as="strong">Email</Col>
              <Col sm={10}>{applicant.email}</Col>
            </Row>
            <Row className="mb-2">
              <Col sm={2} as="strong">Education</Col>
              <Col sm={10}>{applicant.education}</Col>
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
            {applicant.application_letter_url && (
              <div className="d-grid">
                <a
                  href={`${API_URL}/uploads/${applicant.id}/applications/${applicant.jobId}/${applicant.application_letter_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-primary"
                  download={isForceDownloadType(applicant.application_letter_url) ? '' : undefined}
                > 
                  <Icon className={`bi ${isForceDownloadType(applicant.application_letter_url) ? 'bi-download' : 'bi-eye'}`} /> 
                  {isForceDownloadType(applicant.application_letter_url) ? 'Download Application Letter' : 'View Application Letter'}
                </a>
              </div>
            )}

            {applicant.pds_url && (
              <div className="d-grid">
                <a
                  href={`${API_URL}/uploads/${applicant.id}/applications/${applicant.jobId}/${applicant.pds_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-primary"
                  download={isForceDownloadType(applicant.pds_url) ? '' : undefined}
                >
                  <Icon className={`bi ${isForceDownloadType(applicant.pds_url) ? 'bi-download' : 'bi-eye'}`} /> 
                  {isForceDownloadType(applicant.pds_url) ? 'Download PDS/Resume' : 'View PDS/Resume'}
                </a>
              </div>
            )}

             {applicant.pwd_id_url && (
              <div className="d-grid">
                <a
                  href={`${API_URL}/uploads/${applicant.id}/${applicant.pwd_id_image}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-primary"
                  download={isForceDownloadType(applicant.pwd_id_url) ? '' : undefined}
                >
                  <Icon className={`bi ${isForceDownloadType(applicant.pwd_id_image) ? 'bi-download' : 'bi-eye'}`} /> 
                  {isForceDownloadType(applicant.pwd_id_url) ? 'Download PWD ID' : 'View PWD ID'}
                </a>
              </div>
            )}

            {applicant.performance_rating_url && (
              <div className="d-grid">
                <a
                  href={`${API_URL}/uploads/${applicant.id}/applications/${applicant.jobId}/${applicant.performance_rating_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-primary"
                  download={isForceDownloadType(applicant.performance_rating_url) ? '' : undefined}
                >
                  <Icon className={`bi ${isForceDownloadType(applicant.performance_rating_url) ? 'bi-download' : 'bi-eye'}`} /> 
                  {isForceDownloadType(applicant.performance_rating_url) ? 'Download Performance Rating' : 'View Performance Rating'}
                </a>
              </div>
            )}

            {applicant.diploma_url && (
              <div className="d-grid">
                <a
                  href={`${API_URL}/uploads/${applicant.id}/applications/${applicant.jobId}/${applicant.diploma_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-primary"
                  download={isForceDownloadType(applicant.diploma_url) ? '' : undefined}
                >
                  <Icon className={`bi ${isForceDownloadType(applicant.diploma_url) ? 'bi-download' : 'bi-eye'}`} /> 
                  {isForceDownloadType(applicant.diploma_url) ? 'Download Diploma' : 'View Diploma'}
                </a>
              </div>
            )}

            {applicant.tor_url && (
              <div className="d-grid">
                <a
                  href={`${API_URL}/uploads/${applicant.id}/applications/${applicant.jobId}/${applicant.tor_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-primary"
                  download={isForceDownloadType(applicant.tor_url) ? '' : undefined}
                >
                  <Icon className={`bi ${isForceDownloadType(applicant.tor_url) ? 'bi-download' : 'bi-eye'}`} /> 
                  {isForceDownloadType(applicant.tor_url) ? 'Download TOR' : 'View TOR'}
                </a>
              </div>
            )}

            {applicant.eligibility_url && (
              <div className="d-grid">
                <a
                  href={`${API_URL}/uploads/${applicant.id}/applications/${applicant.jobId}/${applicant.eligibility_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-primary"
                  download={isForceDownloadType(applicant.eligibility_url) ? '' : undefined}
                >
                  <Icon className={`bi ${isForceDownloadType(applicant.eligibility_url) ? 'bi-download' : 'bi-eye'}`} /> 
                  {isForceDownloadType(applicant.eligibility_url) ? 'Download Eligibility' : 'View Eligibility'}
                </a>
              </div>
            )}

            {applicant.trainings_url && (
              <div className="d-grid">
                <a
                  href={`${API_URL}/uploads/${applicant.id}/applications/${applicant.jobId}/${applicant.trainings_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-primary"
                  download={isForceDownloadType(applicant.trainings_url) ? '' : undefined}
                >
                  <Icon className={`bi ${isForceDownloadType(applicant.trainings_url) ? 'bi-download' : 'bi-eye'}`} /> 
                  {isForceDownloadType(applicant.trainings_url) ? 'Download Trainings' : 'View Trainings'}
                </a>
              </div>
            )}

            </div>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="danger" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};