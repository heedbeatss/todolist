import React, { useState, useEffect } from 'react';
import './App.css';

// Definição do tipo para uma tarefa
interface Task {
  id: number;
  text: string;
  completed: boolean;
  date: string;
  completionDate?: string; // Adiciona a data de conclusão opcional
  types: { [key: string]: boolean }; // Adiciona os tipos de tarefa
}

interface TaskHistory {
  date: string;
  completedTasks: number;
  totalTasks: number;
  completionPercentage: number;
  typePercentages: { [key: string]: number }; // Percentuais por tipo
}

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<string>('');
  const [currentDateTime, setCurrentDateTime] = useState<string>('');
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editedTaskText, setEditedTaskText] = useState<string>('');
  const [history, setHistory] = useState<TaskHistory[]>([]);
  const [taskTypes, setTaskTypes] = useState<{ [key: string]: boolean }>({
    responsabilidade: false,
    lazer: false,
    criacao: false,
  });

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
        types: taskTypes, // Adiciona os tipos selecionados
      };
      setTasks([...tasks, newTaskObject]);
      setNewTask('');
      setTaskTypes({ responsabilidade: false, lazer: false, criacao: false });
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

  const typeLabels: { [key: string]: string } = {
    responsabilidade: 'Responsabilidade',
    lazer: 'Lazer',
    criacao: 'Criação',
  };


  // Função para calcular as porcentagens e a contagem por tipo de tarefa
  const calculateTypeStats = () => {
  const typeCounts: { [key: string]: number } = {
    responsabilidade: 0,
    lazer: 0,
    criacao: 0,
  };

  tasks.forEach(task => {
    if (task.completed) {
      Object.keys(task.types).forEach(type => {
        if (task.types[type]) {
          typeCounts[type]++;
        }
      });
    }
  });

  const totalCompletedTasks = completedTasks;
  const typeStats: { [key: string]: { count: number; percentage: number } } = {};

  Object.keys(typeCounts).forEach(type => {
    const count = typeCounts[type];
    typeStats[type] = {
      count: count,
      percentage: totalCompletedTasks === 0 ? 0 : (count / totalCompletedTasks) * 100,
    };
  });

  return typeStats;
};

const typeStats = calculateTypeStats();


// Calcula percentuais por tipo
const calculateTypePercentages = () => {
  const typeCounts: { [key: string]: number } = {
    responsabilidade: 0,
    lazer: 0,
    criacao: 0,
  };

  tasks.forEach(task => {
    if (task.completed) {
      Object.keys(task.types).forEach(type => {
        if (task.types[type]) {
            typeCounts[type]++;
        }
      });
    }
  });

  const totalCompletedTasks = completedTasks;
  const typePercentages: { [key: string]: number } = {};
    
  Object.keys(typeCounts).forEach(type => {
    typePercentages[type] = totalCompletedTasks === 0
      ? 0
      : (typeCounts[type] / totalCompletedTasks) * 100;
  });

    return typePercentages;
  };

  const typePercentages = calculateTypePercentages();


  // Salvar progresso diário no localStorage
  const saveDailyProgress = () => {
    const dateKey = new Date().toLocaleDateString('pt-BR');
    const typePercentages = calculateTypePercentages();
    const progress = {
      date: dateKey,
      completedTasks: completedTasks,
      totalTasks: totalTasks,
      completionPercentage: completionPercentage,
      typePercentages: typePercentages
    };
    const updatedHistory = [...history.filter(h => h.date !== dateKey), progress];
    setHistory(updatedHistory);
    localStorage.setItem('taskHistory', JSON.stringify(updatedHistory));
  };

  // Função para excluir um único histórico
  const removeHistoryEntry = (date: string) => {
    const updatedHistory = history.filter(entry => entry.date !== date);
    setHistory(updatedHistory);
    localStorage.setItem('taskHistory', JSON.stringify(updatedHistory));
  };

  // Função para resetar todo o histórico
  const resetHistory = () => {
    setHistory([]);
    localStorage.removeItem('taskHistory');
  };

  return (
    <div>
      <h1>Lista de Tarefas</h1>
      <p>{currentDateTime}</p>
      <h2>(To-do List)</h2>


    
  {/* Exemplo de como adicionar as porcentagens e número de tarefas concluídas no topo */}
  <div style={{ marginBottom: '20px', backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '8px' }}>
    <p>Total de tarefas: {totalTasks === 0 ? 'Nenhuma tarefa' : totalTasks}</p>
    <p>Tarefas não concluídas: {incompleteTasks === 0 ? 'Nenhuma tarefa' : incompleteTasks}</p>
    <p>Tarefas concluídas: {completedTasks === 0 ? 'Nenhuma tarefa' : `${completedTasks} (${completionPercentage.toFixed(2)}%)`}</p>
        
    {Object.keys(typePercentages).map(type => {
      const label = typeLabels[type] || type;
      const color = type === 'lazer' ? 'orange' : type === 'responsabilidade' ? 'blue' : 'purple';
      const count = tasks.filter(task => task.completed && task.types[type]).length;
      const percentage = typePercentages[type] || 0;

      return (
        <p key={type} style={{ color }}>
          {label}: {count === 0 ? 'Nenhuma tarefa concluída' : `${count} ${count === 1 ? 'concluída' : 'concluídas'} - ${percentage.toFixed(2)}%`}
        </p>
      );
    })}
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
    {/* Checkboxes para tipos de tarefa */}
    <div className='checkbox' style={{ marginLeft: '10px' }}>
      <label>
        <input className='checkbox-group'
          type="checkbox"
          checked={task.types.responsabilidade}
          onChange={() => setTasks(tasks.map(t =>
            t.id === task.id ? { ...t, types: { ...t.types, responsabilidade: !t.types.responsabilidade } } : t
          ))}
        />
        Responsabilidade
      </label>
      <label>
        <input className='checkbox-group'
          type="checkbox" 
          checked={task.types.lazer}
          onChange={() => setTasks(tasks.map(t =>
            t.id === task.id ? { ...t, types: { ...t.types, lazer: !t.types.lazer } } : t
          ))}
        />
        Lazer ou Descanso
      </label>
      <label>
        <input className='checkbox-group'
          type="checkbox"
          checked={task.types.criacao}
          onChange={() => setTasks(tasks.map(t =>
            t.id === task.id ? { ...t, types: { ...t.types, criacao: !t.types.criacao } } : t
          ))}
        />
        Criação/Produção
      </label>
      </div> 
  </li>
  ))}
  </ul>

  <div className='historico-div'>
  <h3>Histórico Diário</h3>
  <ul>
    {history.length === 0 ? (
      <p>Nenhum histórico disponível</p>
    ) : (
      history.map((entry, index) => (
        <li className='historico' key={index}>
          Data: {entry.date}, 
          Tarefas Concluídas: {entry.completedTasks === 0 ? 'Nenhuma tarefa' : `${entry.completedTasks}`}, 
          Total de Tarefas: {entry.totalTasks === 0 ? 'Nenhuma tarefa' : entry.totalTasks}, 
          Porcentagem: {entry.totalTasks === 0 ? 'Nenhuma tarefa' : `${entry.completionPercentage.toFixed(2)}%`}
          {Object.keys(entry.typePercentages || {}).map(type => {
            const label = typeLabels[type] || type;
            const color = type === 'lazer' ? 'orange' : type === 'responsabilidade' ? 'blue' : 'purple';
            const count = tasks.filter(task => task.completed && task.types[type]).length;
            const percentage = entry.typePercentages[type] || 0;

            return (
              <p key={type} style={{ color }}>
                {label}: {count === 0 ? 'Nenhuma tarefa' : `${count} ${count === 1 ? 'concluída' : 'concluídas'} - ${percentage.toFixed(2)}%`}
              </p>
            );
          })}
          <button className='historico-bt' onClick={() => removeHistoryEntry(entry.date)}>Excluir</button>
        </li>
      ))
    )}
  </ul>

    <button
      onClick={resetHistory}
      style={{
        backgroundColor: '#dc3545',
        color: 'white',
        fontSize: 'small',
        padding: '5px',
        marginTop: '5px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        width: '170px',
      }}
    >
      Resetar Todo o Histórico
    </button>
    </div>
  </div> 
  );
};

export default App;
