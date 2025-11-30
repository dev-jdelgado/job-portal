import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";

export const ApplicantScoreModal = ({ show, onHide, applicant, onSave }) => {
  const [scores, setScores] = useState({
    education: 0,
    experience: 0,
    skills: 0,
    interview: 0,
    ethics: 0
  });

  useEffect(() => {
    if (show && applicant) {
      setScores({
        education: applicant.scoreEducation || 0,
        experience: applicant.scoreExperience || 0,
        skills: applicant.scoreSkills || 0,
        interview: applicant.scoreInterview || 0,
        ethics: applicant.scoreEthics || 0
      });
    }
  }, [applicant, show]);
  

  const total =
    Number(scores.education) +
    Number(scores.experience) +
    Number(scores.skills) +
    Number(scores.interview) +
    Number(scores.ethics);

  const updateScore = (field, value) => {
    setScores(prev => ({ ...prev, [field]: Number(value) }));
  };

  const handleSave = () => {
    onSave(applicant.applicationId, scores, total);
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Applicant Scoring</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p><strong>{applicant?.name}</strong></p>

        {/* EDUCATION */}
        <h5>1. Educational Attainment (max 25)</h5>
        <Form.Check
          label="Master’s Degree / Board Passer (25)"
          type="radio"
          name="education"
          checked={scores.education === 25}
          onChange={() => updateScore("education", 25)}
        />
        <Form.Check
          label="Bachelor’s Degree – related field (20)"
          type="radio"
          name="education"
          checked={scores.education === 20}
          onChange={() => updateScore("education", 20)}
        />
        <Form.Check
          label="Bachelor’s Degree – non-related (15)"
          type="radio"
          name="education"
          checked={scores.education === 15}
          onChange={() => updateScore("education", 15)}
        />
        <Form.Check
          label="Vocational / Associate Degree (10)"
          type="radio"
          name="education"
          checked={scores.education === 10}
          onChange={() => updateScore("education", 10)}
        />
        <Form.Check
          label="High School Graduate (5)"
          type="radio"
          name="education"
          checked={scores.education === 5}
          onChange={() => updateScore("education", 5)}
        />

        <hr />

        {/* EXPERIENCE */}
        <h5>2. Work Experience (max 25)</h5>
        <Form.Check
          label="5+ years (related) – 25"
          type="radio"
          name="experience"
          checked={scores.experience === 25}
          onChange={() => updateScore("experience", 25)}
        />
        <Form.Check
          label="3–4 years (related) – 20"
          type="radio"
          name="experience"
          checked={scores.experience === 20}
          onChange={() => updateScore("experience", 20)}
        />
        <Form.Check
          label="1–2 years (related) – 15"
          type="radio"
          name="experience"
          checked={scores.experience === 15}
          onChange={() => updateScore("experience", 15)}
        />
        <Form.Check
          label="Less than 1 year (related) – 10"
          type="radio"
          name="experience"
          checked={scores.experience === 10}
          onChange={() => updateScore("experience", 10)}
        />
        <Form.Check
          label="No experience – 5"
          type="radio"
          name="experience"
          checked={scores.experience === 5}
          onChange={() => updateScore("experience", 5)}
        />

        <hr />

        {/* SKILLS */}
        <h5>3. Skills & Competencies (max 20)</h5>
        <Form.Check
          label="Expert – 20"
          type="radio"
          name="skills"
          checked={scores.skills === 20}
          onChange={() => updateScore("skills", 20)}
        />
        <Form.Check
          label="Advanced – 15"
          type="radio"
          name="skills"
          checked={scores.skills === 15}
          onChange={() => updateScore("skills", 15)}
        />
        <Form.Check
          label="Intermediate – 10"
          type="radio"
          name="skills"
          checked={scores.skills === 10}
          onChange={() => updateScore("skills", 10)}
        />
        <Form.Check
          label="Beginner – 5"
          type="radio"
          name="skills"
          checked={scores.skills === 5}
          onChange={() => updateScore("skills", 5)}
        />

        <hr />

        {/* INTERVIEW */}
        <h5>4. Interview Performance (max 20)</h5>
        <Form.Check
          label="Excellent – 20"
          type="radio"
          name="interview"
          checked={scores.interview === 20}
          onChange={() => updateScore("interview", 20)}
        />
        <Form.Check
          label="Good – 15"
          type="radio"
          name="interview"
          checked={scores.interview === 15}
          onChange={() => updateScore("interview", 15)}
        />
        <Form.Check
          label="Satisfactory – 10"
          type="radio"
          name="interview"
          checked={scores.interview === 10}
          onChange={() => updateScore("interview", 10)}
        />
        <Form.Check
          label="Needs improvement – 5"
          type="radio"
          name="interview"
          checked={scores.interview === 5}
          onChange={() => updateScore("interview", 5)}
        />

        <hr />

        {/* ETHICS */}
        <h5>5. Character & Work Ethics (max 10)</h5>
        <Form.Check
          label="Excellent – 10"
          type="radio"
          name="ethics"
          checked={scores.ethics === 10}
          onChange={() => updateScore("ethics", 10)}
        />
        <Form.Check
          label="Good – 7"
          type="radio"
          name="ethics"
          checked={scores.ethics === 7}
          onChange={() => updateScore("ethics", 7)}
        />
        <Form.Check
          label="Fair – 5"
          type="radio"
          name="ethics"
          checked={scores.ethics === 5}
          onChange={() => updateScore("ethics", 5)}
        />
        <Form.Check
          label="Poor – 2"
          type="radio"
          name="ethics"
          checked={scores.ethics === 2}
          onChange={() => updateScore("ethics", 2)}
        />

        <hr />
        <h4 className="text-center mt-3">
          TOTAL SCORE: <strong>{total}</strong> / 100
        </h4>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Close</Button>
        <Button variant="success" onClick={handleSave}>Save Score</Button>
      </Modal.Footer>
    </Modal>
  );
};
