import { Modal, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

function VerifyEmailModal({ show, onClose }) {
  return (
    <Modal show={show} backdrop="static" keyboard={false} onHide={() => {}} centered>
      <Modal.Header>
        <Modal.Title>Email Not Verified</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Your email address has not been verified yet. Please verify your email to access all features.</p>
        <p>
          You can resend the verification email from your{" "}
          <Link to="/account-settings" onClick={onClose}>
            Account Settings
          </Link>{" "}
          page.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Link to="/account-settings">
          <Button variant="primary" onClick={onClose}>
            Go to Account Settings
          </Button>
        </Link>
      </Modal.Footer>
    </Modal>
  );
}

export default VerifyEmailModal;
