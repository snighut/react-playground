import React, { useState } from 'react'

interface PlayerProps {
  name: string;
  age: number;
}

export default function Player(props: PlayerProps) {
  const {age} = props;
  const [name] = useState(props.name);
  
  return (<div> Player: <span>{name}</span>
      <div>{age}</div>
    </div>)
}