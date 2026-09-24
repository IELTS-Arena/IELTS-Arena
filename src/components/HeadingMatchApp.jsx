import { useState, useEffect } from "react";

const DAILY_LIMIT = 5;
const STORAGE_KEY = "headingMatch_attempts";

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

function getAttemptsToday() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return stored[getTodayKey()] || 0;
  } catch {
    return 0;
  }
}

function incrementAttempts() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    const today = getTodayKey();
    stored[today] = (stored[today] || 0) + 1;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {}
}

export default function HeadingMatchApp() {
  const [attemptsLeft, setAttemptsLeft] = useState(DAILY_LIMIT - getAttemptsToday());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exercise, setExercise] = useState(null);
  const [selections, setSelections] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const generateExercise = async () => {
    if (attemptsLeft <= 0) return;

    setLoading(true);
    setError("");
    setExercise(null);
    setSelections({});
    setSubmitted(false);

    const prompt = `Generate an IELTS Academic Reading heading matching exercise. 

Return ONLY a valid JSON object with this exact structure:
{
  "topic": "short topic name",
  "paragraphs": [
    {"id": "A", "text": "paragraph text here (4-6 sentences, academic style)"},
    {"id": "B", "text": "paragraph text here (4-6 sentences, academic style)"},
    {"id": "C", "text": "paragraph text here (4-6 sentences, academic style)"}
  ],
  "headings": [
    {"id": 1, "text": "heading text"},
    {"id": 2, "text": "heading text"},
    {"id": 3, "text": "heading text"},
    {"id": 4, "text": "heading text (distractor)"},
    {"id": 5, "text": "heading text (distractor)"}
  ],
  "answers": {
    "A": 2,
    "B": 5,
    "C": 1
  },
  "explanations": {
    "A": "Brief explanation of why this heading matches paragraph A",
    "B": "Brief explanation of why this heading matches paragraph B",
    "C": "Brief explanation of why this heading matches paragraph C"
  }
}

Rules:
- Paragraphs must be genuine academic IELTS-level content on a single topic (science, environment, technology, society, history, etc.)
- Each paragraph should have one clear main idea
- Headings should paraphrase the main idea, not copy words directly from the paragraph
- Distractors should sound plausible but not match any paragraph
- Do not include any text outside the JSON object`;

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1500,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await response.json();
      const raw = data.content?.[0]?.text || "";
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Invalid response format");
      const parsed = JSON.parse(jsonMatch[0]);
      setExercise(parsed);
      incrementAttempts();
      setAttemptsLeft((prev) => prev - 1);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (paragraphId, headingId) => {
    if (submitted) return;
    setSelections((prev) => ({ ...prev, [paragraphId]: parseInt(headingId) }));
  };

  const handleSubmit = () => {
    if (Object.keys(selections).length < 3) {
      setError("Please match all three paragraphs before submitting.");
      return;
    }
    setError("");
    setSubmitted(true);
  };

  const getResult = (paragraphId) => {
    if (!submitted || !exercise) return null;
    const correct = exercise.answers[paragraphId];
    const selected = selections[paragraphId];
    return selected === correct ? "correct" : "incorrect";
  };

  const score = submitted && exercise
    ? Object.keys(exercise.answers).filter(
        (id) => selections[id] === exercise.answers[id]
      ).length
    : 0;

  return (
    <div style={{ minHeight: "100vh", background: "#f0faf6", fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#1D9E75", padding: "16px 24px", display: "flex", alignItems: "center", gap: "12px" }}>
        <button
          onClick={() => window.history.back()}
          style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", fontSize: "14px" }}
        >
          ← Back
        </button>
        <div>
          <div style={{ color: "#fff", fontWeight: "700", fontSize: "18px" }}>Heading Matching</div>
          <div style={{ color: "#a8e6cf", fontSize: "12px" }}>IELTS Academic Reading Practice</div>
        </div>
        <div style={{ marginLeft: "auto", background: "rgba(255,255,255,0.15)", borderRadius: "8px", padding: "6px 12px", color: "#fff", fontSize: "13px" }}>
          {attemptsLeft} / {DAILY_LIMIT} left today
        </div>
      </div>

      <div style={{ maxWidth: "780px", margin: "0 auto", padding: "24px 16px" }}>

        {/* Intro card */}
        {!exercise && !loading && (
          <div style={{ background: "#fff", borderRadius: "16px", padding: "32px", textAlign: "center", boxShadow: "0 2px 12px rgba(29,158,117,0.08)", marginBottom: "24px" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>📑</div>
            <h2 style={{ color: "#1D9E75", margin: "0 0 8px", fontSize: "22px" }}>Match the Headings</h2>
            <p style={{ color: "#555", margin: "0 0 8px", lineHeight: "1.6" }}>
              Read 3 short academic paragraphs and match each one to the correct heading from a list of 5.
            </p>
            <p style={{ color: "#888", margin: "0 0 24px", fontSize: "13px" }}>
              Two headings are distractors — they won't match any paragraph.
            </p>
            {attemptsLeft > 0 ? (
              <button
                onClick={generateExercise}
                style={{ background: "#1D9E75", color: "#fff", border: "none", borderRadius: "10px", padding: "14px 32px", fontSize: "16px", fontWeight: "600", cursor: "pointer" }}
              >
                Generate Exercise
              </button>
            ) : (
              <div style={{ background: "#fff3cd", borderRadius: "10px", padding: "16px", color: "#856404", fontSize: "14px" }}>
                You've used all 5 attempts for today. Come back tomorrow to practice more!
              </div>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ background: "#fff", borderRadius: "16px", padding: "48px", textAlign: "center", boxShadow: "0 2px 12px rgba(29,158,117,0.08)" }}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>⏳</div>
            <div style={{ color: "#1D9E75", fontWeight: "600" }}>Generating your exercise...</div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background: "#fff0f0", border: "1px solid #ffcccc", borderRadius: "10px", padding: "12px 16px", color: "#cc0000", marginBottom: "16px", fontSize: "14px" }}>
            {error}
          </div>
        )}

        {/* Exercise */}
        {exercise && !loading && (
          <>
            {/* Score banner */}
            {submitted && (
              <div style={{
                background: score === 3 ? "#e6f9f0" : score === 2 ? "#fff8e6" : "#fff0f0",
                border: `1px solid ${score === 3 ? "#1D9E75" : score === 2 ? "#f0a500" : "#e05c5c"}`,
                borderRadius: "12px", padding: "16px 20px", marginBottom: "20px",
                display: "flex", alignItems: "center", gap: "12px"
              }}>
                <div style={{ fontSize: "28px" }}>{score === 3 ? "🎉" : score === 2 ? "👍" : "📚"}</div>
                <div>
                  <div style={{ fontWeight: "700", fontSize: "17px", color: "#222" }}>
                    {score} out of 3 correct
                  </div>
                  <div style={{ color: "#555", fontSize: "13px", marginTop: "2px" }}>
                    {score === 3 ? "Excellent! All headings matched correctly." : score === 2 ? "Good effort — check the explanations below." : "Review the explanations and try again."}
                  </div>
                </div>
              </div>
            )}

            {/* Headings list */}
            <div style={{ background: "#fff", borderRadius: "14px", padding: "20px 24px", marginBottom: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <div style={{ fontWeight: "700", color: "#1D9E75", marginBottom: "12px", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                List of Headings
              </div>
              {exercise.headings.map((h) => (
                <div key={h.id} style={{ padding: "8px 0", borderBottom: "1px solid #f0f0f0", color: "#333", fontSize: "15px", display: "flex", gap: "10px" }}>
                  <span style={{ color: "#1D9E75", fontWeight: "700", minWidth: "22px" }}>{h.id}.</span>
                  <span>{h.text}</span>
                </div>
              ))}
            </div>

            {/* Paragraphs */}
            {exercise.paragraphs.map((para) => {
              const result = getResult(para.id);
              return (
                <div key={para.id} style={{
                  background: "#fff",
                  borderRadius: "14px",
                  padding: "20px 24px",
                  marginBottom: "16px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  border: submitted ? `2px solid ${result === "correct" ? "#1D9E75" : "#e05c5c"}` : "2px solid transparent"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <div style={{ background: "#1D9E75", color: "#fff", borderRadius: "8px", padding: "4px 12px", fontWeight: "700", fontSize: "15px" }}>
                      Paragraph {para.id}
                    </div>
                    {submitted && (
                      <span style={{ fontSize: "20px" }}>{result === "correct" ? "✅" : "❌"}</span>
                    )}
                  </div>

                  <p style={{ color: "#333", lineHeight: "1.75", fontSize: "15px", margin: "0 0 16px" }}>
                    {para.text}
                  </p>

                  {/* Dropdown */}
                  <div>
                    <label style={{ fontSize: "13px", color: "#888", display: "block", marginBottom: "6px" }}>
                      Select heading for Paragraph {para.id}:
                    </label>
                    <select
                      value={selections[para.id] || ""}
                      onChange={(e) => handleSelect(para.id, e.target.value)}
                      disabled={submitted}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: "1.5px solid #d0ece6",
                        fontSize: "14px",
                        color: selections[para.id] ? "#222" : "#aaa",
                        background: submitted ? "#f9f9f9" : "#fff",
                        cursor: submitted ? "not-allowed" : "pointer"
                      }}
                    >
                      <option value="" disabled>— Choose a heading —</option>
                      {exercise.headings.map((h) => (
                        <option key={h.id} value={h.id}>{h.id}. {h.text}</option>
                      ))}
                    </select>
                  </div>

                  {/* Explanation after submit */}
                  {submitted && (
                    <div style={{
                      marginTop: "14px",
                      background: result === "correct" ? "#e6f9f0" : "#fff5f5",
                      borderRadius: "8px",
                      padding: "12px 14px",
                      fontSize: "14px",
                      color: "#333",
                      lineHeight: "1.6"
                    }}>
                      <strong style={{ color: result === "correct" ? "#1D9E75" : "#e05c5c" }}>
                        {result === "correct" ? "Correct" : `Incorrect — correct answer: Heading ${exercise.answers[para.id]}`}
                      </strong>
                      <br />
                      {exercise.explanations[para.id]}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Submit / Try Again */}
            <div style={{ textAlign: "center", marginTop: "8px" }}>
              {!submitted ? (
                <button
                  onClick={handleSubmit}
                  style={{ background: "#1D9E75", color: "#fff", border: "none", borderRadius: "10px", padding: "14px 40px", fontSize: "16px", fontWeight: "600", cursor: "pointer" }}
                >
                  Submit Answers
                </button>
              ) : (
                <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                  {attemptsLeft > 0 && (
                    <button
                      onClick={generateExercise}
                      style={{ background: "#1D9E75", color: "#fff", border: "none", borderRadius: "10px", padding: "14px 32px", fontSize: "15px", fontWeight: "600", cursor: "pointer" }}
                    >
                      Try Another Exercise
                    </button>
                  )}
                  <button
                    onClick={() => window.history.back()}
                    style={{ background: "#fff", color: "#1D9E75", border: "2px solid #1D9E75", borderRadius: "10px", padding: "14px 32px", fontSize: "15px", fontWeight: "600", cursor: "pointer" }}
                  >
                    Back to Home
                  </button>
                </div>
              )}
              {attemptsLeft === 0 && !submitted && (
                <div style={{ marginTop: "12px", color: "#888", fontSize: "13px" }}>
                  This is your last attempt for today.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
