import Player from './Player';
import React, { useState } from 'react';

export interface TeamProps {
  name: string;
  description: string;
  players?: Array<{ name: string; age: number }>;
}

export function Team(props: TeamProps) {
  const [description] = useState(props.description);
  const [name] = useState(props.name)
  const [players] = useState(props.players || [])
  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = () => setExpanded(!expanded);

  function renderPlayers(players: { name: string; age: number; }[]): React.ReactNode {
    return players.map(player => 
        (
          <>
            <div>
              Team Description: <span>{description}</span>
            </div>
            <Player name={player.name}
              key={player.name}
              age={player.age} />
          </>
        ))
  }

  return (<div onClick={toggleExpanded}> 
      Team Name: <span>{name}</span>
      {expanded && renderPlayers(players)}
    </div>
  );
}