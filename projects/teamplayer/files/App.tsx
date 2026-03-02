import { useState } from 'react';
import { Team, TeamProps } from './components/Team';

import './styles.css';

export default function App() {
  const [teams] = useState<TeamProps[]>([
    {
      name: 'Team A', 
      description: 'desc 1', 
      players: [
        {
          name: 'player 1',
          age: 21
        },
        {
          name: 'player 2',
          age: 22
        }
      ]
    },
    {
      name: 'Team B', 
      description: 'desc 2', 
      players: [
        {
          name: 'player 3',
          age: 23
        },
        {
          name: 'player 4',
          age: 24
        }
      ]
    },
    {
      name: 'Team C', 
      description: 'desc 3', 
      players: [
        {
          name: 'player 5',
          age: 25
        },
        {
          name: 'player 6',
          age: 26
        }
      ]
    }
  ]);

  return (
    <main className="counter-shell">
      <h2>Counter Project</h2>
      <p>Use this as a simple state-management starter.</p>

      <div className="w-full max-w-md">
        <div className="relative bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 shadow-2xl">
          <div className="relative">
            {teams.map(t => 
            <Team name={t.name} 
                  key={t.name}
                  description={t.description} 
                  players={t.players}/>
            )}
          </div>
        </div>
        {/* Footer */}
        <p className="text-center text-zinc-600 text-xs mt-6">
          Built with React & Tailwind CSS
        </p>
      </div>



    </main>
  );
}
