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
  return (<div> 
      Team Name: <span>{name}</span>
      <div>
        Team Description: <span>{description}</span>
      </div>
      {players.map(player => 
        (
          <Player name={player.name} 
                  key={player.name}
                  age={player.age} />
        ))
      }
    </div>
  );
}