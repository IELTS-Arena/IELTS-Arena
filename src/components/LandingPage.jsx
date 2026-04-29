import React from 'react'

export default function LandingPage({ onStartParaphrasing, onStartTFNG }) {
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
      <div style={{ textAlign: 'center', maxWidth: '700px', width: '100%' }}>
        <div style={{ fontSize: '48px', marginBottom: '10px' }}>📝</div>
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
          AI-Powered IELTS Practice Tools
        </p>
        <p style={{ fontSize: '14px', color: '#4a9eff', marginBottom: '48px', fontStyle: 'italic' }}>
          Find Your Groove
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>

          {/* Paraphrasing Tool */}
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(29,158,117,0.4)',
            borderRadius: '16px',
            padding: '32px 24px',
            textAlign: 'left'
          }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>✍️</div>
            <h2 style={{ color: 'white', fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', margin: '0 0 8px' }}>
              Paraphrasing Practice
            </h2>
            <p style={{ color: '#a0aec0', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' }}>
              Rewrite IELTS Writing Task 2 sentences and get instant AI band score feedback. Build vocabulary and sentence variety for Band 7+.
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
              {['15 Topics', 'Band Scoring', 'AI Feedback'].map(tag => (
                <span key={tag} style={{
                  fontSize: '11px', padding: '3px 10px',
                  background: 'rgba(29,158,117,0.15)',
                  border: '1px solid rgba(29,158,117,0.3)',
                  borderRadius: '20px', color: '#5DCAA5'
                }}>{tag}</span>
              ))}
            </div>
            <button onClick={onStartParaphrasing} style={{
              width: '100%',
              background: 'linear-gradient(135deg, #1D9E75, #5DCAA5)',
              color: 'white', border: 'none', padding: '14px',
              fontSize: '15px', fontWeight: 'bold', borderRadius: '10px', cursor: 'pointer'
            }}>
              Start Practising →
            </button>
          </div>

          {/* TFNG Tool */}
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(74,158,255,0.4)',
            borderRadius: '16px',
            padding: '32px 24px',
            textAlign: 'left'
          }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>📖</div>
            <h2 style={{ color: 'white', fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px' }}>
              True / False / Not Given
            </h2>
            <p style={{ color: '#a0aec0', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' }}>
              Practise the most challenging IELTS Academic Reading question type. Read a passage and classify statements with instant explanations.
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
              {['Academic Texts', 'Explanations', 'AI Generated'].map(tag => (
                <span key={tag} style={{
                  fontSize: '11px', padding: '3px 10px',
                  background: 'rgba(74,158,255,0.15)',
                  border: '1px solid rgba(74,158,255,0.3)',
                  borderRadius: '20px', color: '#4a9eff'
                }}>{tag}</span>
              ))}
            </div>
            <button onClick={onStartTFNG} style={{
              width: '100%',
              background: 'linear-gradient(135deg, #185FA5, #378ADD)',
              color: 'white', border: 'none', padding: '14px',
              fontSize: '15px', fontWeight: 'bold', borderRadius: '10px', cursor: 'pointer'
            }}>
              Start Practising →
            </button>
          </div>

        </div>

        <p style={{ color: '#718096', fontSize: '13px' }}>
          No signup required • 5 free attempts daily per tool
        </p>
      </div>
    </div>
  )
}
