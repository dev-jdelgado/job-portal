import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register as registerAPI } from '../services/API';

const courses = [
    "BS Information Technology", "BS Computer Science", "BS Business Administration",
    "BS Accountancy", "BS Psychology", "BS Marketing", "BS Engineering"
];

const skillOptions = [
    "HTML", "CSS", "JavaScript", "React", "Node.js", "MySQL",
    "Python", "Java", "Project Management", "Communication"
];

export default function Register() {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        role: 'seeker',
        education: '',
        skills: [],
    });
    const [msg, setMsg] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSkillCheckbox = (e) => {
        const { value, checked } = e.target;
        setForm(prev => {
        const updatedSkills = checked
            ? [...prev.skills, value]
            : prev.skills.filter(skill => skill !== value);
        return { ...prev, skills: updatedSkills };
        });
    };

    const handleNext = async () => {
        if (!form.name || !form.password || !form.role) {
        setMsg("Please fill in all required fields in Step 1");
        return;
        }

        if (form.role === 'employer') {
        // Directly submit if employer
        try {
            await registerAPI(form);
            navigate('/login');
        } catch (err) {
            setMsg(err.response?.data?.msg || 'Registration failed');
        }
        } else {
        // Proceed to Step 2 if seeker
        setMsg('');
        setStep(2);
        }
    };

    const handleBack = () => {
        setStep(1);
        setMsg('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
        await registerAPI(form);
        navigate('/login');
        } catch (err) {
        setMsg(err.response?.data?.msg || 'Registration failed');
        }
    };

    return (
        <div className="container mt-5 col-md-6 col-lg-5">
        <h2 className="mb-4 text-center">Register</h2>

        {/* Progress Bar */}
        {form.role === 'seeker' && (
            <div className="progress mb-4">
                <div
                    className={`progress-bar ${step === 2 ? 'bg-success' : ''}`}
                    role="progressbar"
                    style={{ width: step === 1 ? '50%' : '100%' }}
                >
                    Step {step} of 2
                </div>
            </div>
        )}

        {msg && <div className="alert alert-danger">{msg}</div>}

        <form onSubmit={handleSubmit}>
            {/* Step 1: Account Info */}
            {step === 1 && (
            <>
                <div className="mb-3">
                    <label>Name</label>
                    <input name="name" type="text" className="form-control"
                        value={form.name} onChange={handleChange} required />
                </div>

                <div className="mb-3">
                    <label>Email</label>
                    <input name="email" type="text" className="form-control"
                        value={form.email} onChange={handleChange} required />
                </div>

                <div className="mb-3">
                    <label>Password</label>
                    <input name="password" type="password" className="form-control"
                        value={form.password} onChange={handleChange} required />
                </div>

                <div className="mb-3">
                    <label>Role</label>
                    <select name="role" className="form-select"
                        value={form.role} onChange={handleChange}>
                        <option value="seeker">Job Seeker</option>
                        <option value="employer">Employer</option>
                    </select>
                </div>

                <button type="button" className="btn btn-primary w-100" onClick={handleNext}>
                    {form.role === 'seeker' ? 'Next' : 'Register'}
                </button>
            </>
            )}

            {/* Step 2: Education & Skills (only for seekers) */}
            {step === 2 && form.role === 'seeker' && (
            <>
                <div className="mb-3">
                <label>Education</label>
                <select name="education" className="form-select"
                    value={form.education} onChange={handleChange} required>
                    <option value="">-- Select Course --</option>
                    {courses.map(course => (
                    <option key={course} value={course}>{course}</option>
                    ))}
                </select>
                </div>

                <div className="mb-3">
                <label className="form-label d-block">Skills</label>
                <div className="row">
                    {skillOptions.map(skill => (
                    <div className="col-6" key={skill}>
                        <div className="form-check">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            value={skill}
                            id={skill}
                            checked={form.skills.includes(skill)}
                            onChange={handleSkillCheckbox}
                        />
                        <label className="form-check-label" htmlFor={skill}>
                            {skill}
                        </label>
                        </div>
                    </div>
                    ))}
                </div>
                </div>

                <div className="d-flex justify-content-between">
                <button type="button" className="btn btn-secondary" onClick={handleBack}>
                    Back
                </button>
                <button type="submit" className="btn btn-success">
                    Register
                </button>
                </div>
            </>
            )}

            {/* Link to login */}
            <p className="mt-3 text-center">
            Already have an account? <a href="/login">Login</a>
            </p>
        </form>
        </div>
    );
}
