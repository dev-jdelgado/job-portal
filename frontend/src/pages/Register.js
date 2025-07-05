import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register as registerAPI } from '../services/API';
import { Toast, ToastContainer } from 'react-bootstrap';


const education = [
    "High School", "Associate Degree", "Bachelors Degree", "Masters Degree", "PhD"
];

const IT_skillOptions = [
    "HTML/CSS", "JavaScript", "React.js/Angular/Vue.js", "Node.js/Express", "Python/Django / Flask", "Java/Spring",
    "C#/.NET", "SQL/MySQL/PostgreSQL", "MongoDB", "Git/GitHub", "DevOps", "AWS/Azure/GCP", "Cybersecurity",
    "UI/UX Design", "Mobile Development"
];
  
const Business_skillOptions = [
    "Project Management", "Business Analysis", "Marketing Strategy", "Budgeting & Forecasting", "Customer Relationship Management", "Sales & Lead Generation",
    "Human Resources Management", "Operations Management"
];
  
const Marketing_skillOptions = [
    "SEO/SEM", "Content Writing/Copywriting", "Social Media Marketing", "Google Ads/Facebook Ads", "Email Marketing", "Analytics", "Brand Management",
    "Video Editing/Multimedia"
];
  
const Finance_skillOptions = [
    "Bookkeeping", "Financial Analysis", "Accounting Software", "Tax Preparation", "Auditing", "Payroll Management"
];
  
const Engineering_skillOptions = [
    "AutoCAD/SolidWorks", "Electrical Design", "Civil Engineering Tools", "Mechanical Design", "Process Engineering"
];
  
const Universal_skillOptions = [
    "Communication", "Teamwork", "Time Management", "Problem Solving", "Critical Thinking", "Adaptability", "Leadership", "Work Ethic"
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
        disabilityStatus: '',
        pwdIdImage: null,
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
        if (step === 1) {
          if (!form.name || !form.email || !form.password) {
            showToast('Please fill in all required fields', 'danger');
            return;
          }
          setStep(2);
        } else if (step === 2) {
          if (!form.education || form.skills.length === 0) {
            showToast('Please complete your education and skills', 'danger');
            return;
          }
          setStep(3);
        }
    };
      
      
    const handleBack = () => {
        setStep(prev => Math.max(prev - 1, 1));
    };
      

    const handleSubmit = async (e) => {
        e.preventDefault();
      
        const formData = new FormData();
        Object.entries(form).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            formData.append(key, value.join(','));
          } else if (value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, value);
          }
        });
      
        try {
          await registerAPI(formData); // This should handle multipart/form-data
          showToast('Registration complete! Redirecting to login...', 'success');
          setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
          const msg = err.response?.data?.msg || 'Registration failed';
          showToast(msg, 'danger');
        }
    };
      
      
    

    const [toast, setToast] = useState({
        show: false,
        message: '',
        variant: 'success' // 'success' | 'danger' | 'warning'
    });

    const showToast = (message, variant = 'success') => {
        setToast({ show: true, message, variant });
    };
      


    return (
        <div className="container my-5 col-md-6 col-lg-5">
            <ToastContainer position="top-end" className="p-3">
                <Toast
                    bg={toast.variant}
                    onClose={() => setToast({ ...toast, show: false })}
                    show={toast.show}
                    delay={3000}
                    autohide
                >
                    <Toast.Body className={toast.variant === 'dark' ? 'text-light' : 'text-white'}>
                    {toast.message}
                    </Toast.Body>
                </Toast>
            </ToastContainer>


            <h2 className="mb-4 text-center">Register</h2>

            {/* Progress Bar */}
            {form.role === 'seeker' && (
            <div className="progress mb-4">
                <div
                className={`progress-bar ${step >= 2 ? 'bg-primary' : ''} ${step === 3 ? 'bg-primary' : ''}`}
                role="progressbar"
                style={{
                    width: `${step === 1 ? 33 : step === 2 ? 66 : 100}%`
                }}
                >
                Step {step} of 3
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

                    {/* 
                    <div className="mb-3">
                        <label>Role</label>
                        <select name="role" className="form-select"
                            value={form.role} onChange={handleChange}>
                            <option value="seeker">Job Seeker</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div> 
                    */}

                    <button type="button" className="btn btn-primary w-100" onClick={handleNext}>
                        {form.role === 'seeker' ? 'Next' : 'Register'}
                    </button>
                </>
                )}

                {/* Step 2: Education & Skills (only for seekers) */}
                {step === 2 && form.role === 'seeker' && (
                <>
                    <div className="mb-3">
                    <label className="form-label d-block">Education</label>
                    <select name="education" className="form-select"
                        value={form.education} onChange={handleChange} required>
                        <option value="">-- Select Education --</option>
                        {education.map(education => (
                        <option key={education} value={education}>{education}</option>
                        ))}
                    </select>
                    </div>

                    <div className="mb-3">
                    <label className="form-label d-block">Skills</label>
                        <div className='mb-4'>
                            <label className="fw-semibold">Information Technology & Software</label>
                            <div className="row">
                                {IT_skillOptions.map(skill => (
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

                        <div className='mb-4'>
                            <label className="fw-semibold">Business & Management</label>
                            <div className="row">
                                {Business_skillOptions.map(skill => (
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

                        <div className='mb-4'>
                            <label className="fw-semibold">Marketing & Communications</label>
                            <div className="row">
                                {Marketing_skillOptions.map(skill => (
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

                        <div className='mb-4'>
                            <label className="fw-semibold">Finance & Accounting</label>
                            <div className="row">
                                {Finance_skillOptions.map(skill => (
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

                        <div className='mb-4'>
                            <label className="fw-semibold">Engineering & Technical</label>
                            <div className="row">
                                {Engineering_skillOptions.map(skill => (
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

                        <div className='mb-4'>
                            <label className="fw-semibold">Soft Skills (Universal)</label>
                            <div className="row">
                                {Universal_skillOptions.map(skill => (
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
                        
                    </div>

                    <div className="d-flex justify-content-between mb-5">
                        <button type="button" className="btn btn-secondary" onClick={handleBack}>
                            Back
                        </button>
                        <button type="button" className="btn btn-primary" onClick={handleNext}>
                            {form.role === 'seeker' ? 'Next' : 'Register'}
                        </button>
                    </div>
                </>
                )}

                {step === 3 && form.role === 'seeker' && (
                <>
                    {/* Disability Status */}
                    <div className="mb-3">
                    <label className="form-label">Disability Status</label>
                    <select
                        name="disabilityStatus"
                        className="form-select"
                        value={form.disabilityStatus}
                        onChange={handleChange}
                        required
                    >
                        <option value="">-- Select Status --</option>
                        <option value="Non-PWD">Non-PWD</option>
                        <option value="PWD">PWD (Person with Disability)</option>
                    </select>
                    </div>

                    {/* PWD Image Upload */}
                    {form.disabilityStatus === 'PWD' && (
                    <div className="mb-3">
                        <label className="form-label">PWD ID Image</label>
                        <input
                        type="file"
                        accept="image/*"
                        className="form-control"
                        onChange={(e) =>
                            setForm(prev => ({ ...prev, pwdIdImage: e.target.files[0] }))
                        }
                        required
                        />
                    </div>
                    )}

                    <div className="d-flex justify-content-between mb-5">
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
