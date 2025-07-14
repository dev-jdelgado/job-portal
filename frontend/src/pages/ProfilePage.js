import { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Modal, Form, Spinner, Alert, Tabs, Tab } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import './ProfilePage.css';

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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/users/${user.id}`);
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
    // Append all fields to FormData
    Object.keys(editData).forEach(key => {
      // Don't append unchanged files or null/undefined values
      if (key === 'profilePicture' && editData.profilePicture) {
        formData.append('profilePicture', editData.profilePicture);
      } else if (key === 'resume' && editData.resume) {
        formData.append('resume', editData.resume);
      } else if (key !== 'profilePicture' && key !== 'resume' && editData[key] !== null && editData[key] !== undefined) {
        formData.append(key, editData[key]);
      }
    });

    try {
      await axios.put(`http://localhost:5000/api/users/${user.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setShowModal(false);
      // Refresh profile data after update
      const res = await axios.get(`http://localhost:5000/api/users/${user.id}`);
      const updatedProfileData = {
          ...res.data,
          date_of_birth: res.data.date_of_birth ? res.data.date_of_birth.split('T')[0] : '',
      };
      setProfile(updatedProfileData);
    } catch (err) {
      setError('Failed to update profile.');
    }
  };

  if (loading) return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;
  if (error) return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;
  if (!profile) return null;

  return (
    <div className="profile-page-wrapper">
      <Container className="py-5">
        <Row>
          <Col lg={4}>
            <Card className="profile-card text-center p-4 mb-4">
              <img
                src={profile.profile_picture_url ? `http://localhost:5000${profile.profile_picture_url}` : 'https://via.placeholder.com/150'}
                alt="Profile"
                className="profile-picture"
              />
              <Card.Body>
                <Card.Title className="profile-name">{profile.name}</Card.Title>
                <p><strong>Age:</strong> {calculateAge(profile.date_of_birth) || 'Not specified'}</p>
                <Button variant="primary" className="edit-profile-btn" onClick={() => { setEditData(profile); setShowModal(true); }}>
                  Edit Profile
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={8}>
            <Card className="details-card">
              <Card.Body>
                {/* NEW: Redesigned details section with Tabs */}
                <Tabs defaultActiveKey="about" id="profile-tabs" className="profile-tabs mb-3">
                  <Tab eventKey="about" title="About Me">
                    <div className="p-3">
                      <p className="bio-text">{profile.bio || 'No bio provided. Click "Edit Profile" to add one.'}</p>
                    </div>
                  </Tab>
                  <Tab eventKey="professional" title="Professional Info">
                    <div className="p-3">
                      <p><strong>Skills:</strong> {profile.skills || 'Not specified'}</p>
                      <p><strong>Education:</strong> {profile.education || 'Not specified'}</p>
                      <p><strong>Disability Status:</strong> {profile.disability_status || 'Not specified'}</p>
                      {profile.resume_url && (
                        <Button variant="secondary" href={`http://localhost:5000${profile.resume_url}`} target="_blank" className="resume-btn mt-3">
                          View Resume
                        </Button>
                      )}
                    </div>
                  </Tab>
                  <Tab eventKey="contact" title="Contact Details">
                     <div className="p-3">
                      <p><strong>Email:</strong> {profile.email || 'Not specified'}</p>
                      <p><strong>Phone:</strong> {profile.phone_number || 'Not specified'}</p>
                      <p><strong>Address:</strong> {profile.address || 'Not specified'}</p>
                    </div>
                  </Tab>
                </Tabs>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Edit Profile Modal with new fields */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Edit Profile</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUpdate}>
            <Form.Group className="mb-3"><Form.Label>Name</Form.Label><Form.Control type="text" name="name" value={editData.name || ''} onChange={handleInputChange} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Email</Form.Label><Form.Control type="email" name="email" value={editData.email || ''} onChange={handleInputChange} /></Form.Group>
            
            {/* NEW: Added fields for new details */}
            <Form.Group className="mb-3"><Form.Label>Date of Birth</Form.Label><Form.Control type="date" name="date_of_birth" value={editData.date_of_birth || ''} onChange={handleInputChange} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Phone Number</Form.Label><Form.Control type="tel" name="phone_number" value={editData.phone_number || ''} onChange={handleInputChange} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Address</Form.Label><Form.Control type="text" name="address" value={editData.address || ''} onChange={handleInputChange} /></Form.Group>

            <Form.Group className="mb-3"><Form.Label>Short Bio</Form.Label><Form.Control as="textarea" rows={3} name="bio" value={editData.bio || ''} onChange={handleInputChange} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Skills (comma-separated)</Form.Label><Form.Control type="text" name="skills" value={editData.skills || ''} onChange={handleInputChange} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Education</Form.Label><Form.Control type="text" name="education" value={editData.education || ''} onChange={handleInputChange} /></Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Profile Picture</Form.Label>
              {profile.profile_picture_url && (
                <div className="mb-2 text-muted">
                  Current file: <strong>{profile.profile_picture_url.split('/').pop().split('-').slice(1).join('-')}</strong>
                </div>
              )}
              <Form.Control type="file" name="profilePicture" onChange={handleFileChange} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Personal Data Sheet (PDF/Excel)</Form.Label>
              {profile.pds_url && (
                <div className="mb-2 text-muted">
                  Current file: <strong>{profile.pds_url.split('/').pop().split('-').slice(1).join('-')}</strong>
                </div>
              )}
              <Form.Control type="file" name="pds" onChange={handleFileChange} />
            </Form.Group>
            
            <Button variant="primary" type="submit" className="w-100 save-changes-btn">Save Changes</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default ProfilePage;