import { useState } from 'react'
import './App.css'

const PERSONA_DISPLAY = {
  'Backend Engineer':          { name: 'Alex',   role: 'Backend Engineer' },
  'Security Engineer':         { name: 'Sam',    role: 'Security Engineer' },
  'Maintainability Architect': { name: 'Jordan', role: 'Maintainability Architect' },
}

// --- Sub-components ---

function Loading({ text }) {
  return (
    <div className="loading-wrap">
      <div className="dots"><span /><span /><span /></div>
      <p>{text}</p>
    </div>
  )
}

function StanceChip({ stance }) {
  return <span className={`stance-chip ${stance}`}>{stance}</span>
}

function AgentCard({ review }) {
  const display = PERSONA_DISPLAY[review.persona] || { name: review.persona, role: '' }
  return (
    <div className={`agent-card stance-${review.stance}`}>
      <div className="agent-header">
        <div>
          <div className="agent-name">{display.name}</div>
          <div className="agent-role">{display.role}</div>
        </div>
        <StanceChip stance={review.stance} />
      </div>

      <div className="agent-bubble">"{review.bubble}"</div>

      {review.responding_to?.length > 0 && (
        <div className="responding-to">
          Responding to: {review.responding_to.join(', ')}
        </div>
      )}

      {review.findings?.length > 0 && (
        <div className="findings-list">
          {review.findings.map((f, i) => (
            <div className="finding-item" key={i}>
              <span className={`severity ${f.severity}`}>{f.severity}</span>
              <div className="finding-title">{f.title}</div>
              <div className="finding-detail">{f.explanation}</div>
              <div className="finding-fix">→ {f.suggested_fix}</div>
            </div>
          ))}
        </div>
      )}

      {review.arguments?.length > 0 && (
        <div className="arguments-list">
          {review.arguments.map((a, i) => (
            <div className="argument-item" key={i}>
              <div className="argument-point">{a.point}</div>
              <div className="argument-detail">{a.reasoning}</div>
              {a.condition_for_approval && (
                <div className="condition">Green light if: {a.condition_for_approval}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ManagerVerdict({ verdict }) {
  const label = verdict.verdict.replace('_', ' ')
  return (
    <div className="verdict-card">
      <div className="verdict-header">
        <h2>Engineering Manager — Morgan</h2>
        <span className={`verdict-badge ${verdict.verdict}`}>{label}</span>
      </div>

      <p className="verdict-rationale">{verdict.rationale}</p>

      <div className="verdict-summaries">
        <div>
          <span>Consensus</span>
          <p>{verdict.consensus_summary}</p>
        </div>
        <div>
          <span>Dissent</span>
          <p>{verdict.dissent_summary}</p>
        </div>
      </div>

      {verdict.action_items?.length > 0 && (
        <>
          <span className="section-label">Action Items</span>
          <div className="action-items">
            {[...verdict.action_items]
              .sort((a, b) => a.priority - b.priority)
              .map((item, i) => (
                <div className="action-item" key={i}>
                  <div className="action-priority">{item.priority}</div>
                  <div className="action-content">
                    <div className="action-title">{item.title}</div>
                    <div className="action-detail">{item.action}</div>
                  </div>
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  )
}

// --- Main App ---

export default function App() {
  const [code, setCode]           = useState('')
  const [phase, setPhase]         = useState('input')     // input | reviewing | arguing | debating | verdict
  const [round0, setRound0]       = useState([])
  const [round1, setRound1]       = useState([])
  const [userArg, setUserArg]     = useState('')
  const [verdict, setVerdict]     = useState(null)

  async function handleReview() {
    if (!code.trim()) return
    setPhase('reviewing')
    try {
      const res = await fetch('http://localhost:8000/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      const data = await res.json()
      setRound0(data.round_0)
      setPhase('arguing')
    } catch (e) {
      console.error(e)
      setPhase('input')
    }
  }

  async function handleDebate() {
    setPhase('debating')
    try {
      const res = await fetch('http://localhost:8000/api/debate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, round_0: round0, user_argument: userArg || 'No counter-argument.' }),
      })
      const data = await res.json()
      setRound1(data.round_1)

      const vRes = await fetch('http://localhost:8000/api/verdict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all_rounds: [round0, data.round_1] }),
      })
      const vData = await vRes.json()
      setVerdict(vData)
      setPhase('verdict')
    } catch (e) {
      console.error(e)
      setPhase('arguing')
    }
  }

  function reset() {
    setCode(''); setPhase('input'); setRound0([]); setRound1([])
    setUserArg(''); setVerdict(null)
  }

  return (
    <div className="app">
      <div className="header">
        <h1><span>Code</span>Council</h1>
        <p>Three AI engineers review your code — then you argue back.</p>
      </div>

      {/* Step 1 — Code input */}
      {phase === 'input' && (
        <div className="code-input-wrap">
          <label>Paste your code</label>
          <textarea
            className="code-textarea"
            placeholder="def my_function():\n    ..."
            value={code}
            onChange={e => setCode(e.target.value)}
          />
          <button className="btn-primary" onClick={handleReview} disabled={!code.trim()}>
            Submit for Review →
          </button>
        </div>
      )}

      {/* Step 2 — Round 0 loading */}
      {phase === 'reviewing' && <Loading text="Panel is reviewing your code..." />}

      {/* Step 3 — Round 0 results + user argument */}
      {(phase === 'arguing' || phase === 'debating' || phase === 'verdict') && round0.length > 0 && (
        <div className="panel-section">
          <span className="section-label">Round 0 — Independent Review</span>
          <div className="agents-grid">
            {round0.map((r, i) => <AgentCard key={i} review={r} />)}
          </div>
        </div>
      )}

      {phase === 'arguing' && (
        <div className="user-argument-wrap">
          <h3>Your turn</h3>
          <p>Counter-argue with the panel. Explain your intent, justify your decisions, or push back.</p>
          <textarea
            className="user-textarea"
            placeholder="The SQL query only receives validated enum values from the frontend dropdown — user_id is always an integer decoded from our JWT token..."
            value={userArg}
            onChange={e => setUserArg(e.target.value)}
          />
          <button className="btn-primary" onClick={handleDebate}>
            Send Argument →
          </button>
        </div>
      )}

      {/* Step 4 — Debate loading */}
      {phase === 'debating' && <Loading text="Panel is responding to your argument..." />}

      {/* Step 5 — Round 1 results */}
      {(phase === 'verdict') && round1.length > 0 && (
        <div className="panel-section">
          <span className="section-label">Round 1 — Debate</span>
          <div className="agents-grid">
            {round1.map((r, i) => <AgentCard key={i} review={r} />)}
          </div>
        </div>
      )}

      {/* Step 6 — Manager verdict */}
      {phase === 'verdict' && verdict && <ManagerVerdict verdict={verdict} />}

      {phase === 'verdict' && (
        <button className="btn-primary" onClick={reset}>Start New Review</button>
      )}
    </div>
  )
}
