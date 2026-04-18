import React from 'react';
import { Link } from 'react-router-dom';
import './HealthLanding.css';

const HealthLanding = () => {
  return (
    <div className="hl-container">
      <div className="hl-bg-glow1"></div>
      <div className="hl-bg-glow2"></div>
      
      <div className="hl-content">
        <header className="hl-nav">
          <div className="hl-brand">
            <span className="hl-logo-icon">✨</span>
            CareConnect
          </div>
        </header>

        <section className="hl-hero">
          <div className="hl-badge">🚀 Next-Generation Telemedicine</div>
          <h1 className="hl-title">
            Healthcare, <br />
            <span className="hl-title-hl">Reimagined for You</span>
          </h1>
          <p className="hl-subtitle">
            Experience the future of healthcare with CareConnect. Book appointments with top doctors, 
            attend ultra-HD virtual consultations, securely upload your medical reports, 
            and receive intelligent AI-powered preliminary health suggestions.
          </p>
          <Link to="/patient" className="hl-cta">Enter Patient Portal</Link>
        </section>

        <section className="hl-features">
          <div className="hl-card">
            <div className="hl-card-icon">📅</div>
            <h3 className="hl-card-title">Smart Booking</h3>
            <p className="hl-card-desc">Instantly schedule appointments with top-rated specialists using our seamless real-time booking engine.</p>
          </div>
          
          <div className="hl-card">
            <div className="hl-card-icon">📹</div>
            <h3 className="hl-card-title">Virtual Clinics</h3>
            <p className="hl-card-desc">Crystal-clear, secure video consultations from the comfort of your own home. Private and confidential.</p>
          </div>
          
          <div className="hl-card">
            <div className="hl-card-icon">🧠</div>
            <h3 className="hl-card-title">AI Diagnostics</h3>
            <p className="hl-card-desc">Get cutting-edge preliminary health insights and condition analysis powered by advanced AI prediction models.</p>
          </div>

          <div className="hl-card">
            <div className="hl-card-icon">🛡️</div>
            <h3 className="hl-card-title">Medical Vault</h3>
            <p className="hl-card-desc">A highly secure central repository to upload, store, and instantly share your medical reports and test results.</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HealthLanding;
