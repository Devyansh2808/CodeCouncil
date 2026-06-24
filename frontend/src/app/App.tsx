import { useState } from 'react';
import { LandingPage }  from './pages/LandingPage';
import { InputPage }    from './pages/InputPage';
import { LoadingPage }  from './pages/LoadingPage';
import { PanelPage }    from './pages/PanelPage';
import { VerdictPage }  from './pages/VerdictPage';
import type { ReviewResponse, ManagerVerdict } from './types';

type Phase = 'landing' | 'input' | 'reviewing' | 'panel' | 'debating' | 'verdict';

const API = 'http://localhost:8000';

export default function App() {
  const [phase,   setPhase]   = useState<Phase>('landing');
  const [code,    setCode]    = useState('');
  const [round0,  setRound0]  = useState<ReviewResponse[]>([]);
  const [round1,  setRound1]  = useState<ReviewResponse[]>([]);
  const [verdict, setVerdict] = useState<ManagerVerdict | null>(null);

  async function handleReview(codeInput: string) {
    setCode(codeInput);
    setPhase('reviewing');
    try {
      const res  = await fetch(`${API}/api/review`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ code: codeInput }),
      });
      const data = await res.json();
      setRound0(data.round_0);
      setPhase('panel');
    } catch (e) {
      console.error(e);
      setPhase('input');
    }
  }

  async function handleDebate(userArg: string) {
    setPhase('debating');
    try {
      const debateRes  = await fetch(`${API}/api/debate`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ code, round_0: round0, user_argument: userArg || 'No counter-argument.' }),
      });
      const debateData = await debateRes.json();
      setRound1(debateData.round_1);

      const vRes  = await fetch(`${API}/api/verdict`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ all_rounds: [round0, debateData.round_1] }),
      });
      const vData = await vRes.json();
      setVerdict(vData);
      setPhase('verdict');
    } catch (e) {
      console.error(e);
      setPhase('panel');
    }
  }

  function reset() {
    setCode(''); setRound0([]); setRound1([]); setVerdict(null);
    setPhase('landing');
  }

  if (phase === 'landing')   return <LandingPage onStart={() => setPhase('input')} />;
  if (phase === 'input')     return <InputPage onSubmit={handleReview} onBack={() => setPhase('landing')} />;
  if (phase === 'reviewing') return <LoadingPage message="Panel is reviewing your code…" submessage="Three engineers are working in parallel" />;
  if (phase === 'panel')     return <PanelPage reviews={round0} onDefend={handleDebate} />;
  if (phase === 'debating')  return <LoadingPage message="Panel is reconsidering your argument…" submessage="Agents are updating their stance and the manager is forming a verdict" />;
  if (phase === 'verdict')   return <VerdictPage round0={round0} round1={round1} verdict={verdict!} onReset={reset} />;
  return null;
}
