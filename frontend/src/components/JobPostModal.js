import React, { useState, useEffect  } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';

function JobPostModal({ show, handleClose, employerId, onJobPosted }) {
    
useEffect(() => {
    if (show) {
        setJobData({
            title: '',
            description: '',
            education: '',
            skills: []
        });
    }
}, [show]);


const [jobData, setJobData] = useState({
    title: '',
    description: '',
    education: '',
    skills: []
});

const skillsList = [
    'React',
    'Node.js',
    'MySQL',
    'JavaScript',
    'HTML',
    'CSS',
    'Python',
    'Java',
    'PHP'
];

const education = [
    "BS Information Technology", "BS Computer Science", "BS Business Administration",
    "BS Accountancy", "BS Psychology", "BS Marketing", "BS Engineering"
];

const handleChange = (e) => {
    setJobData({ ...jobData, [e.target.name]: e.target.value });
};

const handleSkillChange = (e) => {
    const skill = e.target.value;
    const isChecked = e.target.checked;
    const updatedSkills = isChecked
        ? [...jobData.skills, skill]
        : jobData.skills.filter(s => s !== skill);

    setJobData({ ...jobData, skills: updatedSkills });
};

const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        await axios.post('http://localhost:5000/jobs', {
            ...jobData,
            skills: jobData.skills.join(', '), // store as comma-separated string
            employer_id: employerId
        });
        onJobPosted();
        handleClose();
    } catch (err) {
        console.error('Error posting job:', err);
    }
};

return (
    <Modal show={show} onHide={handleClose}>
        <Form onSubmit={handleSubmit}>
            <Modal.Header closeButton>
                <Modal.Title>Post a Job</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group className="mb-3">
                    <Form.Label>Job Title</Form.Label>
                    <Form.Control type="text" name="title" onChange={handleChange} required />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control as="textarea" rows={3} name="description" onChange={handleChange} required />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Education</Form.Label>
                    <Form.Select name="education" onChange={handleChange} required>
                    <option value="">Select Education</option>
                    {education.map(level => (
                        <option key={level} value={level}>{level}</option>
                    ))}
                    </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Skills Needed</Form.Label>
                    <div className="d-flex flex-wrap">
                    {skillsList.map(skill => (
                        <Form.Check
                        key={skill}
                        type="checkbox"
                        id={skill}
                        label={skill}
                        value={skill}
                        onChange={handleSkillChange}
                        className="me-3 mb-2"
                        />
                    ))}
                    </div>
                </Form.Group>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Cancel</Button>
                <Button type="submit" variant="primary">Post Job</Button>
            </Modal.Footer>
        </Form>
    </Modal>
  );
}

export default JobPostModal;
