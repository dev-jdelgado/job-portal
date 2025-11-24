import { useState } from "react"
import { Modal, Button, Form, Row, Col, Alert } from "react-bootstrap"
import axios from "axios"
import { useEffect } from "react"
import config from '../config';

const API_URL = config.API_URL;

const IT_skillOptions = [
  "HTML/CSS", 
  "JavaScript", 
  "React.js/Angular/Vue.js", 
  "Node.js/Express", 
  "Python/Django / Flask", 
  "Java/Spring", 
  "C#/.NET", 
  "SQL/MySQL/PostgreSQL", 
  "MongoDB", 
  "Git/GitHub", 
  "DevOps", 
  "AWS/Azure/GCP", 
  "Cybersecurity", 
  "UI/UX Design", 
  "Mobile Development"
];

const Business_skillOptions = [
  "Project Management", 
  "Business Analysis", 
  "Marketing Strategy", 
  "Budgeting & Forecasting", 
  "Customer Relationship Management", 
  "Sales & Lead Generation", 
  "Human Resources Management", 
  "Operations Management"
];

const Marketing_skillOptions = [
  "SEO/SEM", 
  "Content Writing/Copywriting", 
  "Social Media Marketing", 
  "Google Ads/Facebook Ads", 
  "Email Marketing", 
  "Analytics", 
  "Brand Management", 
  "Video Editing/Multimedia"
];

const Finance_skillOptions = [
  "Bookkeeping", 
  "Financial Analysis", 
  "Accounting Software", 
  "Tax Preparation", 
  "Auditing", 
  "Payroll Management"
];

const Engineering_skillOptions = [
  "AutoCAD/SolidWorks", 
  "Electrical Design", 
  "Civil Engineering Tools", 
  "Mechanical Design", 
  "Process Engineering"
];

const Universal_skillOptions = [
  "Communication", 
  "Teamwork", 
  "Time Management", 
  "Problem Solving", 
  "Critical Thinking", 
  "Adaptability", 
  "Leadership", 
  "Work Ethic", 
  "Active Listening", 
  "Troubleshooting Skills", 
  "Computer Literacy", 
  "Digital Literacy", 
  "MS Office Proficiency"
];

// --------------------------------------
// NEWLY ADDED — LGU / Government Skill Sets
// --------------------------------------

const MunicipalTreasurer_skillOptions = [
  "Cash flow monitoring",
  "Revenue forecasting",
  "Local tax collection procedures",
  "Handling government fees & permits",
  "Financial audit preparation",
  "Official receipt management",
  "Barangay remittance reconciliation"
];

const MunicipalAccountant_skillOptions = [
  "Government accounting standards (NGAS)",
  "Journal entry preparation",
  "Financial statement consolidation",
  "Payroll accounting",
  "Voucher validation",
  "LGU fund management",
  "COA report compliance"
];

const MunicipalAssessor_skillOptions = [
  "Real property appraisal",
  "Tax mapping",
  "Zoning interpretation",
  "Property classification",
  "Assessment roll management",
  "Title verification",
  "Field inspection documentation"
];

const BudgetOffice_skillOptions = [
  "Annual budget formulation",
  "Budget proposal evaluation",
  "Fund allocation monitoring",
  "Supplemental budget preparation",
  "Work & Financial Plan (WFP) creation",
  "Budget utilization analysis"
];

const PlanningDevelopment_skillOptions = [
  "Community development planning",
  "Project feasibility analysis",
  "GIS mapping",
  "Development plan drafting",
  "Data profiling & surveys",
  "Urban & rural planning research"
];

const GovernmentEngineering_skillOptions = [
  "Construction plan review",
  "Structural assessment",
  "Building permit evaluation",
  "Quality assurance on public works",
  "Site inspection reporting",
  "Cost estimating"
];

const MunicipalHealth_skillOptions = [
  "Health program coordination",
  "Basic medical assessment",
  "Vaccination management",
  "Disease surveillance",
  "Environmental sanitation monitoring",
  "Patient record handling"
];

const CivilRegistry_skillOptions = [
  "Birth/Marriage/Death registration",
  "Certificate issuance",
  "Document verification",
  "Record coding & archiving",
  "Encoding civil status changes",
  "Data confidentiality handling"
];

const AdministrationOffice_skillOptions = [
  "Office operations oversight",
  "Policy implementation",
  "Document routing",
  "Inter-department coordination",
  "Staffing supervision",
  "Internal communication management"
];

const LegalOffice_skillOptions = [
  "Drafting legal opinions",
  "Reviewing municipal ordinances",
  "Preparing contracts and MOAs",
  "Case documentation",
  "Legal research for LGU matters",
  "Advising officials on legal compliance",
  "Summaries for administrative cases"
];

const Agriculture_skillOptions = [
  "Crop monitoring",
  "Soil testing interpretation",
  "Farmer training facilitation",
  "Agricultural project planning",
  "Livestock management basics",
  "Distribution of farming inputs"
];

const SocialWelfare_skillOptions = [
  "Casework documentation",
  "Community assistance profiling",
  "Program implementation (4Ps, AICS, etc.)",
  "Home visitation reporting",
  "Crisis intervention support",
  "Beneficiary evaluation"
];

const DisasterRiskReduction_skillOptions = [
  "Emergency response coordination",
  "Hazard mapping",
  "DRRM plan creation",
  "Incident reporting",
  "First aid & basic rescue",
  "Public safety communication"
];

const Tourism_skillOptions = [
  "Tourism program development",
  "Event planning",
  "Tourist assistance handling",
  "Cultural site documentation",
  "Marketing of local attractions",
  "Coordination with local enterprises"
];

function JobPostModal({ show, handleClose, adminId, onJobPosted, jobToEdit, startStep = 1 }) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    employment_type: "Full-time",
    disability_status: "Non-PWD",
    education: "High School",
    skills: [],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)


  useEffect(() => {
    if (jobToEdit) {
      setFormData({
        title: jobToEdit.title || "",
        description: jobToEdit.description || "",
        employment_type: jobToEdit.employment_type || "Full-time",
        disability_status: jobToEdit.disability_status || "Non-PWD",
        education: jobToEdit.education || "High School",
        skills: jobToEdit.skills?.split(",").map(s => s.trim()) || [],
      })
      setStep(startStep)  // <-- use prop
    } else {
      setFormData({
        title: "",
        description: "",
        employment_type: "Full-time",
        disability_status: "Non-PWD",
        education: "High School",
        skills: [],
      })
      setStep(1)
    }
  }, [jobToEdit, show, startStep])
  

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSkillToggle = (skill) => {
    setFormData((prev) => {
      const newSkills = prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
      return { ...prev, skills: newSkills }
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (jobToEdit) {
      setShowConfirmModal(true)
    } else {
      submitJob()
    }
  }

  const submitJob = async () => {
    setLoading(true)
    setError(null)
  
    try {
      const payload = {
        ...formData,
        skills: formData.skills.join(", "),
        admin_id: adminId,
      }
  
      if (jobToEdit) {
        await axios.put(`${API_URL}/jobs/${jobToEdit.id}`, payload)
      } else {
        await axios.post(`${API_URL}/jobs`, payload)
      }
  
      onJobPosted(jobToEdit ? "update" : "create")
      handleCloseAndReset()
    } catch (err) {
      console.error("Error posting/updating job:", err)
      setError("Failed to save job. Please try again.")
    } finally {
      setLoading(false)
      setShowConfirmModal(false)
    }
  }
  
  

  const handleNext = () => {
    if (!formData.title || !formData.description) {
      setError("Please fill out required fields.")
      return
    }
    setError(null)
    setStep(2)
  }

  const handleBack = () => {
    setStep(1)
  }

  const handleCloseAndReset = () => {
    setFormData({
      title: "",
      description: "",
      employment_type: "Full-time",
      disability_status: "Non-PWD",
      education: "High School",
      skills: [],
    })
    setStep(1)
    setError(null)
    handleClose()
  }

  return (
    <Modal show={show} onHide={handleCloseAndReset} size="lg" centered>
      <Modal.Header closeButton>
      <Modal.Title>
        {jobToEdit ? "Edit Job Posting" : "Post a New Job"}
      </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          {step === 1 && (
            <>
              <Row>
                <Col md={7}>
                  <Form.Group className="mb-3">
                    <Form.Label>Job Title *</Form.Label>
                    <Form.Control
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={5}>
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
                />
              </Form.Group>

              <Row>
                <Col md={7}>
                  <Form.Group className="mb-3">
                    <Form.Label>Education Requirement</Form.Label>
                    <Form.Select name="education" value={formData.education} onChange={handleInputChange}>
                      <option value="High School">High School</option>
                      <option value="Associate Degree">Associate Degree</option>
                      <option value="Bachelors Degree">Bachelor's Degree</option>
                      <option value="Masters Degree">Master's Degree</option>
                      <option value="PhD">PhD</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={5}>
                  <Form.Group className="mb-3">
                    <Form.Label>Disability Status</Form.Label>
                    <Form.Select name="disability_status" value={formData.disability_status} onChange={handleInputChange}>
                      <option value="Non-PWD">Non-PWD</option>
                      <option value="PWD">PWD</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </>
          )}

          {step === 2 && (
            <Form.Group className="mb-3">
              <Form.Label className="mb-3">Select Required Skills *</Form.Label>
              
              <div className='mb-4'>
                <label className="fw-semibold">Information Technology & Software</label>
                  <div className="row">
                    {IT_skillOptions.map((skill, idx) => (
                      <Col md={4} key={idx}>
                        <Form.Check
                          type="checkbox"
                          label={skill}
                          checked={formData.skills.includes(skill)}
                          onChange={() => handleSkillToggle(skill)}
                        />
                      </Col>
                    ))}
                </div>
              </div>
              
              <div className='mb-4'>
                <label className="fw-semibold">Business & Management</label>
                  <div className="row">
                    {Business_skillOptions.map((skill, idx) => (
                      <Col md={4} key={idx}>
                        <Form.Check
                          type="checkbox"
                          label={skill}
                          checked={formData.skills.includes(skill)}
                          onChange={() => handleSkillToggle(skill)}
                        />
                      </Col>
                    ))}
                </div>
              </div>

              <div className='mb-4'>
                <label className="fw-semibold">Marketing & Communications</label>
                  <div className="row">
                    {Marketing_skillOptions.map((skill, idx) => (
                      <Col md={4} key={idx}>
                        <Form.Check
                          type="checkbox"
                          label={skill}
                          checked={formData.skills.includes(skill)}
                          onChange={() => handleSkillToggle(skill)}
                        />
                      </Col>
                    ))}
                </div>
              </div>

              <div className='mb-4'>
                <label className="fw-semibold">Finance & Accounting</label>
                  <div className="row">
                    {Finance_skillOptions.map((skill, idx) => (
                      <Col md={4} key={idx}>
                        <Form.Check
                          type="checkbox"
                          label={skill}
                          checked={formData.skills.includes(skill)}
                          onChange={() => handleSkillToggle(skill)}
                        />
                      </Col>
                    ))}
                </div>
              </div>

              <div className='mb-4'>
                <label className="fw-semibold">Engineering & Technical</label>
                  <div className="row">
                    {Engineering_skillOptions.map((skill, idx) => (
                      <Col md={4} key={idx}>
                        <Form.Check
                          type="checkbox"
                          label={skill}
                          checked={formData.skills.includes(skill)}
                          onChange={() => handleSkillToggle(skill)}
                        />
                      </Col>
                    ))}
                </div>
              </div>

              {/* -------------------------------------- */}
              {/* NEW GOVERNMENT CATEGORY GROUPS */}
              {/* -------------------------------------- */}
            
              <div className='mb-4'>
                <label className="fw-semibold">Municipal Treasurer</label>
                  <div className="row">
                    {MunicipalTreasurer_skillOptions.map((skill, idx) => (
                      <Col md={4} key={idx}>
                        <Form.Check
                          type="checkbox"
                          label={skill}
                          checked={formData.skills.includes(skill)}
                          onChange={() => handleSkillToggle(skill)}
                        />
                      </Col>
                    ))}
                  </div>
              </div>
            
              <div className='mb-4'>
                <label className="fw-semibold">Municipal Accountant</label>
                  <div className="row">
                    {MunicipalAccountant_skillOptions.map((skill, idx) => (
                      <Col md={4} key={idx}>
                        <Form.Check
                          type="checkbox"
                          label={skill}
                          checked={formData.skills.includes(skill)}
                          onChange={() => handleSkillToggle(skill)}
                        />
                      </Col>
                    ))}
                  </div>
              </div>
            
              <div className='mb-4'>
                <label className="fw-semibold">Municipal Assessor</label>
                  <div className="row">
                    {MunicipalAssessor_skillOptions.map((skill, idx) => (
                      <Col md={4} key={idx}>
                        <Form.Check
                          type="checkbox"
                          label={skill}
                          checked={formData.skills.includes(skill)}
                          onChange={() => handleSkillToggle(skill)}
                        />
                      </Col>
                    ))}
                  </div>
              </div>
            
              <div className='mb-4'>
                <label className="fw-semibold">Budget Office</label>
                  <div className="row">
                    {BudgetOffice_skillOptions.map((skill, idx) => (
                      <Col md={4} key={idx}>
                        <Form.Check
                          type="checkbox"
                          label={skill}
                          checked={formData.skills.includes(skill)}
                          onChange={() => handleSkillToggle(skill)}
                        />
                      </Col>
                    ))}
                  </div>
              </div>
            
              <div className='mb-4'>
                <label className="fw-semibold">Planning & Development Office</label>
                  <div className="row">
                    {PlanningDevelopment_skillOptions.map((skill, idx) => (
                      <Col md={4} key={idx}>
                        <Form.Check
                          type="checkbox"
                          label={skill}
                          checked={formData.skills.includes(skill)}
                          onChange={() => handleSkillToggle(skill)}
                        />
                      </Col>
                    ))}
                  </div>
              </div>
            
              <div className='mb-4'>
                <label className="fw-semibold">Engineering Office (LGU)</label>
                  <div className="row">
                    {GovernmentEngineering_skillOptions.map((skill, idx) => (
                      <Col md={4} key={idx}>
                        <Form.Check
                          type="checkbox"
                          label={skill}
                          checked={formData.skills.includes(skill)}
                          onChange={() => handleSkillToggle(skill)}
                        />
                      </Col>
                    ))}
                  </div>
              </div>
            
              <div className='mb-4'>
                <label className="fw-semibold">Municipal Health Office</label>
                  <div className="row">
                    {MunicipalHealth_skillOptions.map((skill, idx) => (
                      <Col md={4} key={idx}>
                        <Form.Check
                          type="checkbox"
                          label={skill}
                          checked={formData.skills.includes(skill)}
                          onChange={() => handleSkillToggle(skill)}
                        />
                      </Col>
                    ))}
                  </div>
              </div>
            
              <div className='mb-4'>
                <label className="fw-semibold">Local Civil Registry Office</label>
                  <div className="row">
                    {CivilRegistry_skillOptions.map((skill, idx) => (
                      <Col md={4} key={idx}>
                        <Form.Check
                          type="checkbox"
                          label={skill}
                          checked={formData.skills.includes(skill)}
                          onChange={() => handleSkillToggle(skill)}
                        />
                      </Col>
                    ))}
                  </div>
              </div>
            
              <div className='mb-4'>
                <label className="fw-semibold">Municipal Administrator's Office</label>
                  <div className="row">
                    {AdministrationOffice_skillOptions.map((skill, idx) => (
                      <Col md={4} key={idx}>
                        <Form.Check
                          type="checkbox"
                          label={skill}
                          checked={formData.skills.includes(skill)}
                          onChange={() => handleSkillToggle(skill)}
                        />
                      </Col>
                    ))}
                  </div>
              </div>
            
              <div className='mb-4'>
                <label className="fw-semibold">Legal Services / Municipal Legal Office</label>
                  <div className="row">
                    {LegalOffice_skillOptions.map((skill, idx) => (
                      <Col md={4} key={idx}>
                        <Form.Check
                          type="checkbox"
                          label={skill}
                          checked={formData.skills.includes(skill)}
                          onChange={() => handleSkillToggle(skill)}
                        />
                      </Col>
                    ))}
                  </div>
              </div>
            
              <div className='mb-4'>
                <label className="fw-semibold">Agricultural Office</label>
                  <div className="row">
                    {Agriculture_skillOptions.map((skill, idx) => (
                      <Col md={4} key={idx}>
                        <Form.Check
                          type="checkbox"
                          label={skill}
                          checked={formData.skills.includes(skill)}
                          onChange={() => handleSkillToggle(skill)}
                        />
                      </Col>
                    ))}
                  </div>
              </div>
            
              <div className='mb-4'>
                <label className="fw-semibold">Social Welfare & Development Office</label>
                  <div className="row">
                    {SocialWelfare_skillOptions.map((skill, idx) => (
                      <Col md={4} key={idx}>
                        <Form.Check
                          type="checkbox"
                          label={skill}
                          checked={formData.skills.includes(skill)}
                          onChange={() => handleSkillToggle(skill)}
                        />
                      </Col>
                    ))}
                  </div>
              </div>
            
              <div className='mb-4'>
                <label className="fw-semibold">Disaster Risk Reduction & Management Office</label>
                  <div className="row">
                    {DisasterRiskReduction_skillOptions.map((skill, idx) => (
                      <Col md={4} key={idx}>
                        <Form.Check
                          type="checkbox"
                          label={skill}
                          checked={formData.skills.includes(skill)}
                          onChange={() => handleSkillToggle(skill)}
                        />
                      </Col>
                    ))}
                  </div>
              </div>
            
              <div className='mb-4'>
                <label className="fw-semibold">Tourism Office</label>
                  <div className="row">
                    {Tourism_skillOptions.map((skill, idx) => (
                      <Col md={4} key={idx}>
                        <Form.Check
                          type="checkbox"
                          label={skill}
                          checked={formData.skills.includes(skill)}
                          onChange={() => handleSkillToggle(skill)}
                        />
                      </Col>
                    ))}
                  </div>
              </div>

              <div className='mb-4'>
                <label className="fw-semibold">Soft Skills (Universal)</label>
                  <div className="row">
                    {Universal_skillOptions.map((skill, idx) => (
                      <Col md={4} key={idx}>
                        <Form.Check
                          type="checkbox"
                          label={skill}
                          checked={formData.skills.includes(skill)}
                          onChange={() => handleSkillToggle(skill)}
                        />
                      </Col>
                    ))}
                </div>
              </div>
          
          </Form.Group>          
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="danger" onClick={handleCloseAndReset} disabled={loading}>
            Cancel
          </Button>
          {step === 1 ? (
            <Button variant="primary" onClick={handleNext}>
              Next
            </Button>
          ) : (
            <>
              <Button variant="outline-primary" onClick={handleBack}>
                Back
              </Button>
              <Button type="submit" variant="primary" disabled={loading}>
              {loading
                ? jobToEdit
                  ? "Updating..."
                  : "Posting..."
                : jobToEdit
                  ? "Edit Job Posting"
                  : "Post a New Job"
              }
              </Button>
            </>
          )}
        </Modal.Footer>

        <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Update</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to update this job posting?
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={submitJob}>
              Yes, Update Job
            </Button>
          </Modal.Footer>
        </Modal>

      </Form>
    </Modal>
  )
}

export default JobPostModal
