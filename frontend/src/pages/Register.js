import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register as registerAPI } from '../services/API';
import { Toast, ToastContainer } from 'react-bootstrap';

// --- DATA (No Changes) ---
const education = ["High School", "Associate Degree", "Bachelors Degree", "Masters Degree", "PhD"];
const IT_skillOptions = ["HTML/CSS", "JavaScript", "React.js/Angular/Vue.js", "Node.js/Express", "Python/Django / Flask", "Java/Spring", "C#/.NET", "SQL/MySQL/PostgreSQL", "MongoDB", "Git/GitHub", "DevOps", "AWS/Azure/GCP", "Cybersecurity", "UI/UX Design", "Mobile Development"];
const Business_skillOptions = ["Project Management", "Business Analysis", "Marketing Strategy", "Budgeting & Forecasting", "Customer Relationship Management", "Sales & Lead Generation", "Human Resources Management", "Operations Management"];
const Marketing_skillOptions = ["SEO/SEM", "Content Writing/Copywriting", "Social Media Marketing", "Google Ads/Facebook Ads", "Email Marketing", "Analytics", "Brand Management", "Video Editing/Multimedia"];
const Finance_skillOptions = ["Bookkeeping", "Financial Analysis", "Accounting Software", "Tax Preparation", "Auditing", "Payroll Management"];
const Engineering_skillOptions = ["AutoCAD/SolidWorks", "Electrical Design", "Civil Engineering Tools", "Mechanical Design", "Process Engineering"];
const Universal_skillOptions = ["Communication", "Teamwork", "Time Management", "Problem Solving", "Critical Thinking", "Adaptability", "Leadership", "Work Ethic"];


export default function Register() {
    // --- STATE AND LOGIC (No Changes) ---
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'seeker', education: '', skills: [], disabilityStatus: '', pwdIdImage: null });
    const navigate = useNavigate();
    const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSkillCheckbox = (e) => {
        const { value, checked } = e.target;
        setForm(prev => ({ ...prev, skills: checked ? [...prev.skills, value] : prev.skills.filter(skill => skill !== value) }));
    };

    const handleNext = () => {
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
          if (Array.isArray(value)) formData.append(key, value.join(','));
          else formData.append(key, value);
        });
      
        try {
          await registerAPI(formData);
          showToast('Registration complete! Redirecting to login...', 'success');
          setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
          showToast(err.response?.data?.msg || 'Registration failed', 'danger');
        }
    };

    const showToast = (message, variant = 'success') => {
        setToast({ show: true, message, variant });
    };

    // --- JSX WITH NEW STYLING ---
    return (
        <div style={styles.container}>
            <ToastContainer position="top-end" className="p-3">
                <Toast bg={toast.variant} onClose={() => setToast({ ...toast, show: false })} show={toast.show} delay={3000} autohide>
                    <Toast.Body className={toast.variant === 'dark' ? 'text-light' : 'text-white'}>{toast.message}</Toast.Body>
                </Toast>
            </ToastContainer>

            <div style={styles.card}>
                <div style={styles.header}>
                    <h2 style={styles.title}>Create an Account</h2>
                    <p style={styles.subtitle}>Join our network of talented professionals.</p>
                </div>
                
                {/* Progress Bar */}
                <div style={styles.progressContainer}>
                    <div style={{...styles.progressBar, width: `${step === 1 ? 33 : step === 2 ? 66 : 100}%`}}>
                        Step {step} of 3
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Step 1: Account Info */}
                    {step === 1 && (
                    <>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Name</label>
                            <input name="name" type="text" style={styles.input} value={form.name} onChange={handleChange} required />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Email</label>
                            <input name="email" type="email" style={styles.input} value={form.email} onChange={handleChange} required />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Password</label>
                            <input name="password" type="password" style={styles.input} value={form.password} onChange={handleChange} required />
                        </div>
                        <button type="button" style={styles.button} onClick={handleNext}>Next: Education & Skills</button>
                    </>
                    )}

                    {/* Step 2: Education & Skills */}
                    {step === 2 && (
                    <>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Highest Education Attained</label>
                            <select name="education" style={styles.input} value={form.education} onChange={handleChange} required>
                                <option value="">-- Select Education --</option>
                                {education.map(edu => <option key={edu} value={edu}>{edu}</option>)}
                            </select>
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Skills</label>
                            <div style={styles.skillsContainer}>
                                {[
                                    { title: "Information Technology & Software", options: IT_skillOptions },
                                    { title: "Business & Management", options: Business_skillOptions },
                                    { title: "Marketing & Communications", options: Marketing_skillOptions },
                                    { title: "Finance & Accounting", options: Finance_skillOptions },
                                    { title: "Engineering & Technical", options: Engineering_skillOptions },
                                    { title: "Soft Skills (Universal)", options: Universal_skillOptions },
                                ].map(category => (
                                    <div key={category.title} style={{marginBottom: '1rem'}}>
                                        <h4 style={styles.skillCategoryTitle}>{category.title}</h4>
                                        <div style={styles.skillGrid}>
                                            {category.options.map(skill => (
                                                <div key={skill} style={styles.checkboxWrapper}>
                                                    <input type="checkbox" id={skill} value={skill} checked={form.skills.includes(skill)} onChange={handleSkillCheckbox} style={{marginRight: '8px'}}/>
                                                    <label htmlFor={skill} style={{fontSize: '0.9rem'}}>{skill}</label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div style={styles.buttonGroup}>
                            <button type="button" style={styles.secondaryButton} onClick={handleBack}>Back</button>
                            <button type="button" style={styles.button} onClick={handleNext}>Next: Disability Info</button>
                        </div>
                    </>
                    )}
                    
                    {/* Step 3: Disability Info */}
                    {step === 3 && (
                    <>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Disability Status</label>
                            <select name="disabilityStatus" style={styles.input} value={form.disabilityStatus} onChange={handleChange} required>
                                <option value="">-- Select Status --</option>
                                <option value="Non-PWD">Non-PWD</option>
                                <option value="PWD">PWD (Person with Disability)</option>
                            </select>
                        </div>
                        {form.disabilityStatus === 'PWD' && (
                        <div style={styles.formGroup}>
                            <label style={styles.label}>PWD ID Image</label>
                            <input type="file" accept="image/*" style={styles.input} onChange={(e) => setForm(prev => ({ ...prev, pwdIdImage: e.target.files[0] }))} required/>
                        </div>
                        )}
                        <div style={styles.buttonGroup}>
                            <button type="button" style={styles.secondaryButton} onClick={handleBack}>Back</button>
                            <button type="submit" style={{...styles.button, backgroundColor: '#16a34a'}}>Complete Registration</button>
                        </div>
                    </>
                    )}

                    <p style={styles.footerText}>Already have an account? <Link to="/login" style={styles.link}>Login</Link></p>
                </form>
            </div>
        </div>
    );
}

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f9fafb', padding: '2rem 0' },
    card: { backgroundColor: 'white', padding: '2rem 2.5rem', borderRadius: '0.75rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', maxWidth: '700px', width: '100%' },
    header: { textAlign: 'center', marginBottom: '1.5rem' },
    title: { fontSize: '1.875rem', fontWeight: 'bold', color: '#111827' },
    subtitle: { color: '#6b7280', marginTop: '0.5rem' },
    progressContainer: { width: '100%', backgroundColor: '#e5e7eb', borderRadius: '9999px', height: '24px', marginBottom: '2rem', overflow: 'hidden' },
    progressBar: { backgroundColor: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', transition: 'width 0.4s ease-in-out', borderRadius: '9999px' },
    formGroup: { marginBottom: '1.25rem' },
    label: { display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' },
    input: { display: 'block', width: '100%', padding: '0.65rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', boxSizing: 'border-box' },
    button: { width: '100%', padding: '0.75rem', borderRadius: '0.375rem', fontSize: '1rem', fontWeight: '500', color: 'white', backgroundColor: '#3b82f6', border: 'none', cursor: 'pointer', },
    buttonGroup: { display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '1.5rem' },
    secondaryButton: { flex: 1, padding: '0.75rem', borderRadius: '0.375rem', fontSize: '1rem', fontWeight: '500', color: '#374151', backgroundColor: '#e5e7eb', border: 'none', cursor: 'pointer' },
    skillsContainer: { border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem', maxHeight: '300px', overflowY: 'auto' },
    skillCategoryTitle: { fontSize: '1rem', fontWeight: '600', color: '#111827', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.5rem', marginBottom: '1rem' },
    skillGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.5rem' },
    checkboxWrapper: { display: 'flex', alignItems: 'center' },
    footerText: { marginTop: '2rem', textAlign: 'center', color: '#6b7280' },
    link: { color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }
};