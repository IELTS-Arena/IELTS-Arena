import { useState } from 'react'

const TOPICS = [
  'Education', 'Technology', 'Environment', 'Health', 'Society',
  'Economy', 'Government', 'Crime', 'Media', 'Transport',
  'Family', 'Culture', 'Work', 'Globalisation', 'Housing'
]

const DAILY_LIMIT = 5

function getDailyCount() {
  const today = new Date().toDateString()
  const stored = JSON.parse(localStorage.getItem('ieltsgroove_usage') || '{}')
  if (stored.date !== today) return 0
  return stored.count || 0
}

function incrementDailyCount() {
  const today = new Date().toDateString()
  const stored = JSON.parse(localStorage.getItem('ieltsgroove_usage') || '{}')
  const count = stored.date === today ? (stored.count || 0) + 1 : 1
  localStorage.setItem('ieltsgroove_usage', JSON.stringify({ date: today, count }))
  return count
}

export default function ParaphrasingApp({ onBack }) {
  const [topic, setTopic] = useState('Education')
  const [sentence, setSentence] = useState('')
  const [userAnswer, setUserAnswer] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [loading, setLoading] = useState(false)
  const [dailyCount, setDailyCount] = useState(getDailyCount())

  async function callClaude(prompt) {
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    })
    const data = await response.json()
    return data.content[0].text
  }

  async function generateSentence() {
    if (dailyCount >= DAILY_LIMIT) return
    setLoading(true)
    setFeedback(null)
    setUserAnswer('')
    setSentence('')
    try {
      const result = await callClaude(`Generate one simple IELTS Writing Task 2 sentence about ${topic}. Band 5-6 level. Return ONLY the sentence.`)
      setSentence(result.trim())
    } catch (e) {
      setFeedback({ error: 'Failed to generate. Please try again.' })
    }
    setLoading(false)
  }

  async function checkAnswer() {
    if (!userAnswer.trim() || dailyCount >= DAILY_LIMIT) return
    setLoading(true)
    const newCount = incrementDailyCount()
    setDailyCount(newCount)
    try {
      const result = await callClaude(`You are an IELTS examiner.
Original sentence: "${sentence}"
Student paraphrase: "${userAnswer}"

Respond in this exact JSON format:
{
  "band": 6.5,
  "vocabulary": "feedback on word choice",
  "structure": "feedback on sentence structure",
  "overall": "one sentence overall feedback",
  "improved": "your improved version"
}`)
      const jsonMatch = result.match(/\{[\s\S]*\}/)
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : result)
      setFeedback(parsed)
    } catch (e) {
      setFeedback({ error: 'Failed to get feedback. Please try again.' })
    }
    setLoading(false)
  }

  const attemptsLeft = DAILY_LIMIT - dailyCount

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', fontFamily: 'Georgia, serif', padding: '20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        <button onClick={onBack} style={{
          background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
          color: '#a0aec0', padding: '8px 16px', borderRadius: '8px',
          cursor: 'pointer', fontSize: '13px', marginBottom: '16px'
        }}>← Back</button>

        <div style={{ textAlign: 'center', padding: '20px 0 20px' }}>
          <h1 style={{ color: 'white', fontSize: '32px', margin: '0' }}>📝 IELTS Groove</h1>
          <p style={{ color: '#4a9eff', fontSize: '14px', margin: '4px 0' }}>Paraphrasing Practice</p>
          <p style={{ color: attemptsLeft <= 1 ? '#fc8181' : '#68d391', fontSize: '13px' }}>
            {attemptsLeft} free attempts remaining today
          </p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ color: '#a0aec0', fontSize: '13px', display: 'block', marginBottom: '8px' }}>SELECT TOPIC</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {TOPICS.map(t => (
              <button key={t} onClick={() => setTopic(t)} style={{
                padding: '6px 14px', borderRadius: '20px', border: '1px solid',
                borderColor: topic === t ? '#4a9eff' : 'rgba(255,255,255,0.2)',
                background: topic === t ? 'rgba(74,158,255,0.2)' : 'transparent',
                color: topic === t ? '#4a9eff' : '#a0aec0', cursor: 'pointer', fontSize: '13px'
              }}>{t}</button>
            ))}
          </div>
        </div>

        <button onClick={generateSentence} disabled={loading || dailyCount >= DAILY_LIMIT} style={{
          width: '100%', padding: '14px',
          background: 'linear-gradient(135deg, #1D9E75, #5DCAA5)',
          color: 'white', border: 'none', borderRadius: '10px',
          fontSize: '16px', fontWeight: 'bold', cursor: loading ? 'wait' : 'pointer',
          marginBottom: '20px', opacity: dailyCount >= DAILY_LIMIT ? 0.5 : 1
        }}>
          {loading ? 'Generating...' : '📝 Generate Sentence'}
        </button>

        {sentence && (
          <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
            <p style={{ color: '#a0aec0', fontSize: '12px', marginBottom: '8px' }}>ORIGINAL SENTENCE</p>
            <p style={{ color: 'white', fontSize: '16px', lineHeight: '1.6', margin: 0 }}>{sentence}</p>
          </div>
        )}

        {sentence && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: '#a0aec0', fontSize: '13px', display: 'block', marginBottom: '8px' }}>YOUR PARAPHRASE</label>
            <textarea value={userAnswer} onChange={e => setUserAnswer(e.target.value)}
              placeholder="Rewrite the sentence using different words and structure..."
              style={{ width: '100%', minHeight: '100px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', padding: '14px', color: 'white', fontSize: '15px', resize: 'vertical', boxSizing: 'border-box' }}
            />
            <button onClick={checkAnswer} disabled={loading || !userAnswer.trim()} style={{
              marginTop: '10px', padding: '12px 32px',
              background: 'linear-gradient(135deg, #68d3d1, #38a169)',
              color: 'white', border: 'none', borderRadius: '8px',
              fontSize: '15px', fontWeight: 'bold', cursor: 'pointer'
            }}>
              {loading ? 'Checking...' : '✅ Check My Answer'}
            </button>
          </div>
        )}

        {feedback && !feedback.error && (
          <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(74,158,255,0.3)', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '48px', fontWeight: 'bold', color: '#4a9eff' }}>Band {feedback.band}</span>
            </div>
            {[
              { label: '📝 Vocabulary', value: feedback.vocabulary },
              { label: '🔠 Structure', value: feedback.structure },
              { label: '💬 Overall', value: feedback.overall },
              { label: '✨ Improved Version', value: feedback.improved }
            ].map((item, i) => (
              <div key={i} style={{ marginBottom: '16px' }}>
                <p style={{ color: '#4a9eff', fontSize: '13px', margin: '0 0 4px' }}>{item.label}</p>
                <p style={{ color: 'white', fontSize: '14px', margin: 0, lineHeight: '1.6' }}>{item.value}</p>
              </div>
            ))}
          </div>
        )}

        {feedback?.error && (
          <div style={{ background: 'rgba(252,129,129,0.1)', border: '1px solid rgba(252,129,129,0.3)', borderRadius: '8px', padding: '16px', color: '#fc8181' }}>
            {feedback.error}
          </div>
        )}

        {dailyCount >= DAILY_LIMIT && (
          <div style={{ textAlign: 'center', padding: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', color: '#a0aec0' }}>
            <p style={{ fontSize: '20px' }}>🎵 Daily limit reached</p>
            <p>Come back tomorrow for 5 more free attempts!</p>
          </div>
        )}

      </div>
    </div>
  )
}
