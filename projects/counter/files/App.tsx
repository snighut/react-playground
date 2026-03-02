import { useState } from 'react';
import { CounterButton } from './components/CounterButton';

import './styles.css';

export default function App() {
  const [count, setCount] = useState(0);


  return (
    <main className="counter-shell">
      <h2>Counter Project</h2>
      <p>Use this as a simple state-management starter.</p>

      <div className="counter-card">
        <p>Current count: {count}</p>
        <CounterButton onClick={() => setCount((value) => value + 1)}>
          Increment
        </CounterButton>
      </div>

      <div className="w-full max-w-md">
        <div className="relative bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 shadow-2xl">
        </div>
        {/* Footer */}
        <p className="text-center text-zinc-600 text-xs mt-6">
          Built with React & Tailwind CSS
        </p>
      </div>



    </main>
  );
}
