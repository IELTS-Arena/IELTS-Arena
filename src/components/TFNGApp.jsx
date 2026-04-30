import { useState } from 'react'

const DAILY_LIMIT = 5

function getDailyCount() {
  const today = new Date().toDateString()
  const stored = JSON.parse(localStorage.getItem('ieltsgroove_tfng_usage') || '{}')
  if (stored.date !== today) return 0
  return stored.count || 0
}

function incrementDailyCount() {
  const today = new Date().toDateString()
  const stored = JSON.parse(localStorage.getItem('ieltsgroove_tfng_usage') || '{}')
  const count = stored.date === today ? (stored.count || 0) + 1 : 1
  localStorage.setItem('ieltsgroove_tfng_usage', JSON.stringify({ date: today, count }))
  return count
}

function highlightPassage(passage, sentence) {
  if (!sentence) return <span>{passage}</span>
  const idx = passage.indexOf(sentence)
  if (idx === -1) return <span>{passage}</span>
  return (
    <>
      <span>{passage.slice(0, idx)}</span>
      <span style={{
        background: 'rgba(29,158,117,0.25)',
        borderBottom: '2px solid #1D9E75',
        borderRadius: '3px',
        padding: '1px 2px',
        color: '#5DCAA5'
      }}>{passage.slice(idx, idx + sentence.length)}</span>
      <span>{passage.slice(idx + sentence.length)}</span>
    </>
  )
}

export default function TFNGApp({ onBack }) {
  const [dailyCount, setDailyCount] = useState(getDailyCount())
  const [loading, setLoading] = useState(false)
  const [passageData, setPassageData] = useState(null)
  const [answers, setAnswers] = useState({})
  const [showResults, setShowResults] = useState({})
  const [score, setScore] = useState({ correct: 0, wrong: 0, total: 0 })
  const [allAnswered, setAllAnswered] = useState(false)
  const [usedTopics, setUsedTopics] = useState([])
  const [highlightedSentence, setHighlightedSentence] = useState(null)

  const attemptsLeft = DAILY_LIMIT - dailyCount

  async function generatePassage() {
    if (dailyCount >= DAILY_LIMIT) return
    setLoading(true)
    setPassageData(null)
    setAnswers({})
    setShowResults({})
    setAllAnswered(false)
    setHighlightedSentence(null)

    const avoidTopics = usedTopics.length > 0
      ? `Do NOT use any of these topics: ${usedTopics.join(', ')}.`
      : ''

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1500,
          messages: [{
            role: 'user',
            content: `You are an IELTS Academic Reading expert. Generate a short academic reading passage (5-7 sentences) on a factual topic (science, environment, history, technology, health, or social trends). ${avoidTopics}

Then provide exactly 4 True/False/Not Given questions based on that passage.

Rules:
- TRUE: the statement agrees with the passage
- FALSE: the statement contradicts the passage
- NOT GIVEN: the information is not in the passage
Include a mix: at least 1 True, 1 False, 1 Not Given.

For TRUE and FALSE answers, provide the exact sentence from the passage that proves the answer (copy it word for word). For NOT GIVEN, set relevantSentence to null.

Respond ONLY with valid JSON, no markdown, no backticks:
{
  "topic": "short topic title",
  "passage": "the passage text here",
  "questions": [
    {
      "statement": "the statement to classify",
      "answer": "TRUE",
      "explanation": "Brief explanation why this is TRUE/FALSE/NOT GIVEN referencing the passage",
      "relevantSentence": "exact sentence from passage that proves the answer, or null for NOT GIVEN"
    }
  ]
}`
          }]
        })
      })

      const data = await response.json()
      const text = data.content[0].text.trim()
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text)
      setPassageData(parsed)
      setUsedTopics(prev => [...prev, parsed.topic])
      const newCount = incrementDailyCount()
      setDailyCount(newCount)
    } catch (e) {
      console.error(e)
    }

    setLoading(false)
  }

  function handleAnswer(idx, choice) {
    if (answers[idx] !== undefined) return
    const newAnswers = { ...answers, [idx]: choice }
    const newResults = { ...showResults, [idx]: true }
    setAnswers(newAnswers)
    setShowResults(newResults)

    const q = passageData.questions[idx]
    const correct = choice === q.answer

    if (q.relevantSentence) {
      setHighlightedSentence(q.relevantSentence)
    }

    setScore(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      wrong: prev.wrong + (correct ? 0 : 1),
      total: prev.total + 1
    }))

    if (Object.keys(newAnswers).length === passageData.questions.length) {
      setAllAnswered(true)
    }
  }

  const btnStyle = (idx, choice) => {
    const selected = answers[idx] === choice
    const revealed = showResults[idx]
    const correct = passageData?.questions[idx]?.answer === choice

    let bg = 'transparent'
    let borderColor = 'rgba(255,255,255,0.2)'
    let color = '#a0aec0'

    if (revealed && selected) {
      if (correct) { bg = 'rgba(29,158,117,0.2)'; borderColor = '#1D9E75'; color = '#5DCAA5' }
      else { bg = 'rgba(252,129,129,0.15)'; borderColor = '#fc8181'; color = '#fc8181' }
    } else if (revealed && correct) {
      bg = 'rgba(29,158,117,0.1)'; borderColor = '#1D9E75'; color = '#5DCAA5'
    }

    return {
      padding: '8px 18px', borderRadius: '20px',
      border: `1px solid ${borderColor}`,
      background: bg, color, cursor: answers[idx] !== undefined ? 'default' : 'pointer',
      fontSize: '13px', fontWeight: '500', transition: 'all 0.2s'
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', fontFamily: 'Georgia, serif', padding: '20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        <button onClick={onBack} style={{
          background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
          color: '#a0aec0', padding: '8px 16px', borderRadius: '8px',
          cursor: 'pointer', fontSize: '13px', marginBottom: '16px'
        }}>← Back</button>

        <div style={{ textAlign: 'center', padding: '20px 0 20px' }}>
          <h1 style={{ color: 'white', fontSize: '32px', margin: '0' }}>📖 IELTS Groove</h1>
          <p style={{ color: '#4a9eff', fontSize: '14px', margin: '4px 0' }}>True / False / Not Given Practice</p>
          <p style={{ color: attemptsLeft <= 1 ? '#fc8181' : '#68d391', fontSize: '13px' }}>
            {attemptsLeft} free attempts remaining today
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Correct', value: score.correct, color: '#68d391' },
            { label: 'Wrong', value: score.wrong, color: '#fc8181' },
            { label: 'Answered', value: score.total, color: '#4a9eff' }
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: '#718096', marginTop: '2px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <button onClick={generatePassage} disabled={loading || dailyCount >= DAILY_LIMIT} style={{
          width: '100%', padding: '14px',
          background: 'linear-gradient(135deg, #185FA5, #378ADD)',
          color: 'white', border: 'none', borderRadius: '10px',
          fontSize: '16px', fontWeight: 'bold', cursor: loading ? 'wait' : 'pointer',
          marginBottom: '24px', opacity: dailyCount >= DAILY_LIMIT ? 0.5 : 1
        }}>
          {loading ? 'Generating passage...' : passageData ? '📖 New Passage' : '📖 Generate Passage'}
        </button>

        {passageData && (
          <>
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(74,158,255,0.2)', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
              <p style={{ color: '#4a9eff', fontSize: '11px', letterSpacing: '0.08em', margin: '0 0 12px' }}>
                READING PASSAGE — {passageData.topic.toUpperCase()}
              </p>
              {highlightedSentence && (
                <p style={{ color: '#5DCAA5', fontSize: '11px', margin: '0 0 10px', letterSpacing: '0.04em' }}>
                  ↳ Highlighted sentence is the key evidence
                </p>
              )}
              <p style={{ color: 'white', fontSize: '15px', lineHeight: '1.8', margin: 0 }}>
                {highlightPassage(passageData.passage, highlightedSentence)}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              {passageData.questions.map((q, idx) => (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '20px' }}>
                  <p style={{ color: '#718096', fontSize: '11px', letterSpacing: '0.06em', margin: '0 0 8px' }}>
                    STATEMENT {idx + 1}
                  </p>
                  <p style={{ color: 'white', fontSize: '14px', lineHeight: '1.6', margin: '0 0 16px' }}>
                    {q.statement}
                  </p>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {['TRUE', 'FALSE', 'NOT GIVEN'].map(choice => (
                      <button key={choice} onClick={() => handleAnswer(idx, choice)} style={btnStyle(idx, choice)}>
                        {choice === 'NOT GIVEN' ? 'Not Given' : choice.charAt(0) + choice.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                  {showResults[idx] && (
                    <div style={{
                      marginTop: '14px', padding: '12px 14px', borderRadius: '8px',
                      background: answers[idx] === q.answer ? 'rgba(29,158,117,0.1)' : 'rgba(252,129,129,0.1)',
                      border: `1px solid ${answers[idx] === q.answer ? 'rgba(29,158,117,0.3)' : 'rgba(252,129,129,0.3)'}`,
                      fontSize: '13px', lineHeight: '1.6',
                      color: answers[idx] === q.answer ? '#68d391' : '#fc8181'
                    }}>
                      {answers[idx] === q.answer ? '✓ Correct. ' : `✗ Incorrect — the answer is ${q.answer}. `}
                      <span style={{ color: '#a0aec0' }}>{q.explanation}</span>
                      {q.relevantSentence && (
                        <div style={{ marginTop: '8px', color: '#5DCAA5', fontSize: '12px' }}>
                          ↑ See highlighted sentence in the passage above
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {allAnswered && (
              <div style={{ textAlign: 'center', padding: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '24px' }}>
                <p style={{ color: 'white', fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px' }}>
                  {score.correct}/{passageData.questions.length} correct
                </p>
                <p style={{ color: '#a0aec0', fontSize: '14px', margin: 0 }}>
                  {attemptsLeft > 0 ? 'Try another passage to keep practising.' : 'Daily limit reached. Come back tomorrow!'}
                </p>
              </div>
            )}
          </>
        )}

        {dailyCount >= DAILY_LIMIT && !passageData && (
          <div style={{ textAlign: 'center', padding: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', color: '#a0aec0' }}>
            <p style={{ fontSize: '20px' }}>🎵 Daily limit reached</p>
            <p>Come back tomorrow for 5 more free attempts!</p>
          </div>
        )}

      </div>
    </div>
  )
}
