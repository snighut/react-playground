import { useState } from 'react';
import { TodoList } from './components/TodoList';
import './styles.css';

export default function App() {
  const [items, setItems] = useState<string[]>(['Learn Sandpack', 'Build a feature']);
  const [value, setValue] = useState('');

  const handleAdd = () => {
    const trimmed = value.trim();

    if (!trimmed) {
      return;
    }

    setItems((current) => [...current, trimmed]);
    setValue('');
  };

  return (
    <main className="todo-shell">
      <h2>Todo Project</h2>
      <p>Switch projects from the dropdown to test different starters.</p>

      <div className="todo-input-row">
        <input
          value={value}
          placeholder="Add a task"
          onChange={(event) => setValue(event.target.value)}
        />
        <button onClick={handleAdd}>Add</button>
      </div>

      <TodoList items={items} />
    </main>
  );
}
