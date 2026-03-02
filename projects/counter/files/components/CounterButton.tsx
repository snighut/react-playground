import type { ReactNode } from 'react';

type CounterButtonProps = {
  onClick: () => void;
  children: ReactNode;
};

export function CounterButton({ onClick, children }: CounterButtonProps) {
  return (
    <button className="counter-button" onClick={onClick}>
      {children}
    </button>
  );
}
