import React, { useState } from 'react';
import { Button, Container, Toast, ToastContainer } from 'react-bootstrap';
import JobPostModal from '../components/JobPostModal';

function EmployerDashboard() {
    const [showModal, setShowModal] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const employerId = JSON.parse(localStorage.getItem('user'))?.id;

    const handleJobPosted = () => {
        setShowToast(true);
    };

    return (
        <Container className="mt-5">
        <h2>Employer Dashboard</h2>
        <Button onClick={() => setShowModal(true)} className="mt-3">Post a Job</Button>

        <JobPostModal
            show={showModal}
            handleClose={() => setShowModal(false)}
            employerId={employerId}
            onJobPosted={handleJobPosted}
        />

        <ToastContainer position="top-end" className="p-5">
            <Toast
            onClose={() => setShowToast(false)}
            show={showToast}
            delay={3000}
            autohide
            bg="success"
            >
            <Toast.Body className="text-white fs-5">
                Job posted successfully!</Toast.Body>
            </Toast>
        </ToastContainer>
        </Container>
    );
}

export default EmployerDashboard;
