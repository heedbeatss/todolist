import React, { useState, useEffect } from 'react';
import './App.css';

// Definição do tipo para uma tarefa
interface Task {
  id: number;
  text: string;
  completed: boolean;
  date: string;
  completionDate?: string; // Adiciona a data de conclusão opcional
}

interface TaskHistory {
  date: string;
  completedTasks: number;
  totalTasks: number;
  completionPercentage: number;
}

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<string>('');
  const [currentDateTime, setCurrentDateTime] = useState<string>('');
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editedTaskText, setEditedTaskText] = useState<string>('');
  const [history, setHistory] = useState<TaskHistory[]>([]);

  // Função para obter a data e hora atual
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

  // Atualiza a data e hora a cada segundo
  useEffect(() => {
    const updateCurrentDateTime = () => {
      setCurrentDateTime(getCurrentDateTime(true));
    };

    updateCurrentDateTime();
    const intervalId = setInterval(updateCurrentDateTime, 1000);

    return () => clearInterval(intervalId);
  }, []);

  // Carregar tarefas do localStorage
  useEffect(() => {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    }

    const storedHistory = localStorage.getItem('taskHistory');
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }
  }, []);

  // Salvar tarefas no localStorage quando houver alterações
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Adiciona uma nova tarefa
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

  // Reseta todas as tarefas
  const resetTasks = () => {
    setTasks([]);
  };

  // Alterna o estado de conclusão de uma tarefa
  const toggleTaskCompletion = (id: number) => {
    setTasks(
      tasks.map(task =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
              completionDate: !task.completed ? getCurrentDateTime(false) : undefined,
            }
          : task
      )
    );
  };

  // Remove uma tarefa
  const removeTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  // Inicia a edição de uma tarefa
  const startEditingTask = (id: number, currentText: string) => {
    setEditingTaskId(id);
    setEditedTaskText(currentText);
  };

  // Salva uma tarefa editada
  const saveEditedTask = (id: number) => {
    setTasks(
      tasks.map(task =>
        task.id === id ? { ...task, text: editedTaskText } : task
      )
    );
    setEditingTaskId(null);
  };

  // Cálculos para o marcador
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const incompleteTasks = totalTasks - completedTasks;
  const completionPercentage = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;

  // Salvar progresso diário no localStorage
  const saveDailyProgress = () => {
    const dateKey = new Date().toLocaleDateString('pt-BR');
    const progress = {
      date: dateKey,
      completedTasks: completedTasks,
      totalTasks: totalTasks,
      completionPercentage: completionPercentage
    };
    const updatedHistory = [...history, progress];
    setHistory(updatedHistory);
    localStorage.setItem('taskHistory', JSON.stringify(updatedHistory));
  };

  return (
    <div>
      <h1>Lista de Tarefas</h1>
      <p>{currentDateTime}</p>
      <h2>(To-do List)</h2>

      {/* Marcador com estatísticas */}
      <div style={{ marginBottom: '20px', backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '8px' }}>
        <p>Total de tarefas: {totalTasks}</p>
        <p>Tarefas concluídas: {completedTasks} ({completionPercentage.toFixed(2)}%)</p>
        <p>Tarefas não concluídas: {incompleteTasks}</p>
      </div>

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

      <button
        onClick={saveDailyProgress}
        style={{
          backgroundColor: '#007bff',
          color: 'white',
          padding: '10px',
          marginBottom: '20px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          width: '200px',
        }}
      >
        Salvar Progresso Diário
      </button>

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
                <button
                  onClick={() => saveEditedTask(task.id)}
                  style={{
                    backgroundColor: '#4CAF50',
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
                {task.completed && task.completionDate && (
                  <small style={{ marginLeft: '10px', color: '#28a745' }}>
                    (Concluída em: {task.completionDate})
                  </small>
                )}
              </div>
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

      <h3>Histórico Diário</h3>
      <ul>
        {history.map((entry, index) => (
          <li key={index}>
            Data: {entry.date}, Tarefas Concluídas: {entry.completedTasks}, Total de Tarefas: {entry.totalTasks}, Porcentagem: {entry.completionPercentage.toFixed(2)}%
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
