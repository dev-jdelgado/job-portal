import { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Modal, Form, Spinner, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import './ProfilePage.css';

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
        setProfile(res.data);
        setEditData(res.data);
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
    const { name, files } = e.target;
    setEditData({ ...editData, [name]: files[0] });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', editData.name);
    formData.append('email', editData.email);
    formData.append('bio', editData.bio || '');
    formData.append('skills', editData.skills || '');
    formData.append('education', editData.education || '');
    formData.append('disability_status', editData.disability_status || 'Non-PWD');
    
    if (editData.profilePicture) {
      formData.append('profilePicture', editData.profilePicture);
    } else {
      formData.append('existingProfilePicture', profile.profile_picture_url || '');
    }

    if (editData.pds) {
      formData.append('pds', editData.pds);
    } else {
      formData.append('existingPDS', profile.pds_url || '');
    }

    try {
      await axios.put(`http://localhost:5000/api/users/${user.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setShowModal(false);
      // Refresh profile data
      const res = await axios.get(`http://localhost:5000/api/users/${user.id}`);
      setProfile(res.data);
    } catch (err) {
      setError('Failed to update profile.');
      console.error(err);
    }
  };

  if (loading) {
    return <Container className="text-center mt-5"><Spinner animation="border" variant="primary" /></Container>;
  }

  if (error) {
    return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;
  }

  return (
    <div className="profile-page-wrapper">
      <Container className="py-5">
        <Row>
          <Col md={4}>
            <Card className="profile-card text-center p-4">
              <img
                src={
                  profile.profile_picture_url
                    ? `http://localhost:5000${profile.profile_picture_url}`
                    : 'https://via.placeholder.com/150'
                }
                alt="Profile"
                className="profile-picture"
              />
              <Card.Body className="text-center">
                <Card.Title className="profile-name">{profile.name}</Card.Title>
                <Card.Text className="profile-email">{profile.email}</Card.Text>
                <Button variant="primary" className="edit-profile-btn" onClick={() => setShowModal(true)}>
                  Edit Profile
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={8}>
            <Card className="details-card">
              <Card.Body>
                <h3 className="section-title">About Me</h3>
                <p className="bio-text">{profile.bio || 'No bio provided.'}</p>
                <hr />
                <h3 className="section-title">Details</h3>
                <p><strong>Skills:</strong> {profile.skills || 'Not specified'}</p>
                <p><strong>Education:</strong> {profile.education || 'Not specified'}</p>
                <p><strong>Disability Status:</strong> {profile.disability_status || 'Not specified'}</p>
                {profile.pds_url && (
                  <Button variant="secondary" href={`http://localhost:5000${profile.pds_url}`} target="_blank" className="pds-btn">
                    View PDS
                  </Button>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Edit Profile Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUpdate}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" name="name" value={editData.name || ''} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" name="email" value={editData.email || ''} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Short Bio</Form.Label>
              <Form.Control as="textarea" rows={3} name="bio" value={editData.bio || ''} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Skills (comma-separated)</Form.Label>
              <Form.Control type="text" name="skills" value={editData.skills || ''} onChange={handleInputChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Education</Form.Label>
              <Form.Control type="text" name="education" value={editData.education || ''} onChange={handleInputChange} />
            </Form.Group>
            
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



            <Button variant="primary" type="submit" className="w-100 save-changes-btn">
              Save Changes
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default ProfilePage;