"use client"

import { useState } from "react"
import { Modal, Button, Form, Row, Col, Alert } from "react-bootstrap"
import axios from "axios"

function JobPostModal({ show, handleClose, employerId, onJobPosted }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    employment_type: "Full-time",
    applicant_type: "Entry Level",
    education: "Bachelor's Degree",
    skills: "",
    location: "",
    salary: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await axios.post("http://localhost:5000/jobs", {
        ...formData,
        employer_id: employerId,
      })

      onJobPosted()
      handleClose()

      // Reset form
      setFormData({
        title: "",
        description: "",
        employment_type: "Full-time",
        applicant_type: "Entry Level",
        education: "Bachelor's Degree",
        skills: "",
        location: "",
        salary: "",
      })
    } catch (err) {
      console.error("Error posting job:", err)
      setError("Failed to post job. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Post a New Job</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Job Title *</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Senior Software Engineer"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Location</Form.Label>
                <Form.Control
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g. New York, NY or Remote"
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Job Description *</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              placeholder="Describe the role, responsibilities, and requirements..."
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Employment Type</Form.Label>
                <Form.Select name="employment_type" value={formData.employment_type} onChange={handleInputChange}>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Experience Level</Form.Label>
                <Form.Select name="applicant_type" value={formData.applicant_type} onChange={handleInputChange}>
                  <option value="Entry Level">Entry Level</option>
                  <option value="Mid Level">Mid Level</option>
                  <option value="Senior Level">Senior Level</option>
                  <option value="Executive">Executive</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Education Requirement</Form.Label>
                <Form.Select name="education" value={formData.education} onChange={handleInputChange}>
                  <option value="High School">High School</option>
                  <option value="Associate Degree">Associate Degree</option>
                  <option value="Bachelor's Degree">Bachelor's Degree</option>
                  <option value="Master's Degree">Master's Degree</option>
                  <option value="PhD">PhD</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Salary Range</Form.Label>
                <Form.Control
                  type="text"
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  placeholder="e.g. $80,000 - $120,000"
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Required Skills *</Form.Label>
            <Form.Control
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleInputChange}
              required
              placeholder="e.g. JavaScript, React, Node.js, SQL"
            />
            <Form.Text className="text-muted">Separate skills with commas</Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Posting..." : "Post Job"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default JobPostModal
