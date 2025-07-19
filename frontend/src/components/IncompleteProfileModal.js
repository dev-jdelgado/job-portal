import { Modal, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

function IncompleteProfileModal({ show }) {
  return (
    <Modal show={show} onHide={() => {}} backdrop="static" keyboard={false} centered>
      <Modal.Header>
        <Modal.Title>Complete Your Profile</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>To maximize your job matching experience, please complete your profile.</p>
        <p>This includes information like your bio, contact details, and more.</p>
      </Modal.Body>
      <Modal.Footer>
        <Link to="/profile">
          <Button variant="primary">Go to Profile Page</Button>
        </Link>
      </Modal.Footer>
    </Modal>
  );
}

export default IncompleteProfileModal;
