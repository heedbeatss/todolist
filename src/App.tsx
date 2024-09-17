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
  // Estado para armazenar as tarefas
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<string>('');
  const [currentDateTime, setCurrentDateTime] = useState<string>('');

  // Estado para armazenar a tarefa que está sendo editada
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editedTaskText, setEditedTaskText] = useState<string>('');

  // Função para obter a data e hora no formato desejado
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

  // Atualizar a hora atual periodicamente
  useEffect(() => {
    const updateCurrentDateTime = () => {
      setCurrentDateTime(getCurrentDateTime(true)); // Inclui os segundos
    };

    updateCurrentDateTime(); // Atualiza na primeira renderização
    const intervalId = setInterval(updateCurrentDateTime, 1000); // Atualiza a cada segundo

    return () => clearInterval(intervalId); // Limpa o intervalo quando o componente desmonta
  }, []);

  // Adicionar nova tarefa
  const addTask = () => {
    if (newTask.trim()) {
      const newTaskObject: Task = {
        id: Date.now(),
        text: newTask,
        completed: false,
        date: getCurrentDateTime(false), // Não inclui os segundos
      };
      setTasks([...tasks, newTaskObject]);
      setNewTask(''); // Limpa o campo
    }
  };

  // Alternar o status de conclusão da tarefa
  const toggleTaskCompletion = (id: number) => {
    setTasks(
      tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  // Remover uma tarefa
  const removeTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  // Habilitar modo de edição
  const startEditingTask = (id: number, currentText: string) => {
    setEditingTaskId(id);
    setEditedTaskText(currentText);
  };

  // Salvar a tarefa editada
  const saveEditedTask = (id: number) => {
    setTasks(
      tasks.map(task =>
        task.id === id ? { ...task, text: editedTaskText } : task
      )
    );
    setEditingTaskId(null); // Desabilita o modo de edição
  };

  return (
    <div>
      <h1>Lista de Tarefas</h1>
      <p>{currentDateTime}</p> {/* Exibe a hora atual com segundos */}
      <h2>(To-do List)</h2>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Adicionar nova tarefa"
        />
        <button onClick={addTask}>Adicionar</button>
      </div>
      <ul>
        {tasks.map(task => (
          <li key={task.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Se a tarefa está em modo de edição, exibe o input, caso contrário, exibe o texto */}
            {editingTaskId === task.id ? (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="text"
                  value={editedTaskText}
                  onChange={(e) => setEditedTaskText(e.target.value)}
                />
                <button onClick={() => saveEditedTask(task.id)}>Salvar</button>
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
                {/* Exibir a data e hora de criação da tarefa */}
                <small style={{ marginLeft: '10px', color: '#888' }}>
                  {task.date}
                </small>
              </div>
            )}

            {/* Exibir "completa" se a tarefa estiver concluída */}
            {task.completed && (
              <span 
                style={{ 
                  marginLeft: '10px', 
                  backgroundColor: '#28a745',
                  color: 'white',
                  padding: '5px 10px',
                  borderRadius: '5px',
                  fontSize: '14px'
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
