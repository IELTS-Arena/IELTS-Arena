import React from 'react'

export default function LandingPage({ onStart }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Georgia, serif',
      padding: '20px'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '700px' }}>
        <div style={{ fontSize: '48px', marginBottom: '10px' }}>🎵</div>
        <h1 style={{
          fontSize: '48px',
          fontWeight: 'bold',
          color: 'white',
          marginBottom: '10px',
          letterSpacing: '-1px'
        }}>
          IELTS Groove
        </h1>
        <p style={{ fontSize: '20px', color: '#a0aec0', marginBottom: '8px' }}>
          AI-Powered IELTS Writing Practice
        </p>
        <p style={{ fontSize: '14px', color: '#4a9eff', marginBottom: '40px', fontStyle: 'italic' }}>
          Find Your Groove
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
          {[
            { icon: '✍️', title: 'Paraphrasing', desc: 'Master sentence rewriting for Band 7+' },
            { icon: '🤖', title: 'AI Feedback', desc: 'Instant band score and detailed feedback' },
            { icon: '📚', title: '15 Topics', desc: 'All IELTS Writing Task 2 categories' }
          ].map((feature, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '24px 16px'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>{feature.icon}</div>
              <div style={{ color: 'white', fontWeight: 'bold', marginBottom: '6px' }}>{feature.title}</div>
              <div style={{ color: '#a0aec0', fontSize: '13px' }}>{feature.desc}</div>
            </div>
          ))}
        </div>
        <button onClick={onStart} style={{
          background: 'linear-gradient(135deg, #1D9E75, #5DCAA5)',
          color: 'white',
          border: 'none',
          padding: '18px 48px',
          fontSize: '18px',
          fontWeight: 'bold',
          borderRadius: '50px',
          cursor: 'pointer',
          marginBottom: '16px',
          width: '100%',
          maxWidth: '320px'
        }}>
          Start Practicing Free →
        </button>
        <p style={{ color: '#718096', fontSize: '13px' }}>
          No signup required • 5 free attempts daily
        </p>
      </div>
    </div>
  )
}
