<template>
  <div :class="['dashboard-container', { 'dark-mode-dashboard': isDark }]">
    <canvas ref="bgCanvas" class="procedural-bg"></canvas>

    <div class="control-taskbar">
      <div class="taskbar-content">

        <div class="theme-module">
          <span class="module-label">Atmosphere</span>
          <div class="theme-buttons-stack">
            <button
              v-for="(theme, key) in themes"
              :key="key"
              :class="{ active: currentTheme === key }"
              @click="changeTheme(key)"
              class="theme-btn"
            >
              {{ theme.name }}
            </button>
          </div>
        </div>

        <hr class="taskbar-divider" />

        <div class="category-builder-module">
          <h3>Create Category</h3>
          <div class="builder-card">
            <div class="builder-field">
              <label>Name</label>
              <input type="text" v-model="newCat.name" placeholder="e.g., Graphics Engine" />
            </div>

            <div class="builder-row-twin">
              <div class="builder-field">
                <label>Icon</label>
                <select v-model="newCat.emoji" class="emoji-dropdown clean-emoji-select">
                  <option value="📐">📐</option>
                  <option value="�">�</option>
                  <option value="�">�</option>
                  <option value="🧪">🧪</option>
                  <option value="📡">📡</option>
                  <option value="⚡">⚡</option>
                  <option value="�">�</option>
                  <option value="💼">💼</option>
                  <option value="🎓">🎓</option>
                  <option value="🏠">🏠</option>
                  <option value="🎨">🎨</option>
                  <option value="🛠️">🛠️</option>
                  <option value="💾">💾</option>
                  <option value="🔥">🔥</option>
                  <option value="👁️">👁️</option>
                </select>
              </div>
              <div class="builder-field">
                <label>Color</label>
                <div class="color-picker-wrapper">
                  <input type="color" v-model="newCat.color" />
                </div>
              </div>
            </div>

            <button @click="createCategory" class="build-cat-btn">+ Register</button>
          </div>
        </div>

      </div>

      <div class="taskbar-handle">
        <span class="handle-icon">⚙️</span>
        <span class="handle-text">CONTROLS</span>
      </div>
    </div>

    <div class="main-content">
      <h1 class="logo">P👁rtra👁t</h1>

      <div class="horizontal-progress-container">
        <div class="progress-label-row">
          <span class="analytics-title">Task Completion</span>
          <span class="analytics-percentage">{{ completionPercentage }}%</span>
        </div>
        <div class="progress-track-horizontal">
          <div class="progress-fill-horizontal" :style="{ width: completionPercentage + '%' }"></div>
        </div>
      </div>

      <div class="task-stream">
        <div
          v-for="(task, index) in tasks"
          :key="task.id"
          class="task-card"
          :style="{ borderLeftColor: getCategoryColor(task.category) }"
          :class="{
            'completed-task': task.completed,
            'overdue-task': !task.completed && isPastDue(task.dueDate),
            'pending-task': !task.completed && !isPastDue(task.dueDate)
          }"
        >
          <template v-if="editingIndex !== index">
            <div class="task-info">
              <div class="title-row">
                <span class="priority-flag" :title="task.priority + ' Priority'">
                  {{ getPriorityFlag(task.priority) }}
                </span>
                <h4>{{ task.title }}</h4>
                <span class="category-tag" :style="{ backgroundColor: getCategoryColor(task.category) }">
                  {{ getCategoryEmoji(task.category) }} {{ task.category }}
                </span>
              </div>
              <p class="description-text">{{ task.description || 'No description provided.' }}</p>
            </div>

            <div class="task-meta">
              <span
                v-if="task.dueDate"
                class="due-date-badge"
                :class="isPastDue(task.dueDate) && !task.completed ? 'past-due' : 'pending-due'"
              >
                📅 {{ formatDate(task.dueDate) }}
              </span>

              <button @click="toggleComplete(index)" class="action-btn" :title="task.completed ? 'Mark incomplete' : 'Mark complete'">
                <span class="status-emoji-badge">{{ task.completed ? '✅' : '❌' }}</span>
              </button>

              <div class="menu-container">
                <button @click="toggleMenu(index)" class="three-dots-btn">⋮</button>
                <div v-if="activeMenuIndex === index" class="dropdown-menu">
                  <button @click="startEdit(index)">✏️ Edit Task</button>
                  <button @click="deleteTask(index)" class="delete-opt">🗑️ Delete</button>
                </div>
              </div>
            </div>
          </template>

          <template v-else>
            <div class="edit-form-inline">
              <input type="text" v-model="editFields.title" placeholder="Task Title" class="inline-input" />
              <textarea v-model="editFields.description" placeholder="Description" class="inline-textarea"></textarea>

              <div class="inline-row">
                <input type="date" v-model="editFields.dueDate" class="inline-input-sub" />

                <select v-model="editFields.category" class="inline-select">
                  <option v-for="(info, name) in categoryRegistry" :key="name" :value="name">
                    {{ info.emoji }} {{ name }}
                  </option>
                </select>

                <select v-model="editFields.priority" class="inline-select">
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                </select>
              </div>

              <div class="inline-actions">
                <button @click="saveEdit(index)" class="save-btn">Save</button>
                <button @click="cancelEdit" class="cancel-btn">Cancel</button>
              </div>
            </div>
          </template>
        </div>
      </div>

      <div class="construction-panel">
        <div class="input-main-row">
          <input type="text" v-model="form.title" placeholder="Insert task title..." />
          <button @click="addTask" class="send-btn">→</button>
        </div>

        <div class="input-details-row">
          <input type="text" v-model="form.description" placeholder="Add description..." class="desc-input" />

          <div class="meta-inputs">
            <input type="date" v-model="form.dueDate" title="Set Due Date" />

            <select v-model="form.category" title="Select Category">
              <option v-for="(info, name) in categoryRegistry" :key="name" :value="name">
                {{ info.emoji }} {{ name }}
              </option>
            </select>

            <select v-model="form.priority" title="Select Priority">
              <option value="Low">🔵 Low</option>
              <option value="Medium">🟡 Medium</option>
              <option value="High">🔴 High</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, onBeforeUnmount, watch } from 'vue'

const props = defineProps({
  isDark: Boolean
})

const categoryRegistry = reactive({
  General: { color: '#9e9e9e', emoji: '📦' },
  Work: { color: '#4784d8', emoji: '💼' },
  Personal: { color: '#ab47bc', emoji: '🏠' },
  School: { color: '#ff9800', emoji: '🎓' }
})

const newCat = reactive({ name: '', emoji: '📐', color: '#4784d8' })

const createCategory = () => {
  const cleanedName = newCat.name.trim()
  if (!cleanedName) return
  categoryRegistry[cleanedName] = { color: newCat.color, emoji: newCat.emoji }
  form.category = cleanedName
  newCat.name = ''; newCat.emoji = '📐'
}

const currentTheme = ref('void')
const themes = {
  void: {
    name: '🌌 Surrealist Void',
    clearLight: '#f4f6f9', clearDark: '#121214',
    color1: 'rgba(171, 71, 188, 0.08)', color2: 'rgba(71, 132, 216, 0.07)'
  },
  mint: {
    name: '🌿 Monochrome Mint',
    clearLight: '#f0f4f1', clearDark: '#111613',
    color1: 'rgba(153, 226, 137, 0.12)', color2: 'rgba(144, 164, 174, 0.08)'
  },
  dusk: {
    name: '🌅 Liminal Dusk',
    clearLight: '#faf5f2', clearDark: '#181311',
    color1: 'rgba(211, 47, 47, 0.06)', color2: 'rgba(255, 152, 0, 0.06)'
  },
  cyber: {
    name: '🧪 Cyber Punk',
    clearLight: '#f5f4f7', clearDark: '#0f0e14',
    color1: 'rgba(0, 229, 255, 0.08)', color2: 'rgba(101, 31, 255, 0.07)'
  }
}

const themeColors = reactive({
  clearColor: props.isDark ? themes.void.clearDark : themes.void.clearLight,
  color1: themes.void.color1,
  color2: themes.void.color2
})

const changeTheme = (key) => {
  currentTheme.value = key
  const target = themes[key]
  themeColors.clearColor = props.isDark ? target.clearDark : target.clearLight
  themeColors.color1 = target.color1
  themeColors.color2 = target.color2
}

watch(() => props.isDark, (newValue) => {
  const activeTheme = themes[currentTheme.value]
  themeColors.clearColor = newValue ? activeTheme.clearDark : activeTheme.clearLight
})

const bgCanvas = ref(null)
let animationId = null

const initShaderBackground = () => {
  const canvas = bgCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  let width = (canvas.width = window.innerWidth)
  let height = (canvas.height = window.innerHeight)

  const handleResize = () => {
    if (!canvas) return
    width = canvas.width = window.innerWidth
    height = canvas.height = window.innerHeight
  }
  window.addEventListener('resize', handleResize)
  let tick = 0

  const renderLoop = () => {
    tick += 0.003
    ctx.fillStyle = themeColors.clearColor
    ctx.fillRect(0, 0, width, height)

    const x1 = width * (0.5 + 0.25 * Math.sin(tick * 1.5))
    const y1 = height * (0.5 + 0.2 * Math.cos(tick * 0.8))
    const radius1 = Math.max(width, height) * 0.6
    const grad1 = ctx.createRadialGradient(x1, y1, 10, x1, y1, radius1)
    grad1.addColorStop(0, themeColors.color1)
    grad1.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = grad1
    ctx.fillRect(0, 0, width, height)

    const x2 = width * (0.3 + 0.2 * Math.cos(tick * 1.1))
    const y2 = height * (0.4 + 0.25 * Math.sin(tick * 1.3))
    const radius2 = Math.max(width, height) * 0.5
    const grad2 = ctx.createRadialGradient(x2, y2, 10, x2, y2, radius2)
    grad2.addColorStop(0, themeColors.color2)
    grad2.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = grad2
    ctx.fillRect(0, 0, width, height)

    animationId = requestAnimationFrame(renderLoop)
  }
  renderLoop()
  return () => { window.removeEventListener('resize', handleResize) }
}

let cleanupResizeListener = null
onMounted(() => { cleanupResizeListener = initShaderBackground() })
onBeforeUnmount(() => {
  if (animationId) cancelAnimationFrame(animationId)
  if (cleanupResizeListener) cleanupResizeListener()
})

const tasks = ref([
  { id: 1, title: 'Compile Graphics Shaders', description: 'Complete system compilation layout pipelines', dueDate: '2026-04-12', category: 'School', priority: 'High', completed: true },
  { id: 2, title: 'Architecture Review', description: 'Review rendering architecture profiles', dueDate: '2026-06-10', category: 'Work', priority: 'Medium', completed: false },
  { id: 3, title: 'Fix Buffer Intervals', description: 'Fix window buffer swap intervals', dueDate: '2026-07-20', category: 'Personal', priority: 'Low', completed: false },
])

const form = reactive({ title: '', description: '', dueDate: '', category: 'General', priority: 'Medium' })
const activeMenuIndex = ref(null)
const editingIndex = ref(null)
const editFields = reactive({ title: '', description: '', dueDate: '', category: '', priority: '' })

const completionPercentage = computed(() => {
  if (tasks.value.length === 0) return 0
  const completedCount = tasks.value.filter(t => t.completed).length
  return Math.round((completedCount / tasks.value.length) * 100)
})

const isPastDue = (dateString) => {
  if (!dateString) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(dateString) < today
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const parts = dateString.split('-')
  if (parts.length === 3) return `${parts[1]}/${parts[2]}/${parts[0].slice(-2)}`
  return dateString
}

const getCategoryColor = (category) => categoryRegistry[category]?.color || '#9e9e9e'
const getCategoryEmoji = (category) => categoryRegistry[category]?.emoji || '📦'
const getPriorityFlag = (priority) => priority === 'High' ? '🔴' : priority === 'Medium' ? '🟡' : '🔵'

const addTask = () => {
  if (!form.title.trim()) return
  tasks.value.push({
    id: Date.now(), title: form.title, description: form.description,
    dueDate: form.dueDate, category: form.category, priority: form.priority, completed: false
  })
  form.title = ''; form.description = ''; form.dueDate = ''
}

const toggleComplete = (index) => { tasks.value[index].completed = !tasks.value[index].completed }
const toggleMenu = (index) => { activeMenuIndex.value = activeMenuIndex.value === index ? null : index }
const deleteTask = (index) => { tasks.value.splice(index, 1); activeMenuIndex.value = null }

const startEdit = (index) => {
  editingIndex.value = index; activeMenuIndex.value = null; const target = tasks.value[index]
  editFields.title = target.title; editFields.description = target.description
  editFields.dueDate = target.dueDate; editFields.category = target.category; editFields.priority = target.priority
}

const saveEdit = (index) => {
  if (!editFields.title.trim()) return
  tasks.value[index] = { ...tasks.value[index], ...editFields }
  editingIndex.value = null
}
const cancelEdit = () => { editingIndex.value = null }
</script>

<style scoped>
.dashboard-container {
  display: flex; width: 100vw; height: 100vh; position: relative; overflow: hidden;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; transition: color 0.3s ease;
}

.procedural-bg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; pointer-events: none; }

/* ==========================================================================
   SLIDING CONTROL TASKBAR
   ========================================================================== */
.control-taskbar {
  position: fixed; top: 0; left: 0; bottom: 0; width: 280px;
  background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(20px);
  border-right: 2px solid #333; z-index: 100;
  display: flex;
  transform: translateX(-280px);
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.control-taskbar:hover {
  transform: translateX(0);
  box-shadow: 10px 0 30px rgba(0, 0, 0, 0.15);
}
.taskbar-content {
  flex: 1; padding: 2rem 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; overflow-y: auto;
}
.taskbar-handle {
  position: absolute; top: 50%; left: 100%; transform: translateY(-50%);
  background: #333; color: #fff; padding: 1rem 0.5rem;
  border-radius: 0 8px 8px 0; border: 2px solid #333; border-left: none;
  cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
}
.handle-icon { font-size: 1.1rem; }
.handle-text { font-size: 0.65rem; font-weight: 900; letter-spacing: 2px; writing-mode: vertical-lr; text-transform: uppercase; }
.taskbar-divider { border: none; border-top: 1px dashed rgba(51,51,51,0.2); width: 100%; margin: 0.25rem 0; }

.theme-module { display: flex; flex-direction: column; gap: 0.5rem; }
.module-label { font-size: 0.8rem; font-weight: 700; color: #555; text-transform: uppercase; letter-spacing: 0.5px; }
.theme-buttons-stack { display: flex; flex-direction: column; gap: 0.4rem; }
.theme-btn { background: rgba(255, 255, 255, 0.8); border: 1px solid #ccc; padding: 0.5rem; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer; text-align: left; transition: all 0.2s ease; }
.theme-btn:hover { background: #fff; border-color: #333; }
.theme-btn.active { background: #333; color: white; border-color: #333; }

.category-builder-module { display: flex; flex-direction: column; gap: 0.75rem; }
.category-builder-module h3 { margin: 0; font-size: 0.85rem; font-weight: 700; text-transform: uppercase; color: #555; letter-spacing: 0.5px; }
.builder-card { border: 2px solid #333; border-radius: 6px; padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem; background: rgba(255,255,255,0.5); }
.builder-field { display: flex; flex-direction: column; gap: 0.25rem; }
.builder-field label { font-size: 0.7rem; font-weight: 700; color: #666; text-transform: uppercase; }
.builder-field input[type="text"] { padding: 0.46rem; border: 2px solid #333; border-radius: 4px; font-size: 0.9rem; outline: none; background: #fff; width: 100%; box-sizing: border-box; }

/* Text-free clean custom select drop down */
.clean-emoji-select {
  padding: 0.46rem; border: 2px solid #333; border-radius: 4px; font-size: 1.1rem;
  outline: none; background: #fff; width: 100%; text-align: center; cursor: pointer;
  box-sizing: border-box;
}

.builder-row-twin { display: flex; gap: 0.5rem; }
.builder-row-twin .builder-field { flex: 1; }
.color-picker-wrapper { height: 38px; border: 2px solid #333; border-radius: 4px; overflow: hidden; background: white; }
.color-picker-wrapper input[type="color"] { border: none; width: 100%; height: 100%; padding: 0; cursor: pointer; background: none; }
.build-cat-btn { padding: 0.5rem; background: #333; color: white; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; transition: background 0.2s; font-size: 0.85rem; }
.build-cat-btn:hover { background: #4784d8; }

/* ==========================================================================
   HORIZONTAL PROGRESS BAR
   ========================================================================== */
.horizontal-progress-container {
  max-width: 900px; width: 100%; align-self: center; display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 2.5rem;
}
.progress-label-row { display: flex; justify-content: space-between; align-items: flex-end; }
.analytics-title { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #666; }
.analytics-percentage { font-size: 1rem; font-weight: 800; color: #222; }
.progress-track-horizontal { width: 100%; height: 10px; border: 2px solid #333; border-radius: 10px; background: rgba(0, 0, 0, 0.05); overflow: hidden; }
.progress-fill-horizontal { height: 100%; background: #99e289; border-radius: 10px; transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1); }

/* ==========================================================================
   CORE WORKSPACE VIEW LAYOUT RULES
   ========================================================================== */
.main-content { flex: 1; display: flex; flex-direction: column; padding: 2rem 4rem 2rem 6rem; overflow: hidden; position: relative; z-index: 1; }
.logo { text-align: center; font-size: 2.5rem; margin: 0 0 1rem 0; font-weight: 800; letter-spacing: 4px; color: #222; transition: color 0.3s ease; }

.task-stream { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 1rem; padding-right: 0.5rem; padding-bottom: 9.5rem; max-width: 900px; width: 100%; align-self: center; }

/* Light Mode Base Cards */
.task-card {
  display: flex; justify-content: space-between; align-items: center; padding: 1.25rem;
  background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(4px); border: 2px solid #333; border-left: 8px solid #9e9e9e; border-radius: 6px; transition: all 0.3s ease;
}
.task-card:hover { transform: translateY(-1px); box-shadow: 0 6px 14px rgba(0,0,0,0.08); }

/* Light Mode Conditional State Colors */
.task-card.completed-task { background-color: rgba(241, 248, 233, 0.85); border-color: #81c784; opacity: 0.9; }
.task-card.completed-task .title-row h4 { text-decoration: line-through; color: #757575; }
.task-card.overdue-task { background-color: rgba(255, 235, 235, 0.9); border-color: #e57373; }

.title-row { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem; flex-wrap: wrap; }
.title-row h4 { margin: 0; font-size: 1.15rem; font-weight: 700; color: #111; transition: color 0.3s ease; }
.description-text { margin: 0; font-size: 0.9rem; color: #666; line-height: 1.4; transition: color 0.3s ease; }
.category-tag { font-size: 0.7rem; color: white; padding: 0.15rem 0.5rem; border-radius: 12px; font-weight: bold; text-transform: uppercase; display: inline-flex; align-items: center; gap: 0.25rem; }

.task-meta { display: flex; align-items: center; gap: 1rem; position: relative; }
.due-date-badge { font-size: 0.8rem; padding: 0.35rem 0.65rem; border-radius: 4px; font-weight: 600; }
.due-date-badge.pending-due { background-color: #eceff1; color: #546e7a; }
.due-date-badge.past-due { background-color: #ffebee; color: #c62828; font-weight: bold; }

.action-btn { background: none; border: none; cursor: pointer; padding: 0.25rem; display: flex; align-items: center; justify-content: center; transition: transform 0.1s ease; }
.action-btn:active { transform: scale(0.9); }
.status-emoji-badge { font-size: 1.4rem; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.1)); }

.menu-container { position: relative; }
.three-dots-btn { background: none; border: none; font-size: 1.4rem; cursor: pointer; color: #888; padding: 0 0.25rem; }
.dropdown-menu { position: absolute; top: 100%; right: 0; background: white; border: 2px solid #333; border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 10; display: flex; flex-direction: column; min-width: 120px; overflow: hidden; }
.dropdown-menu button { background: none; border: none; padding: 0.6rem 1rem; text-align: left; font-size: 0.85rem; cursor: pointer; width: 100%; }
.dropdown-menu button:hover { background: #f5f5f5; }
.dropdown-menu button.delete-opt { color: #d32f2f; }

.edit-form-inline { display: flex; flex-direction: column; gap: 0.75rem; width: 100%; }
.inline-input, .inline-textarea, .inline-input-sub, .inline-select { padding: 0.5rem; border: 2px solid #333; border-radius: 4px; background: white; }
.inline-row { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.inline-actions { display: flex; gap: 0.5rem; justify-content: flex-end; }
.inline-actions button { padding: 0.4rem 1rem; border: 2px solid #333; font-weight: bold; border-radius: 4px; cursor: pointer; }
.save-btn { background: #99e289; color: #222; }
.cancel-btn { background: white; color: #555; }

.construction-panel {
  position: absolute; bottom: 2rem; border: 2px solid #333; border-radius: 6px; padding: 1rem; display: flex; flex-direction: column; gap: 0.7rem; transition: all 0.3s ease; z-index: 5;
  max-width: 900px; width: calc(100% - 10rem); align-self: center; left: 50%; transform: translateX(-50%); background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(6px);
}
.input-main-row { display: flex; gap: 1rem; }
.input-main-row input { flex: 1; padding: 0.75rem 1rem; border: 2px solid #333; border-radius: 4px; font-size: 1.1rem; outline: none; background: #fff; }
.send-btn { padding: 0 1.5rem; background: #333; color: white; border: none; border-radius: 4px; font-size: 1.4rem; cursor: pointer; }
.input-details-row { display: flex; justify-content: space-between; gap: 1rem; align-items: center; flex-wrap: wrap; }
.desc-input { flex: 1; min-width: 200px; padding: 0.5rem; border: 2px solid #ccc; border-radius: 4px; font-size: 0.9rem; outline: none; }
.meta-inputs { display: flex; gap: 0.5rem; }
.meta-inputs input, .meta-inputs select { padding: 0.5rem; border: 2px solid #ccc; border-radius: 4px; background: white; outline: none; }

/* ==========================================================================
   DYNAMIC SYSTEM MASTER DARK THEME INTERCEPT MAPS
   ========================================================================== */
.dark-mode-dashboard { color: #e0e0e0; }
.dark-mode-dashboard .logo { color: #fff; }

/* High Contrast Dark Mode State Rules */
.dark-mode-dashboard .task-card.completed-task {
  background: rgba(46, 125, 50, 0.25) !important;
  border-color: #66bb6a !important;
  opacity: 1;
  box-shadow: 0 0 12px rgba(74, 175, 80, 0.15);
}
.dark-mode-dashboard .task-card.completed-task .title-row h4 {
  color: #a5d6a7;
  text-decoration: line-through;
}

.dark-mode-dashboard .task-card.overdue-task {
  background: rgba(198, 40, 40, 0.25) !important;
  border-color: #ef5350 !important;
  box-shadow: 0 0 12px rgba(239, 83, 80, 0.15);
}
.dark-mode-dashboard .task-card.overdue-task .title-row h4 {
  color: #ff8a80;
}

.dark-mode-dashboard .task-card.pending-task {
  background: rgba(33, 33, 38, 0.85);
  border-color: #555562;
}

/* Sliding Taskbar Dark Overrides */
.dark-mode-dashboard .control-taskbar { background: rgba(20, 20, 22, 0.95); border-right-color: #444; }
.dark-mode-dashboard .taskbar-handle { background: #222; border-color: #444; }
.dark-mode-dashboard .taskbar-divider { border-top-color: rgba(255,255,255,0.15); }
.dark-mode-dashboard .sidebar-module h3, .dark-mode-dashboard .theme-module .module-label, .dark-mode-dashboard .category-builder-module h3 { color: #aaa; }
.dark-mode-dashboard .progress-track-horizontal { border-color: #555; background: rgba(255,255,255,0.05); }
.dark-mode-dashboard .analytics-title { color: #aaa; }
.dark-mode-dashboard .analytics-percentage { color: #fff; }

.dark-mode-dashboard .theme-btn { background: rgba(40, 40, 45, 0.8); border-color: #444; color: #ccc; }
.dark-mode-dashboard .theme-btn:hover { background: #3a3a40; border-color: #888; }
.dark-mode-dashboard .theme-btn.active { background: #fff; color: #111; border-color: #fff; }

/* Category Config Dark Mode Mapping */
.dark-mode-dashboard .builder-card { background: rgba(255,255,255,0.03); border-color: #444; }
.dark-mode-dashboard .builder-field label { color: #888; }
.dark-mode-dashboard .builder-field input[type="text"], .dark-mode-dashboard .clean-emoji-select { background: #1a1a1c; border-color: #444; color: #fff; }
.dark-mode-dashboard .clean-emoji-select option { background: #222; color: #fff; }
.dark-mode-dashboard .color-picker-wrapper { border-color: #444; background: #1a1a1c; }
.dark-mode-dashboard .build-cat-btn { background: #444; color: #fff; }
.dark-mode-dashboard .build-cat-btn:hover { background: #4784d8; }

.dark-mode-dashboard .three-dots-btn { color: #aaa; }
.dark-mode-dashboard .dropdown-menu { background: #252529; border-color: #555; }
.dark-mode-dashboard .dropdown-menu button { color: #eee; }
.dark-mode-dashboard .dropdown-menu button:hover { background: #333; }

.dark-mode-dashboard .construction-panel { background: rgba(30, 30, 34, 0.9); border-color: #444; }
.dark-mode-dashboard .input-main-row input { background: #222; border-color: #444; color: #fff; }
.dark-mode-dashboard .send-btn { background: #555; color: #fff; }
.dark-mode-dashboard .desc-input { background: #222; border-color: #444; color: #fff; }
.dark-mode-dashboard .meta-inputs input, .dark-mode-dashboard .meta-inputs select { background: #222; border-color: #444; color: #fff; }

.dark-mode-dashboard .inline-input, .dark-mode-dashboard .inline-textarea, .dark-mode-dashboard .inline-input-sub, .dark-mode-dashboard .inline-select { background: #222; border-color: #444; color: #fff; }
.dark-mode-dashboard .cancel-btn { background: #333; color: #eee; }
</style>
