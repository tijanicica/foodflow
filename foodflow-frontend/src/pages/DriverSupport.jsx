// FAJL: src/pages/DriverSupport.jsx

import React from 'react';
import { NavbarDriver } from '../components/NavbarDriver'; // Prilagodite putanju
import { DriverFooter } from '../components/DriverFooter'; // Prilagodite putanju
import { HelpCircle, Phone, Mail } from 'lucide-react';

// Mala komponenta za FAQ stavke radi čistijeg koda
const FaqItem = ({ question, children }) => (
  <details style={{ border: '1px solid #EAEAEA', borderRadius: '8px', marginBottom: '1rem', backgroundColor: '#FDFDFD' }}>
    <summary style={{ padding: '1rem', fontWeight: '600', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      {question}
      <span className="faq-icon" style={{ transition: 'transform 0.2s' }}>+</span>
    </summary>
    <div style={{ padding: '0 1rem 1rem 1rem', borderTop: '1px solid #EAEAEA', color: '#6B7280' }}>
      {children}
    </div>
  </details>
);

export function DriverSupport() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#FFFBEB' }}>
      <NavbarDriver />
      <main style={{ flex: 1, padding: '2rem 5%' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#4A4A4A', marginBottom: '2rem', textAlign: 'center' }}>Support Center</h1>
          <p style={{ textAlign: 'center', color: '#6B7280', marginBottom: '3rem', fontSize: '1.1rem' }}>
            We're here to help. Find answers to common questions or get in touch with our support team.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem' }}>
            {/* FAQ Sekcija */}
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HelpCircle size={24} /> Frequently Asked Questions
              </h2>
              <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <FaqItem question="How and when do I get paid?">
                  <p>Payments are processed weekly every Tuesday. You will receive a direct deposit to the bank account you have on file. You can track your earnings in the "My Earnings" section.</p>
                </FaqItem>
                <FaqItem question="What happens if a customer is not available?">
                  <p>Follow the in-app instructions. You will be asked to try contacting the customer via phone. If you cannot reach them after a 5-minute timer, the app will guide you on how to proceed.</p>
                </FaqItem>
                <FaqItem question="How do I update my vehicle information?">
                  <p>You can update your vehicle information directly in your driver profile settings. Go to Profile > Vehicle Information and submit the new details.</p>
                </FaqItem>
              </div>
            </div>

            {/* Kontakt Sekcija */}
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Contact Us</h2>
              <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 'bold' }}>
                    <Phone size={20} color="#8A643B" /> Phone Support:
                  </p>
                  <p style={{ color: '#4A4A4A', marginTop: '0.25rem' }}>
                    <a href="tel:+123456789" style={{ color: 'inherit', textDecoration: 'none' }}>+1 (23) 456-789</a>
                  </p>
                </div>
                <div>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 'bold' }}>
                    <Mail size={20} color="#8A643B" /> Email Support:
                  </p>
                  <p style={{ color: '#4A4A4A', marginTop: '0.25rem' }}>
                    <a href="mailto:drivers@foodflow.com" style={{ color: 'inherit', textDecoration: 'none' }}>drivers@foodflow.com</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <DriverFooter />
    </div>
  );
}