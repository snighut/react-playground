type TodoListProps = {
  items: string[];
};

export function TodoList({ items }: TodoListProps) {
  return (
    <ul className="todo-list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
