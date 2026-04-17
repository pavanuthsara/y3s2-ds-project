const Contact = () => {
  return (
    <section className="simple-page contact-page" style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 1.5rem' }}>
      <h1 style={{ fontSize: '3.5rem', color: '#0f172a', marginBottom: '1.5rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
        Contact Us
      </h1>
      <p style={{ fontSize: '1.2rem', color: '#475569', marginBottom: '3.5rem', lineHeight: '1.6', maxWidth: '700px' }}>
        We're always here to assist you. Whether you're a patient experiencing a technical issue, looking for booking help, or a medical professional eager to join our extensive network, our support team is ready to respond.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
        
        <div style={{ padding: '2rem', border: '1px solid #e2e8f0', borderRadius: '16px', background: '#f8fafc', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <h3 style={{ fontSize: '1.4rem', color: '#0284c7', margin: '0 0 1.2rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>📍</span> Headquarters
          </h3>
          <p style={{ margin: '0 0 0.6rem 0', color: '#0f172a', fontWeight: '600', fontSize: '1.1rem' }}>CareConnect Health Tech Ltd.</p>
          <p style={{ margin: '0 0 0.4rem 0', color: '#475569' }}>120 Innovation Drive, Tech Park</p>
          <p style={{ margin: '0 0 0.4rem 0', color: '#475569' }}>Colombo 00300, Sri Lanka</p>
        </div>

        <div style={{ padding: '2rem', border: '1px solid #e2e8f0', borderRadius: '16px', background: '#f8fafc', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <h3 style={{ fontSize: '1.4rem', color: '#0284c7', margin: '0 0 1.2rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>📞</span> Reach Out
          </h3>
          <p style={{ margin: '0 0 0.8rem 0', color: '#475569', display: 'flex', justifyContent: 'space-between' }}>
            <strong style={{ color: '#0f172a' }}>Patient Support:</strong> <span>+94 11 234 5678</span>
          </p>
          <p style={{ margin: '0 0 0.8rem 0', color: '#475569', display: 'flex', justifyContent: 'space-between' }}>
            <strong style={{ color: '#0f172a' }}>Doctor Helpline:</strong> <span>+94 11 234 5679</span>
          </p>
          <p style={{ margin: '0 0 0.8rem 0', color: '#475569', display: 'flex', justifyContent: 'space-between' }}>
            <strong style={{ color: '#0f172a' }}>Email:</strong> <span style={{ color: '#0284c7' }}>support@careconnect.lk</span>
          </p>
        </div>

      </div>

      <div style={{ background: '#ffffff', padding: '2.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01)' }}>
        <h2 style={{ fontSize: '2rem', color: '#0f172a', margin: '0 0 2rem 0', fontWeight: '700' }}>Send us a Message</h2>
        <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <input type="text" placeholder="First Name" style={{ padding: '1rem', borderRadius: '12px', border: '1px solid #cbd5e1', width: '100%', boxSizing:'border-box', fontSize: '1rem', background: '#f8fafc', outline: 'none' }} />
            <input type="text" placeholder="Last Name" style={{ padding: '1rem', borderRadius: '12px', border: '1px solid #cbd5e1', width: '100%', boxSizing:'border-box', fontSize: '1rem', background: '#f8fafc', outline: 'none' }} />
          </div>
          <input type="email" placeholder="Email Address" style={{ padding: '1rem', borderRadius: '12px', border: '1px solid #cbd5e1', width: '100%', boxSizing:'border-box', fontSize: '1rem', background: '#f8fafc', outline: 'none' }} />
          <textarea placeholder="How can we help you?" rows="5" style={{ padding: '1rem', borderRadius: '12px', border: '1px solid #cbd5e1', width: '100%', boxSizing:'border-box', fontFamily: 'inherit', fontSize: '1rem', background: '#f8fafc', resize: 'vertical', outline: 'none' }}></textarea>
          <button type="button" style={{ background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)', color: 'white', border: 'none', padding: '1.2rem', borderRadius: '12px', fontSize: '1.1rem', fontWeight: '600', cursor: 'pointer', marginTop: '1rem', boxShadow: '0 4px 6px -1px rgba(14, 165, 233, 0.4)', transition: 'all 0.2s' }}>
            Submit Message
          </button>
        </form>
      </div>

    </section>
  );
};

export default Contact;
