import React from 'react';
import { Card, Badge, Button, ButtonGroup, Row, Col } from 'react-bootstrap';

// The Icon component remains the same
const Icon = ({ className }) => <i className={className} style={{ marginRight: '8px' }}></i>;

export const ApplicantCard = ({ applicant, onStatusUpdate, onViewDetails }) => {

  const getBorderVariant = (status) => {
    switch (status) {
      case 'shortlisted': return 'success';
      case 'rejected': return 'danger';
      default: return 'light';
    }
  };

  const skills = applicant.skills ? applicant.skills.split(',').map(s => s.trim()) : [];

  return (
    <div>
      <Card border={getBorderVariant(applicant.status)} className="mb-3 shadow-sm">
        {/* Replaced <Stack> with <Row> and <Col> for a table-like layout */}
        <Card.Body>
          <Row className="mb-2">
            <Col sm={4} md={3} as="strong"><Icon className="bi bi-envelope"/>Name</Col>
            <Col sm={8} md={9}>{applicant.name}</Col>
          </Row>
          <Row className="mb-2">
            <Col sm={4} md={3} as="strong"><Icon className="bi bi-envelope"/>Email</Col>
            <Col sm={8} md={9}>{applicant.email}</Col>
          </Row>
          <Row className="mb-2">
            <Col sm={4} md={3} as="strong"><Icon className="bi bi-mortarboard"/>Education</Col>
            <Col sm={8} md={9}>{applicant.education}</Col>
          </Row>
          <Row className="mb-2">
            <Col sm={4} md={3} as="strong"><Icon className="bi bi-person-badge"/>Disability</Col>
            <Col sm={8} md={9}>
              <Badge bg={applicant.disability_status === 'PWD' ? 'info' : 'secondary'}>
                {applicant.disability_status}
              </Badge>
            </Col>
          </Row>
          <Row>
            <Col sm={4} md={3} as="strong"><Icon className="bi bi-tags"/>Skills</Col>
            <Col sm={8} md={9}>
              {skills.length > 0 ? skills.map((skill, i) => (
                <Badge key={i} bg="primary" className="me-1 mb-1 fw-normal">{skill}</Badge>
              )) : <span className="text-muted">No skills listed</span>}
            </Col>
          </Row>
        </Card.Body>

        <Card.Footer className="d-flex justify-content-between align-items-center bg-white">
          <small className="text-muted">
            Applied: {new Date(applicant.applied_at).toLocaleDateString()}
          </small>
          <Button variant="outline-primary" size="sm" onClick={() => onViewDetails(applicant)}>
            <Icon className="bi bi-eye-fill"/> View Details
          </Button>
          {applicant.status === 'shortlisted' ? (
            <span className="text-success fw-semibold">
              <Icon className="bi bi-check-circle-fill" /> Applicant is shortlisted
            </span>
          ) : applicant.status === 'rejected' ? (
            <span className="text-danger fw-semibold">
              <Icon className="bi bi-x-circle-fill" /> Applicant has been rejected
            </span>
          ) : (
            <ButtonGroup size="sm">
              <Button
                variant="outline-success"
                onClick={() => onStatusUpdate(applicant.applicationId, 'shortlisted')}
              >
                <Icon className="bi bi-check-circle" /> Shortlist
              </Button>
              <Button
                variant="outline-danger"
                onClick={() => onStatusUpdate(applicant.applicationId, 'rejected')}
              >
                <Icon className="bi bi-x-circle" /> Reject
              </Button>
            </ButtonGroup>
          )}
        </Card.Footer>
      </Card>
    </div>
    
  );
};