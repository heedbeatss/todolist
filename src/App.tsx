import React, { useState, useEffect } from 'react';
import './App.css';

// Definição do tipo para uma tarefa
interface Task {
  id: number;
  text: string;
  completed: boolean;
  date: string;
}

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<string>('');
  const [currentDateTime, setCurrentDateTime] = useState<string>('');
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editedTaskText, setEditedTaskText] = useState<string>('');

  const getCurrentDateTime = (includeSeconds: boolean = false) => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      second: includeSeconds ? '2-digit' : undefined,
      timeZone: 'America/Sao_Paulo',
    };
    const date = today.toLocaleDateString('pt-BR');
    const time = today.toLocaleTimeString('pt-BR', options);
    return `${date} ${time}`;
  };

  useEffect(() => {
    const updateCurrentDateTime = () => {
      setCurrentDateTime(getCurrentDateTime(true));
    };

    updateCurrentDateTime();
    const intervalId = setInterval(updateCurrentDateTime, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const addTask = () => {
    if (newTask.trim()) {
      const newTaskObject: Task = {
        id: Date.now(),
        text: newTask,
        completed: false,
        date: getCurrentDateTime(false),
      };
      setTasks([...tasks, newTaskObject]);
      setNewTask('');
    }
  };

  const resetTasks = () => {
    setTasks([]);
  };

  const toggleTaskCompletion = (id: number) => {
    setTasks(
      tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const removeTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const startEditingTask = (id: number, currentText: string) => {
    setEditingTaskId(id);
    setEditedTaskText(currentText);
  };

  const saveEditedTask = (id: number) => {
    setTasks(
      tasks.map(task =>
        task.id === id ? { ...task, text: editedTaskText } : task
      )
    );
    setEditingTaskId(null);
  };

  return (
    <div>
      <h1>Lista de Tarefas</h1>
      <p>{currentDateTime}</p>
      <h2>(To-do List)</h2>

      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Adicionar nova tarefa"
        />
        <button
          onClick={addTask}
          style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            padding: '10px',
            marginLeft: '10px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            width: '150px',
          }}
        >
          Adicionar
        </button>
        <button
          onClick={resetTasks}
          style={{
            backgroundColor: '#ff6347',
            color: 'white',
            padding: '10px',
            marginLeft: '10px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            width: '150px',
          }}
        >
          Resetar Lista
        </button>
      </div>

      <ul>
        {tasks.map(task => (
          <li key={task.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {editingTaskId === task.id ? (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="text"
                  value={editedTaskText}
                  onChange={(e) => setEditedTaskText(e.target.value)}
                />
                {/* Botão Salvar com fundo verde */}
                <button
                  onClick={() => saveEditedTask(task.id)}
                  style={{
                    backgroundColor: '#4CAF50', // Mesma cor do botão Adicionar
                    color: 'white',
                    padding: '10px',
                    marginLeft: '10px',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                  }}
                >
                  Salvar
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span
                  style={{
                    textDecoration: task.completed ? 'line-through' : 'none',
                    color: task.completed ? '#FF6347' : '#000',
                    cursor: 'pointer',
                    flexGrow: 1,
                  }}
                  onClick={() => toggleTaskCompletion(task.id)}
                >
                  {task.text}
                </span>
                <small style={{ marginLeft: '10px', color: '#888' }}>
                  {task.date}
                </small>
              </div>
            )}

            {task.completed && (
              <span
                style={{
                  marginLeft: '10px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  padding: '5px 10px',
                  borderRadius: '5px',
                  fontSize: '14px',
                }}
              >
                Completa
              </span>
            )}

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button onClick={() => removeTask(task.id)}>Remover</button>
              {!task.completed && editingTaskId !== task.id && (
                <button onClick={() => startEditingTask(task.id, task.text)}>Editar</button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
