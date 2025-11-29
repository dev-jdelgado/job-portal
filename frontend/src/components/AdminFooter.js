import React from 'react';

export default function AdminFooter() {
  return (
    <footer
      style={{
        backgroundColor: '#f0f0f0',
        padding: '1rem 0',
        textAlign: 'center',
        borderTop: '1px solid #ccc',
        marginTop: 'auto',
      }}
    >
      <p style={{ margin: 0, fontSize: '0.9rem', color: '#444' }}>
        Admin Panel © {new Date().getFullYear()} SkillLink |{' '}
        <a href="/admin/privacy-policy" style={{ color: '#007bff', textDecoration: 'none' }}>
          Terms and Conditions
        </a>
      </p>
    </footer>
  );
}
