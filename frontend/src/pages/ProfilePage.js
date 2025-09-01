import { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Modal, Form, Spinner, Alert, Tabs, Tab, Badge } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import './ProfilePage.css';
import config from '../config';
import { Accordion } from 'react-bootstrap';


const API_URL = config.API_URL;
// Helper function to calculate age from date of birth
const calculateAge = (dob) => {
  if (!dob) return null;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [showSkillSection, setShowSkillSection] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 576);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 576);
    };
  
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const skillCategories = [
    { title: "Information Technology & Software", options: ["HTML/CSS", "JavaScript", "React.js/Angular/Vue.js", "Node.js/Express", "Python/Django / Flask", "Java/Spring", "C#/.NET", "SQL/MySQL/PostgreSQL", "MongoDB", "Git/GitHub", "DevOps", "AWS/Azure/GCP", "Cybersecurity", "UI/UX Design", "Mobile Development"] },
    { title: "Business & Management", options: ["Project Management", "Business Analysis", "Marketing Strategy", "Budgeting & Forecasting", "Customer Relationship Management", "Sales & Lead Generation", "Human Resources Management", "Operations Management"] },
    { title: "Marketing & Communications", options: ["SEO/SEM", "Content Writing/Copywriting", "Social Media Marketing", "Google Ads/Facebook Ads", "Email Marketing", "Analytics", "Brand Management", "Video Editing/Multimedia"] },
    { title: "Finance & Accounting", options: ["Bookkeeping", "Financial Analysis", "Accounting Software", "Tax Preparation", "Auditing", "Payroll Management"] },
    { title: "Engineering & Technical", options: ["AutoCAD/SolidWorks", "Electrical Design", "Civil Engineering Tools", "Mechanical Design", "Process Engineering"] },
    { title: "Soft Skills (Universal)", options: ["Communication", "Teamwork", "Time Management", "Problem Solving", "Critical Thinking", "Adaptability", "Leadership", "Work Ethic"] },
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/users/${user.id}`);
        // Format date for the form input
        const profileData = {
          ...res.data,
          date_of_birth: res.data.date_of_birth ? res.data.date_of_birth.split('T')[0] : '',
        };
        setProfile(profileData);
        setEditData(profileData);
      } catch (err) {
        setError('Failed to fetch profile data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchProfile();
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  const handleFileChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.files[0] });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
  
    // Handle specific files only if they exist
    if (editData.profilePicture instanceof File) {
      formData.append('profilePicture', editData.profilePicture);
    }
  
    if (editData.pwdIdImage instanceof File) {
      formData.append('pwdIdImage', editData.pwdIdImage);
    }
  
    // Append all other non-file fields
    Object.entries(editData).forEach(([key, value]) => {
      if (
        key !== 'profilePicture' &&
        key !== 'pwdIdImage' &&
        value !== null &&
        value !== undefined
      ) {
        formData.append(key, value);
      }
    });
  
    try {
      await axios.put(`${API_URL}/api/users/${user.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setShowModal(false);
  
      // Refresh profile data
      const res = await axios.get(`${API_URL}/api/users/${user.id}`);
      const updatedProfileData = {
        ...res.data,
        date_of_birth: res.data.date_of_birth ? res.data.date_of_birth.split('T')[0] : '',
      };
      setProfile(updatedProfileData);
    } catch (err) {
      console.error(err);
      setError('Failed to update profile.');
    }
  };

  const handleSkillCheckboxChange = (e) => {
    const { value, checked } = e.target;
    const currentSkills = editData.skills ? editData.skills.split(',').map(s => s.trim()) : [];
  
    const updatedSkills = checked
      ? [...new Set([...currentSkills, value])]
      : currentSkills.filter(skill => skill !== value);
  
    setEditData({ ...editData, skills: updatedSkills.join(',') });
  };

  if (loading) return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;
  if (error) return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;
  if (!profile) return null;

  const getInitials = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="profile-page-wrapper">
      <Container className="py-5">
        <Row>
          <Col lg={4} md={5}>
            <Card className="profile-card text-center p-4 mb-4">
              <div className="profile-picture-wrapper" style={{ width: '200px', height: '200px', margin: '0 auto', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', color: '#fff' }}>
                {profile.profile_picture_url ? (
                  <img
                    src={profile.profile_picture_url}
                    alt={profile.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  getInitials(profile.name)
                )}
              </div>
              <Card.Body>
                <Card.Title className="profile-name">{profile.name}</Card.Title>
                <p><strong>Age:</strong> {calculateAge(profile.date_of_birth) || 'Not specified'}</p>
                <Button className="edit-profile-btn navy-blue-btn" onClick={() => { setEditData(profile); setShowModal(true); }}>
                  Edit Profile
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={8} md={7}>
            <Card className="details-card">
              <Card.Body className='p-0'>
                {/* NEW: Redesigned details section with Tabs */}
                {isMobile ? (
                  <Accordion defaultActiveKey="0">
                    <Accordion.Item eventKey="0">
                      <Accordion.Header>About Me</Accordion.Header>
                      <Accordion.Body>
                        <p className="bio-text">{profile.bio || 'No bio provided. Click "Edit Profile" to add one.'}</p>
                      </Accordion.Body>
                    </Accordion.Item>

                    <Accordion.Item eventKey="1">
                      <Accordion.Header>Professional Info</Accordion.Header>
                      <Accordion.Body>
                        <div>
                          <strong>Skills:</strong> {profile.skills ? (
                            <div className="mb-4">
                              {profile.skills
                                .split(',')
                                .map(skill => skill.trim())
                                .filter(skill => skill.length > 0)
                                .map((skill, index) => (
                                  <Badge key={index} bg="primary" className="me-1">
                                    {skill}
                                  </Badge>
                                ))}
                            </div>
                          ) : (
                            <p className="text-muted">Not specified</p>
                          )}
                        </div>
                        <p><strong>Education:</strong> {profile.education || 'Not specified'}</p>
                        <p><strong>Disability Status:</strong> {profile.disability_status || 'Not specified'}</p>
                          {profile.disability_status === 'PWD' && profile.pwd_id_image && (
                              <div className="mt-3">
                                <strong>PWD ID:</strong>
                                <div>
                                  <a
                                    href={profile.pwd_id_image}
                                    download={`PWD_ID_${profile.name || 'user'}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <img
                                      src={profile.pwd_id_image}
                                      alt="PWD ID"
                                      style={{ maxWidth: '100%', maxHeight: '200px', marginTop: '0.5rem', border: '1px solid #ccc', borderRadius: '8px' }}
                                    />
                                  </a>
                                </div>
                              </div>
                            )}
                      </Accordion.Body>
                    </Accordion.Item>

                    <Accordion.Item eventKey="2">
                      <Accordion.Header>Contact</Accordion.Header>
                      <Accordion.Body>
                        <p><strong>Email:</strong> {profile.email || 'Not specified'}</p>
                        <p><strong>Phone:</strong> {profile.phone_number || 'Not specified'}</p>
                        <p><strong>Address:</strong> {profile.address || 'Not specified'}</p>
                      </Accordion.Body>
                    </Accordion.Item>
                  </Accordion>
                ) : (
                  <Tabs defaultActiveKey="about" id="profile-tabs" className="profile-tabs mb-3">
                    <Tab eventKey="about" title="About Me">
                      <div className="p-3">
                        <p className="bio-text">{profile.bio || 'No bio provided. Click "Edit Profile" to add one.'}</p>
                      </div>
                    </Tab>
                    <Tab eventKey="professional" title="Professional Info">
                      <div className="p-3">
                        <p className='m-0'><strong>Skills:</strong></p>
                        {profile.skills ? (
                          <div className="mb-4">
                            {profile.skills
                              .split(',')
                              .map(skill => skill.trim())
                              .filter(skill => skill.length > 0)
                              .map((skill, index) => (
                                <Badge key={index} bg="primary" className="me-1">
                                  {skill}
                                </Badge>
                              ))}
                          </div>
                        ) : (
                          <p className="text-muted">Not specified</p>
                        )}
                        <p><strong>Education:</strong> {profile.education || 'Not specified'}</p>
                        <p><strong>Disability Status:</strong> {profile.disability_status || 'Not specified'}</p>
                          {profile.disability_status === 'PWD' && profile.pwd_id_image && (
                            <div className="mt-3">
                              <strong>PWD ID:</strong>
                              <div>
                                <a
                                  href={profile.pwd_id_image}
                                  download={`PWD_ID_${profile.name || 'user'}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <img
                                    src={profile.pwd_id_image}
                                    alt="PWD ID"
                                    style={{ maxWidth: '100%', maxHeight: '200px', marginTop: '0.5rem', border: '1px solid #ccc', borderRadius: '8px' }}
                                  />
                                </a>
                              </div>
                            </div>
                          )}
                      </div>
                    </Tab>
                    <Tab eventKey="contact" title="Contact">
                      <div className="p-3">
                        <p><strong>Email:</strong> {profile.email || 'Not specified'}</p>
                        <p><strong>Phone:</strong> {profile.phone_number || 'Not specified'}</p>
                        <p><strong>Address:</strong> {profile.address || 'Not specified'}</p>
                      </div>
                    </Tab>
                  </Tabs>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Edit Profile Modal with new fields */}
      <Modal size="lg" show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Edit Profile</Modal.Title></Modal.Header>
        <Modal.Body>
        <Form onSubmit={handleUpdate}>
          <Container>
            <Row>
              <Col xs={12} lg={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control type="text" name="name" value={editData.name || ''} onChange={handleInputChange} />
                </Form.Group>
              </Col>

              <Col xs={12} lg={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" name="email" value={editData.email || ''} onChange={handleInputChange} />
                </Form.Group>
              </Col>

              <Col xs={12} lg={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date of Birth</Form.Label>
                  <Form.Control type="date" name="date_of_birth" value={editData.date_of_birth || ''} onChange={handleInputChange} />
                </Form.Group>
              </Col>

              <Col xs={12} lg={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control type="tel" name="phone_number" value={editData.phone_number || ''} onChange={handleInputChange} />
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control type="text" name="address" value={editData.address || ''} onChange={handleInputChange} />
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Short Bio</Form.Label>
                  <Form.Control as="textarea" rows={3} name="bio" value={editData.bio || ''} onChange={handleInputChange} />
                </Form.Group>
              </Col>

              <Col xs={12} lg={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="m-0">Skills</Form.Label>
                  {editData.skills && (
                    <div className="mb-2">
                      {editData.skills
                        .split(',')
                        .map(skill => skill.trim())
                        .filter(skill => skill.length > 0)
                        .map((skill, index) => (
                          <Badge key={index} bg="primary" className="me-1">
                            {skill}
                          </Badge>
                        ))}
                    </div>
                  )}
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => setShowSkillSection(prev => !prev)}
                  >
                    {showSkillSection ? 'Close Skills' : 'Edit Skills'}
                  </Button>

                  {showSkillSection && (
                    <div className="mt-3" style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ccc', padding: '1rem', borderRadius: '0.5rem' }}>
                      {skillCategories.map(category => (
                        <div key={category.title} className="mb-3">
                          <h6>{category.title}</h6>
                          <div className="d-flex flex-wrap">
                            {category.options.map(skill => {
                              const selectedSkills = editData.skills?.split(',').map(s => s.trim()) || [];
                              return (
                                <Form.Check
                                  key={skill}
                                  type="checkbox"
                                  label={skill}
                                  value={skill}
                                  checked={selectedSkills.includes(skill)}
                                  onChange={handleSkillCheckboxChange}
                                  className="me-3 mb-2"
                                />
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Form.Group>
              </Col>

              <Col xs={12} lg={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Education</Form.Label>
                  <Form.Control type="text" name="education" value={editData.education || ''} onChange={handleInputChange} />
                </Form.Group>
              </Col>

              <Col xs={12} lg={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Disability Status</Form.Label>
                  <Form.Select
                    name="disability_status"
                    value={editData.disability_status || ''}
                    onChange={handleInputChange}
                  >
                    <option value="">-- Select Status --</option>
                    <option value="Non-PWD">Non-PWD</option>
                    <option value="PWD">PWD (Person with Disability)</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              {editData.disability_status === 'PWD' && (
                <Col xs={12} lg={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>PWD ID Image</Form.Label>
                    {profile.pwd_id_image && (
                      <div className="mb-2 text-muted">
                        Current file: <strong>{profile.pwd_id_image.split('/').pop().split('-').slice(1).join('-')}</strong>
                      </div>
                    )}
                    <Form.Control type="file" name="pwdIdImage" accept="image/*" onChange={handleFileChange} />
                  </Form.Group>
                </Col>
              )}

              <Col xs={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Profile Picture</Form.Label>
                  {profile.profile_picture_url && (
                    <div className="mb-2 text-muted">
                      Current file: <strong>{profile.profile_picture_url.split('/').pop().split('-').slice(1).join('-')}</strong>
                    </div>
                  )}
                  <Form.Control type="file" name="profilePicture" onChange={handleFileChange} />
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Button variant="primary" type="submit" className="w-100 save-changes-btn navy-blue-btn">
                  Save Changes
                </Button>
              </Col>
            </Row>
          </Container>
        </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default ProfilePage;