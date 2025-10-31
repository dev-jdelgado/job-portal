import React from 'react';

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: '#f8f9fa',
        padding: '1rem 0',
        textAlign: 'center',
        borderTop: '1px solid #eaeaea',
        marginTop: 'auto',
      }}
    >
      <p style={{ margin: 0, fontSize: '0.9rem', color: '#555' }}>
        © {new Date().getFullYear()} SkillLink |{' '}
        <a href="/privacy-policy" style={{ color: '#007bff', textDecoration: 'none' }}>
          Privacy Policy
        </a>
      </p>
    </footer>
  );
}