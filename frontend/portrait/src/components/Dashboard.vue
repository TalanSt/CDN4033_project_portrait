<template>
  <div class="dashboard-container">
    <div class="sidebar">
      <h3>Progress Bar</h3>
      <div class="progress-track">
        <div class="progress-fill" :style="{ height: completionPercentage + '%' }"></div>
      </div>
    </div>

    <div class="main-content">
      <h1 class="logo">Portrait</h1>

      <div class="task-list">
        <div
          v-for="(task, index) in tasks"
          :key="index"
          class="task-card"
          :class="{ 'completed-task': task.completed }"
        >
          <div class="task-info">
            <h4>{{ task.title }}</h4>
            <p>{{ task.description }}</p>
          </div>
          <div class="task-meta">
            <span v-if="task.dueDate" class="due-date">Due: {{ task.dueDate }}</span>
            <button @click="toggleComplete(index)" class="action-btn">
              {{ task.completed ? '↩️' : '✔️' }}
            </button>
          </div>
        </div>
      </div>

      <div class="input-container">
        <input
          type="text"
          v-model="newTaskTitle"
          placeholder="Insert task..."
          @keyup.enter="addTask"
        />
        <button @click="addTask" class="send-btn">→</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Mock Data matching your sketch
const tasks = ref([
  { title: 'Task 1', description: 'Description', dueDate: '04/12/98', completed: true },
  { title: 'Task 2', description: 'Description', dueDate: '', completed: true },
  { title: 'Task 3', description: 'Description', dueDate: '', completed: true },
  { title: 'Task 4', description: 'Description', dueDate: '01/25/06', completed: false },
])

const newTaskTitle = ref('')

// Calculate height of the progress bar based on completed tasks
const completionPercentage = computed(() => {
  if (tasks.value.length === 0) return 0
  const completedCount = tasks.value.filter(t => t.completed).length
  return Math.round((completedCount / tasks.value.length) * 100)
})

const addTask = () => {
  if (!newTaskTitle.value.trim()) return
  tasks.value.push({
    title: newTaskTitle.value,
    description: 'No description provided.',
    dueDate: '',
    completed: false
  })
  newTaskTitle.value = ''
}

const toggleComplete = (index) => {
  tasks.value[index].completed = !tasks.value[index].completed
}
</script>

<style scoped>
.dashboard-container {
  display: flex;
  width: 100vw;
  height: 100vh;
  background-color: #ffffff;
  font-family: sans-serif;
}

/* Sidebar Progress Styling */
.sidebar {
  width: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1rem;
  border-right: 2px solid #333;
}
.progress-track {
  width: 50px;
  height: 70%;
  border: 2px solid #333;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column-reverse; /* Fills from bottom up */
  background: #555; /* Striped/gray zone when incomplete */
}
.progress-fill {
  width: 100%;
  background-color: #99e289; /* Light neon green from sketch */
  transition: height 0.3s ease;
}

/* Main Panel Layout */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 2rem;
  position: relative;
}
.logo {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 2rem;
  letter-spacing: 2px;
}

/* Task Layouts */
.task-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 5rem;
}
.task-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 2px solid #333;
  background-color: #555; /* Incomplete task color background */
  color: #fff;
}
.task-card.completed-task {
  background-color: #99e289; /* Completed green */
  color: #333;
}
.task-info h4 { margin: 0 0 0.25rem 0; }
.task-info p { margin: 0; font-size: 0.85rem; }

.task-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
}

/* Fixed Bottom Input Bar */
.input-container {
  position: absolute;
  bottom: 2rem;
  left: 2rem;
  right: 2rem;
  display: flex;
  border: 2px solid #333;
  background: #fff;
}
.input-container input {
  flex: 1;
  padding: 1rem;
  border: none;
  outline: none;
  font-size: 1.1rem;
}
.send-btn {
  padding: 0 1.5rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}
</style>
