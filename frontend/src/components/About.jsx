const About = () => {
  return (
    <section className="simple-page about-page" style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 1.5rem' }}>
      <h1 style={{ fontSize: '3.5rem', color: '#0f172a', marginBottom: '1.5rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
        About CareConnect
      </h1>
      
      <div style={{ lineHeight: '1.8', color: '#475569', fontSize: '1.15rem' }}>
        <p style={{ marginBottom: '1.5rem' }}>
          Welcome to <strong>CareConnect</strong>, the next-generation cloud-native healthcare platform designed to seamlessly bridge the gap between patients and top-tier medical professionals. 
          Founded with a vision to revolutionize digital health, we aim to make high-quality healthcare accessible, highly efficient, and affordable for everyone, perfectly mirroring the convenience of telemedicine giants.
        </p>
        
        <h2 style={{ fontSize: '2rem', color: '#0284c7', marginTop: '3rem', marginBottom: '1.2rem', fontWeight: '700' }}>Our Mission</h2>
        <p style={{ marginBottom: '1.5rem' }}>
          Our mission is to empower individuals to take immediate control of their health by providing seamless digital access to Smart Booking engines, Virtual Clinics, intuitive AI preliminary diagnostics, and secure Medical Vaults. We believe that geographical distance and tight schedules should never be a barrier to getting the exceptional medical care you deserve.
        </p>

        <h2 style={{ fontSize: '2rem', color: '#0284c7', marginTop: '3rem', marginBottom: '1.2rem', fontWeight: '700' }}>Why Choose Us?</h2>
        <ul style={{ paddingLeft: '1.5rem', marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <li><strong style={{ color: '#0f172a' }}>Verified Specialists:</strong> Access a robust network of thousands of board-certified doctors mapped across 50+ medical specialties.</li>
          <li><strong style={{ color: '#0f172a' }}>Bank-Grade Security:</strong> Your Medical Vault and crystal-clear virtual consultations are protected with state-of-the-art end-to-end encryption to preserve absolute privacy.</li>
          <li><strong style={{ color: '#0f172a' }}>AI-Powered Insights:</strong> Leverage innovative machine learning models to help you proactively understand symptoms and receive suggestions before ever stepping foot into a clinic.</li>
        </ul>
        
        <div style={{ background: '#f8fafc', borderLeft: '4px solid #0284c7', padding: '2rem', borderRadius: '0 12px 12px 0', marginTop: '2.5rem' }}>
          <h3 style={{ margin: '0 0 0.8rem 0', color: '#0f172a', fontSize: '1.4rem' }}>"Healthcare Reimagined"</h3>
          <p style={{ margin: 0, fontStyle: 'italic', color: '#334155' }}>
            Whether you need a quick prescription renewal, an in-depth specialist block booking, or a thorough second opinion, CareConnect is always with you in your pocket.
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;
