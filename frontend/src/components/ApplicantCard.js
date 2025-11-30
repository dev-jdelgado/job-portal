import React, { useState } from 'react';
import { Card, Button, ButtonGroup, Row, Col, Spinner, Form, Modal } from 'react-bootstrap';


// The Icon component remains the same
const Icon = ({ className }) => <i className={className} style={{ marginRight: '8px' }}></i>;

export const ApplicantCard = ({ applicant, onStatusUpdate, onViewDetails, onScoreApplicant, isLoading, currentTab }) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState({ applicationId: null, status: '' });

  const handleConfirm = () => {
    if (pendingAction.applicationId && pendingAction.status) {
      onStatusUpdate(pendingAction.applicationId, pendingAction.status);
    }
    setShowConfirmModal(false);
    setPendingAction({ applicationId: null, status: '' });
  };

  const getBorderVariant = (status) => {
    switch (status) {
      case 'shortlisted': return 'success';
      case 'interviewed': return 'success';
      case 'selected': return 'success';
      case 'rejected': return 'danger';
      default: return 'secondary';
    }
  };

  return (
    <div>
      <Card border={getBorderVariant(applicant.status)} className="mb-3 shadow-sm">
        {/* Replaced <Stack> with <Row> and <Col> for a table-like layout */}
        <Card.Body>
          <Row className="mb-1">
            <Col sm={4} md={3} as="strong"><Icon className="bi bi-envelope"/>Name</Col>
            <Col sm={8} md={9}>{applicant.name}</Col>
          </Row>
          <Row className="mb-1">
            <Col sm={4} md={3} as="strong"><Icon className="bi bi-envelope"/>Email</Col>
            <Col sm={8} md={9}>{applicant.email}</Col>
          </Row>
          <Row className="mb-1">
            <Col sm={4} md={3} as="strong"><Icon className="bi bi-envelope"/>Applied:</Col>
            <Col sm={8} md={9}>{new Date(applicant.applied_at).toLocaleDateString()}</Col>
          </Row>

          {/* Show scores ONLY if the applicant is interviewed AND the current tab is "interviewed" */}
          {applicant.status === "interviewed" && currentTab === "interviewed" && (
            <Row className="mb-1">
              <Col sm={4} md={3} as="strong">
                <Icon className="bi bi-bar-chart-fill"/> Score
              </Col>
              <Col sm={8} md={9}>
                <span className="fw-bold text-primary">{applicant.totalScore ?? "Not scored yet"}</span>
                <span className="text-secondary"> / 100</span>
              </Col>
            </Row>
          )}
        </Card.Body>

        <Card.Footer className="d-flex justify-content-between align-items-center bg-white">
          <Button variant="outline-primary" size="sm" onClick={() => onViewDetails(applicant)}>
            <Icon className="bi bi-eye-fill"/> View Details
          </Button>

          {applicant.status === 'shortlisted' ? (
            <div className="d-flex align-items-center gap-2">
              <span className="text-success fw-semibold">
                <Icon className="bi bi-check-circle-fill" /> Shortlisted
              </span>
              <Form.Select
                size="sm"
                value={applicant.nextStatus || ''}
                disabled={isLoading}
                onChange={(e) => {
                  const selectedStatus = e.target.value;
                  if (selectedStatus) {
                    setPendingAction({ applicationId: applicant.applicationId, status: selectedStatus });
                    setShowConfirmModal(true);
                  }
                }}
                style={{ maxWidth: '180px', position: 'relative' }}
              >
                <option value="">Update Status</option>
                <option value="interviewed">Interviewed</option>
                <option value="rejected">Reject</option>
              </Form.Select>
              {isLoading && <Spinner animation="border" size="sm" className="ms-2" />}
            </div>
          ) : applicant.status === 'interviewed' ? (

            <div className="d-flex align-items-center gap-2">
              {/* NEW BUTTON */}
              {applicant.status === "interviewed" && currentTab === "interviewed" && (
                <Button
                  size="sm"
                  variant="outline-primary"
                  onClick={() => onScoreApplicant(applicant)}
                >
                  Score
                </Button>
              )}

              <span className="text-success fw-semibold ms-2">
                <Icon className="bi bi-check-circle-fill" /> Interviewed
              </span>
              <Form.Select
                size="sm"
                disabled={isLoading}
                onChange={(e) => {
                  const selectedStatus = e.target.value;
                  if (selectedStatus) {
                    setPendingAction({ applicationId: applicant.applicationId, status: selectedStatus });
                    setShowConfirmModal(true);
                  }
                }}
                style={{ maxWidth: '180px', position: 'relative' }}
              >
                <option value="">Update Status</option>
                <option value="selected">Select</option>
                <option value="rejected">Reject</option>
              </Form.Select>
              {isLoading && <Spinner animation="border" size="sm" className="ms-2" />}
            </div>

          ) : applicant.status === 'selected' ? (
            <div className="d-flex align-items-center gap-2">
              <span className="text-success fw-semibold">
                <Icon className="bi bi-check-circle-fill" /> Applicated has been Selected
              </span>
            </div>
          ) : applicant.status === 'rejected' ? (
            <span className="text-danger fw-semibold">
              <Icon className="bi bi-x-circle-fill" /> Applicant has been Rejected
            </span>
          ) : (
            <ButtonGroup size="sm">
              <Button
                variant="outline-success"
                onClick={() => {
                  setPendingAction({ applicationId: applicant.applicationId, status: 'shortlisted' });
                  setShowConfirmModal(true);
                }}
                disabled={isLoading}
              >
                <Icon className="bi bi-check-circle" /> Shortlist
              </Button>
              <Button
                variant="outline-danger"
                onClick={() => {
                  setPendingAction({ applicationId: applicant.applicationId, status: 'rejected' });
                  setShowConfirmModal(true);
                }}
                disabled={isLoading}
              >
                <Icon className="bi bi-check-circle" /> Reject
              </Button>
              {isLoading && <Spinner animation="border" size="sm" className="ms-2" />}
            </ButtonGroup>
          )}
        </Card.Footer>
      </Card>

      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Action</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {
            pendingAction.status === 'shortlisted' ? (
              'Are you sure you want to shortlist this applicant?'
            ) : pendingAction.status === 'rejected' ? ( 
              'Are you sure you want to reject this applicant?'
            ) : pendingAction.status === 'interviewed' ? ( 
              'Are you done interviewing this applicant?'
            ) : (
              'Are you sure you want to select this applicant?'
            )
          }
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Cancel
          </Button>
          <Button variant={pendingAction.status === 'rejected' ? 'danger' : 'success'} onClick={handleConfirm}>
            {
              pendingAction.status === 'shortlisted' ? ( 
                "Shortlist Applicant" 
              ) : 
              pendingAction.status === 'selected' ? ( 
                "Select Applicant" 
              ) :
              pendingAction.status === 'interviewed' ? ( 
                "Applicant Interviewed" 
              ) : ( 
                "Reject Applicant" 
              )
            }
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
    
  );
};
