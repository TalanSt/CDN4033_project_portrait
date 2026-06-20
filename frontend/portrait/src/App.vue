<template>
  <div class="app-root-viewport" :class="{ 'light-variant': isLightVariant }">

    <!-- THE ONLY PERMANENT MASTER THEME TOGGLE ICON (No text leaks) -->
    <div class="master-theme-utility">
      <button class="circular-mode-btn" @click="isLightVariant = !isLightVariant" :aria-label="isLightVariant ? 'Switch to Dark Mode' : 'Switch to Light Mode'">
        <span v-if="isLightVariant">🌙</span>
        <span v-else>☀️</span>
      </button>
    </div>

    <!-- Explicit View Switcher Base Frame -->
    <Dashboard
      v-if="isAuthenticated"
      :isLightVariant="isLightVariant"
    />
    <Login
      v-else
      @auth-success="checkAuthSession"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, provide } from 'vue'
import Dashboard from './components/Dashboard.vue'
import Login from './components/Login.vue'

const isLightVariant = ref(false)
const isAuthenticated = ref(false)

const checkAuthSession = () => {
  const token = localStorage.getItem('portrait_token')
  const userid = localStorage.getItem('portrait_userid')
  isAuthenticated.value = !!(token && userid)
}

provide('isLightVariant', isLightVariant)

onMounted(() => {
  checkAuthSession()
})
</script>

<style>
html, body, #app {
  margin: 0; padding: 0; width: 100vw; min-height: 100vh;
  background-color: #161216;
  font-family: 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', Roboto, sans-serif;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}

.app-root-viewport {
  width: 100%; min-height: 100vh; position: relative;
  transition: background-color 0.4s ease;
}

.master-theme-utility {
  position: absolute; top: 1.5rem; right: 1.5rem; z-index: 999;
}
.circular-mode-btn {
  background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1);
  width: 42px; height: 42px; border-radius: 50%; cursor: pointer;
  color: #e2e8f0; font-size: 1.1rem; display: flex;
  align-items: center; justify-content: center;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}
.circular-mode-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.light-variant .circular-mode-btn {
  background: #ffffff; border-color: #dcd6dc; color: #1f1a1f;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
</style>
