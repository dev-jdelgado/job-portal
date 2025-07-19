import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

export const InterviewScheduleModal = ({ show, onHide, onConfirm }) => {
  const [dateTime, setDateTime] = useState('');

  const handleConfirm = () => {
    if (!dateTime) return alert("Please select a date and time.");
    onConfirm(new Date(dateTime));
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Schedule Interview</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group controlId="interviewDateTime">
          <Form.Label>Select Interview Date & Time</Form.Label>
          <Form.Control
            type="datetime-local"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancel</Button>
        <Button variant="primary" onClick={handleConfirm}>Confirm</Button>
      </Modal.Footer>
    </Modal>
  );
};
