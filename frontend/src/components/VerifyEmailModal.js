import { Modal, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

function VerifyEmailModal({ show, onClose, name }) {
  return (
    <Modal show={show} backdrop="static" keyboard={false} onHide={() => {}} centered>
      <Modal.Header>
        <Modal.Title>Email Not Verified</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Hi <strong>{name || "there"},</strong></p>
        <p>Welcome to <strong>SkillLink!!</strong></p>
        <p>
          In order to proceed, you need to verify your email address. Please verify your email to access all features.
        </p>
        <p>
          You can verify your email from the{" "}
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
