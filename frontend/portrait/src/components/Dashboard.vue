<template>
  <div class="dashboard-viewport-inner" :style="atmosphereStyles">
    <div class="settings-drawer" :class="{ 'drawer-open': isSettingsOpen }">
      <div class="drawer-trigger" @click="isSettingsOpen = !isSettingsOpen">
        <span class="gear-icon">⚙️</span>
        <span class="trigger-text">SETTINGS</span>
      </div>

      <div class="drawer-content">
        <div class="settings-section">
          <label class="section-label">Identity Profile</label>
          <div class="operator-profile-card">
            <div class="profile-avatar">👤</div>
            <div class="profile-details">
              <span class="profile-label">Active Operator</span>
              <span class="profile-name">{{ currentOperator }}</span>
            </div>
          </div>
        </div>

        <div class="divider-line"></div>

        <div class="settings-section">
          <label class="section-label">Atmosphere</label>
          <div
            v-for="(config, key) in ATMOSPHERE_MATRIX"
            :key="key"
            class="theme-button"
            :class="{ 'active-theme': currentAtmosphere === key }"
            @click="currentAtmosphere = key"
          >
            <span class="theme-indicator">{{ config.icon }}</span> {{ config.name }}
          </div>
        </div>

        <div class="divider-line"></div>

        <div class="settings-section logout-wrapper">
          <button class="logout-btn" @click="handleLogout">Terminate Session</button>
        </div>
      </div>
    </div>

    <div class="workspace-viewport" @click="closeAllContextMenus">
      <header class="app-branding-title">
        P<span>👁️</span>rtr<span>👁️</span>t
      </header>

      <section class="progress-module">
        <div class="progress-meta">
          <span class="label">Task Completion</span>
          <span class="percentage">{{ progressPercentage }}%</span>
        </div>
        <div class="horizontal-track">
          <div class="horizontal-fill" :style="{ width: progressPercentage + '%' }"></div>
        </div>
      </section>

      <section class="tasks-container-stream">
        <div v-if="apiError" class="api-error-banner">❌ {{ apiError }}</div>
        <div v-if="tasks.length === 0" class="empty-state-placeholder">
          No system execution nodes found. Input a title node below to seed context rows.
        </div>

        <div
          v-for="task in tasks"
          :key="task.taskid"
          class="task-item-card"
          :class="{ 'item-checked': task.ischecked, 'item-overdue': isOverdue(task) && !task.ischecked }"
        >
          <div class="category-accent-bar" :style="{ backgroundColor: getTaskStatusColor(task) }"></div>

          <div class="card-body-content">
            <div class="row-top">
              <div class="left-meta-info">
                <span class="status-symbol-indicator">
                  {{ task.ischecked ? '✔️' : '❌' }}
                </span>

                <input
                  v-if="editingTaskId === task.taskid"
                  v-model="editForm.taskname"
                  class="inline-edit-input title-edit"
                />
                <h4 v-else class="task-title-text">{{ task.taskname }}</h4>

                <span class="category-pill-tag" :style="{ backgroundColor: getCategoryPillBg(task.category) }">
                  {{ getCategoryIcon(task.category) }} {{ task.category.toUpperCase() }}
                </span>
              </div>

              <div class="right-action-controls">
                <input
                  v-if="editingTaskId === task.taskid"
                  v-model="editForm.taskduedate"
                  type="date"
                  class="inline-edit-input date-edit"
                />
                <span v-else class="due-date-badge" :class="{ 'date-overdue': isOverdue(task) && !task.ischecked }">
                  📅 {{ formatDate(task.taskduedate) }}
                </span>

                <button class="state-toggle-action" @click.stop="toggleTaskStatus(task)" title="Toggle status">
                  {{ task.ischecked ? '↩️' : '✅' }}
                </button>

                <div class="context-menu-container">
                  <button class="option-context-dots" @click.stop="toggleContextMenu(task.taskid)">⋮</button>

                  <div v-if="activeContextMenuId === task.taskid" class="dropdown-actions-menu">
                    <button v-if="editingTaskId !== task.taskid" @click.stop="startInlineEdit(task)">✏️ Edit</button>
                    <button v-else @click.stop="saveInlineEdit(task)">💾 Save</button>
                    <button @click.stop="deleteTaskNode(task.taskid)" class="delete-action-item">🗑️ Delete</button>
                  </div>
                </div>
              </div>
            </div>

            <textarea
              v-if="editingTaskId === task.taskid"
              v-model="editForm.taskcontent"
              class="inline-edit-input desc-edit"
            ></textarea>
            <p v-else class="task-description-prose">{{ task.taskcontent }}</p>
          </div>
        </div>
      </section>

      <footer class="creation-dock-footer">
        <form @submit.prevent="createNewTaskSubmit" class="dock-form">
          <div class="dock-primary-row">
            <input v-model="newTaskForm.title" type="text" placeholder="Insert task title..." required class="dock-title-input" />
            <button type="submit" class="dock-submit-arrow">➔</button>
          </div>
          <div class="dock-secondary-row">
            <input v-model="newTaskForm.content" type="text" placeholder="Add description..." required class="dock-desc-input" />
            <input v-model="newTaskForm.dueDate" type="date" required class="dock-date-input" />
            <select v-model="newTaskForm.category" class="dock-select-input">
              <option value="School">🎓 School</option>
              <option value="Work">💼 Work</option>
              <option value="Personal">🏠 Personal</option>
            </select>
            <select v-model="newTaskForm.priority" class="dock-select-input">
              <option value="Low">🟡 Low</option>
              <option value="Medium">🟠 Medium</option>
              <option value="High">🔴 High</option>
            </select>
          </div>
        </form>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const props = defineProps({
  isLightVariant: Boolean
})

const BACKEND_URL = 'https://localhost:3001/api'

const tasks = ref([])
const apiError = ref('')
const isSettingsOpen = ref(false)
const currentAtmosphere = ref('surrealistVoid')
const currentOperator = ref(localStorage.getItem('portrait_username') || 'Root')

// Action item states
const activeContextMenuId = ref(null)
const editingTaskId = ref(null)
const editForm = ref({ taskname: '', taskcontent: '', taskduedate: '' })

const ATMOSPHERE_MATRIX = {
  surrealistVoid: {
    name: 'Surrealist Void', icon: '🌌',
    dark:  { bg: '#161216', surface: '#1a151a', drawer: '#0c0a0c', text: '#e2e8f0', line: '#2b222b', fill: 'linear-gradient(90deg, #4ade80, #22c55e)' },
    light: { bg: '#f5f3f5', surface: '#ffffff', drawer: '#e8e4e8', text: '#1f1a1f', line: '#dcd6dc', fill: 'linear-gradient(90deg, #16a34a, #15803d)' }
  },
  monochromeMint: {
    name: 'Monochrome Mint', icon: '🌿',
    dark:  { bg: '#121614', surface: '#151a17', drawer: '#0a0c0b', text: '#e2f0e8', line: '#222b26', fill: 'linear-gradient(90deg, #2dd4bf, #0f766e)' },
    light: { bg: '#f2f6f4', surface: '#ffffff', drawer: '#e2eae6', text: '#111613', line: '#d2ded8', fill: 'linear-gradient(90deg, #0d9488, #115e59)' }
  },
  liminalDusk: {
    name: 'Liminal Dusk', icon: '🌅',
    dark:  { bg: '#1c1512', surface: '#241b17', drawer: '#120d0b', text: '#f0e6e2', line: '#332620', fill: 'linear-gradient(90deg, #f97316, #ea580c)' },
    light: { bg: '#faf5f2', surface: '#ffffff', drawer: '#efe4de', text: '#211612', line: '#e6d5cc', fill: 'linear-gradient(90deg, #ea580c, #c2410c)' }
  },
  cyberPunk: {
    name: 'Cyber Punk', icon: '⚡',
    dark:  { bg: '#0f0514', surface: '#16091f', drawer: '#07010a', text: '#f5e6ff', line: '#311442', fill: 'linear-gradient(90deg, #f43f5e, #d946ef)' },
    light: { bg: '#fdf6ff', surface: '#ffffff', drawer: '#f4e3fc', text: '#210230', line: '#edd0fa', fill: 'linear-gradient(90deg, #e11d48, #c026d3)' }
  }
}

const atmosphereStyles = computed(() => {
  const flavor = ATMOSPHERE_MATRIX[currentAtmosphere.value]
  const tokenSet = props.isLightVariant ? flavor.light : flavor.dark
  return {
    '--bg-app': tokenSet.bg,
    '--bg-surface': tokenSet.surface,
    '--bg-drawer': tokenSet.drawer,
    '--text-main': tokenSet.text,
    '--border-line': tokenSet.line,
    '--progress-fill': tokenSet.fill
  }
})

const newTaskForm = ref({ title: '', content: '', dueDate: '', category: 'School', priority: 'Medium' })
const completedTasksCount = computed(() => tasks.value.filter(t => t.ischecked === true || t.ischecked === 1 || t.ischecked === 'true').length)
const progressPercentage = computed(() => tasks.value.length === 0 ? 0 : Math.round((completedTasksCount.value / tasks.value.length) * 100))

// Utility date check
const isOverdue = (task) => {
  if (!task.taskduedate) return false
  const targetDate = new Date(task.taskduedate)
  targetDate.setHours(23, 59, 59, 999)
  return new Date() > targetDate
}

// Colors accent bar: Completed -> Green, Overdue -> Red, Normal -> Category Color
const getTaskStatusColor = (task) => {
  if (task.ischecked === true || task.ischecked === 1 || task.ischecked === 'true') return '#22c55e'
  if (isOverdue(task)) return '#ef4444'
  return task.category?.toLowerCase() === 'school' ? '#f59e0b' : task.category?.toLowerCase() === 'work' ? '#3b82f6' : '#a855f7'
}

const loadWorkspaceTasks = async () => {
  const token = localStorage.getItem('portrait_token')
  const userid = localStorage.getItem('portrait_userid')
  if (!token || !userid) return

  try {
    const response = await fetch(`${BACKEND_URL}/get_tasks`, {
      method: 'POST',
      headers: { 'token': token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ userid: Number(userid) })
    })
    const data = await response.json()
    if (data.success) {
      // Ensure local mappings cleanly evaluate truthiness configurations returned from SQLite backend
      tasks.value = data.message.map(t => ({
        ...t,
        ischecked: (t.ischecked === true || t.ischecked === 1 || t.ischecked === 'true')
      }));
      apiError.value = ''
    }
  } catch (err) { apiError.value = "Network integration anomaly encountered." }
}

const createNewTaskSubmit = async () => {
  const token = localStorage.getItem('portrait_token')
  const userid = localStorage.getItem('portrait_userid')
  try {
    const response = await fetch(`${BACKEND_URL}/make_task`, {
      method: 'POST',
      headers: { 'token': token, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userid: Number(userid), taskName: newTaskForm.value.title,
        taskContent: newTaskForm.value.content, taskDueDate: newTaskForm.value.dueDate,
        category: newTaskForm.value.category, isChecked: false
      })
    })
    const data = await response.json()
    if (data.success) {
      newTaskForm.value.title = ''; newTaskForm.value.content = ''; newTaskForm.value.dueDate = ''
      await loadWorkspaceTasks()
    }
  } catch (err) { console.error(err) }
}

// Fixed Status Toggle logic
const toggleTaskStatus = async (task) => {
  // Invert current status cleanly regardless of base typing state
  const nextCheckedState = !(task.ischecked === true || task.ischecked === 1 || task.ischecked === 'true');

  // Optimistically set status variant locally for snappier interface feedback
  task.ischecked = nextCheckedState;

  // Package clean structured payload explicitly targeting your backend configurations
  const payload = {
    taskid: task.taskid,
    userid: Number(task.userid),
    taskname: task.taskname,
    taskcontent: task.taskcontent,
    taskduedate: task.taskduedate,
    category: task.category,
    ischecked: nextCheckedState
  };

  await syncTaskUpdateBackend(payload);
}

// Context Actions Management Engine
const toggleContextMenu = (id) => {
  activeContextMenuId.value = activeContextMenuId.value === id ? null : id
}
const closeAllContextMenus = () => {
  activeContextMenuId.value = null
}

const startInlineEdit = (task) => {
  editingTaskId.value = task.taskid
  editForm.value = {
    taskname: task.taskname,
    taskcontent: task.taskcontent,
    taskduedate: task.taskduedate ? task.taskduedate.substring(0, 10) : ''
  }
  activeContextMenuId.value = null
}

const saveInlineEdit = async (task) => {
  const updatedTask = {
    taskid: task.taskid,
    userid: Number(task.userid),
    taskname: editForm.value.taskname,
    taskcontent: editForm.value.taskcontent,
    taskduedate: editForm.value.taskduedate,
    category: task.category,
    ischecked: (task.ischecked === true || task.ischecked === 1 || task.ischecked === 'true')
  }

  editingTaskId.value = null
  await syncTaskUpdateBackend(updatedTask);
}

const syncTaskUpdateBackend = async (taskPayload) => {
  const token = localStorage.getItem('portrait_token')
  try {
    const response = await fetch(`${BACKEND_URL}/update_task`, {
      method: 'POST',
      headers: { 'token': token, 'Content-Type': 'application/json' },
      body: JSON.stringify(taskPayload)
    })
    const data = await response.json()
    if (!data.success) {
      apiError.value = "Failed to synchronize status with storage cluster node.";
    }
    await loadWorkspaceTasks()
  } catch (err) {
    console.error(err)
    apiError.value = "Anomalous connection timeout encountered when saving runtime task."
  }
}

const deleteTaskNode = async (taskId) => {
  const token = localStorage.getItem('portrait_token')
  tasks.value = tasks.value.filter(t => t.taskid !== taskId)
  activeContextMenuId.value = null

  try {
    await fetch(`${BACKEND_URL}/delete_task`, {
      method: 'POST',
      headers: { 'token': token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskid: taskId })
    })
    await loadWorkspaceTasks()
  } catch (err) { console.error(err) }
}

const getCategoryPillBg = (cat) => cat?.toLowerCase() === 'school' ? 'rgba(245, 158, 11, 0.2)' : cat?.toLowerCase() === 'work' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(168, 85, 247, 0.2)'
const getCategoryIcon = (cat) => cat?.toLowerCase() === 'school' ? '🎓' : cat?.toLowerCase() === 'work' ? '💼' : '🏠'
const formatDate = (ds) => { if (!ds) return 'Pending'; const d = new Date(ds); return `${String(d.getUTCMonth() + 1).padStart(2, '0')}/${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCFullYear()).substring(2)}` }
const handleLogout = () => { localStorage.clear(); window.location.reload() }

onMounted(() => {
  loadWorkspaceTasks()
})
</script>

<style scoped>
.dashboard-viewport-inner {
  display: flex; width: 100vw; min-height: 100vh;
  background-color: var(--bg-app); color: var(--text-main);
  transition: background-color 0.4s ease, color 0.4s ease;
}

.settings-drawer {
  position: fixed; left: -260px; top: 50%; transform: translateY(-50%); width: 260px;
  background: var(--bg-drawer); border: 1px solid var(--border-line); border-left: none;
  border-radius: 0 12px 12px 0; z-index: 100; display: flex;
  transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.4s, border-color 0.4s;
}
.drawer-open { left: 0; }
.drawer-trigger {
  position: absolute; right: -37px; top: 50%; transform: translateY(-50%) rotate(90deg);
  transform-origin: center right; background: var(--bg-drawer); border: 1px solid var(--border-line);
  border-bottom: none; padding: 0.35rem 0.85rem; border-radius: 6px 6px 0 0; cursor: pointer; display: flex; align-items: center; gap: 0.4rem;
}
.trigger-text { font-size: 0.65rem; font-weight: 900; letter-spacing: 2px; color: var(--text-main); }
.gear-icon { transform: rotate(-90deg); font-size: 0.75rem; color: var(--text-main); }
.drawer-content { padding: 1.25rem; width: 100%; display: flex; flex-direction: column; gap: 1.25rem; }
.section-label { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: #8a828a; margin-bottom: 0.75rem; letter-spacing: 1px; }
.operator-profile-card { display: flex; align-items: center; gap: 0.75rem; background: var(--bg-surface); padding: 0.75rem; border-radius: 8px; border: 1px solid var(--border-line); }
.profile-avatar { font-size: 1.5rem; }
.profile-details { display: flex; flex-direction: column; }
.profile-label { font-size: 0.65rem; color: #857b85; text-transform: uppercase; font-weight: bold; }
.profile-name { font-weight: 700; color: #4ade80; }

.theme-button { padding: 0.65rem 0.85rem; background: transparent; border-radius: 6px; font-size: 0.85rem; font-weight: 600; color: var(--text-main); cursor: pointer; margin-bottom: 0.4rem; display: flex; align-items: center; gap: 0.5rem; transition: background 0.2s; border: 1px solid transparent; }
.theme-button:hover { background: rgba(255, 255, 255, 0.05); border-color: var(--border-line); }
.active-theme { background: var(--text-main) !important; color: var(--bg-app) !important; font-weight: 800; }
.divider-line { border-top: 1px dashed var(--border-line); width: 100%; }
.logout-btn { width: 100%; padding: 0.55rem; background: #ef4444; border: none; color: #fff; border-radius: 6px; font-weight: 700; cursor: pointer; }

.workspace-viewport { flex-grow: 1; padding: 4rem 4rem 10rem 4rem; display: flex; flex-direction: column; align-items: center; max-width: 900px; margin: 0 auto; width: 100%; box-sizing: border-box; }
.app-branding-title { font-size: 2.75rem; font-weight: 900; letter-spacing: 4px; color: var(--text-main); margin-bottom: 2rem; text-align: center; }
.app-branding-title span { font-size: 2.5rem; display: inline-block; margin: 0 -2px; }

.progress-module { width: 100%; max-width: 720px; margin-bottom: 2rem; }
.progress-meta { display: flex; justify-content: space-between; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; color: #8c858c; margin-bottom: 0.4rem; letter-spacing: 1px; }
.horizontal-track { width: 100%; height: 10px; background-color: var(--bg-drawer); border-radius: 20px; overflow: hidden; border: 1px solid var(--border-line); }
.horizontal-fill { height: 100%; background: var(--progress-fill); border-radius: 20px; transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1); }

/* TASKS CONTAINERS SETUP */
.tasks-container-stream { width: 100%; max-width: 720px; display: flex; flex-direction: column; gap: 1rem; }
.task-item-card { background-color: var(--bg-surface); border: 1px solid var(--border-line); border-radius: 8px; display: flex; overflow: hidden; position: relative; transition: all 0.2s; }
.category-accent-bar { width: 5px; flex-shrink: 0; transition: background-color 0.3s ease; }
.card-body-content { padding: 1.25rem; flex-grow: 1; display: flex; flex-direction: column; gap: 0.5rem; }
.row-top { display: flex; justify-content: space-between; align-items: center; }
.left-meta-info { display: flex; align-items: center; gap: 0.75rem; flex-grow: 1; }

/* Status Check/X markers */
.status-symbol-indicator { font-size: 0.95rem; font-weight: bold; width: 20px; text-align: center; }

.task-title-text { margin: 0; font-size: 1.1rem; font-weight: 700; color: var(--text-main); letter-spacing: -0.3px; }
.category-pill-tag { font-size: 0.6rem; font-weight: 800; padding: 0.2rem 0.5rem; border-radius: 4px; color: #fff; letter-spacing: 0.5px; }
.right-action-controls { display: flex; align-items: center; gap: 0.75rem; position: relative; }

/* Overdue States */
.item-overdue { border-color: rgba(239, 68, 68, 0.4); }
.date-overdue { color: #ef4444 !important; font-weight: 800 !important; background: rgba(239, 68, 68, 0.08) !important; border-color: rgba(239, 68, 68, 0.2) !important; }
.due-date-badge { font-size: 0.7rem; font-weight: 700; background: var(--bg-drawer); padding: 0.3rem 0.6rem; border-radius: 4px; border: 1px solid var(--border-line); color: var(--text-main); opacity: 0.9; }

.state-toggle-action { background: transparent; border: none; cursor: pointer; font-size: 1.05rem; transition: transform 0.2s; padding: 0 4px; }
.state-toggle-action:hover { transform: scale(1.15); }
.option-context-dots { background: transparent; border: none; color: #8c858c; cursor: pointer; font-size: 1.2rem; padding: 0 6px; font-weight: 900; }
.option-context-dots:hover { color: var(--text-main); }

/* Task Dropdown Menu Box */
.context-menu-container { position: relative; display: inline-block; }
.dropdown-actions-menu {
  position: absolute; right: 0; top: 100%; background: var(--bg-drawer);
  border: 1px solid var(--border-line); border-radius: 6px; min-width: 100px;
  box-shadow: 0 6px 16px rgba(0,0,0,0.3); z-index: 80; display: flex; flex-direction: column; padding: 4px 0;
}
.dropdown-actions-menu button {
  background: transparent; border: none; text-align: left; padding: 8px 14px;
  font-size: 0.8rem; font-weight: 600; color: var(--text-main); cursor: pointer; width: 100%; white-space: nowrap;
}
.dropdown-actions-menu button:hover { background: rgba(255, 255, 255, 0.08); }
.dropdown-actions-menu .delete-action-item { color: #f87171; }
.dropdown-actions-menu .delete-action-item:hover { background: rgba(239, 68, 68, 0.15); }

/* Inline Inputs Structure */
.inline-edit-input { background: var(--bg-drawer); border: 1px solid var(--border-line); color: var(--text-main); border-radius: 4px; padding: 4px 8px; font-family: inherit; }
.title-edit { font-size: 1.05rem; font-weight: 700; max-width: 200px; }
.date-edit { font-size: 0.75rem; padding: 2px 4px; }
.desc-edit { font-size: 0.85rem; width: 95%; min-height: 50px; resize: vertical; margin-left: 1.5rem; margin-top: 4px; }

.task-description-prose { margin: 0; font-size: 0.9rem; color: var(--text-main); opacity: 0.7; padding-left: 1.5rem; line-height: 1.4; }
.item-checked { opacity: 0.55; border-color: rgba(34, 197, 94, 0.2); }
.item-checked .task-title-text { text-decoration: line-through; opacity: 0.6; }

/* INPUT DOCK STYLINGS */
.creation-dock-footer { position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%); width: 100%; max-width: 640px; background: var(--bg-surface); border: 1px solid var(--border-line); border-radius: 10px; padding: 0.85rem; box-shadow: 0 10px 30px rgba(0,0,0,0.4); z-index: 50; }
.dock-form { display: flex; flex-direction: column; gap: 0.6rem; }
.dock-primary-row { display: flex; gap: 0.75rem; }
.dock-title-input { flex-grow: 1; background: transparent; border: none; border-bottom: 1px solid var(--border-line); padding: 0.4rem 0; color: var(--text-main); font-size: 1rem; font-family: inherit; }
.dock-title-input:focus { outline: none; }
.dock-submit-arrow { background: var(--bg-drawer); border: 1px solid var(--border-line); color: var(--text-main); width: 32px; height: 32px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.dock-secondary-row { display: grid; grid-template-columns: 1fr 130px 100px 100px; gap: 0.5rem; align-items: center; }
.dock-desc-input { background: var(--bg-drawer); border: 1px solid var(--border-line); border-radius: 5px; padding: 0.4rem; color: var(--text-main); font-size: 0.8rem; font-family: inherit; }
.dock-date-input, .dock-select-input { background: var(--bg-drawer); border: 1px solid var(--border-line); border-radius: 5px; padding: 0.35rem; color: var(--text-main); font-size: 0.75rem; font-family: inherit; }

.api-error-banner { padding: 0.75rem; background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; color: #fca5a5; border-radius: 6px; font-size: 0.8rem; text-align: center; }
.empty-state-placeholder { text-align: center; color: #8c858c; font-style: italic; padding: 3rem 0; font-size: 0.9rem; }
</style>
