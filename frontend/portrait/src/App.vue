<template>
  <div :class="['app-wrapper', { 'dark-theme': isDarkMode }]">
    <!-- Global Dark Mode Toggle Pin Switch -->
    <button @click="toggleDarkMode" class="global-dark-toggle" :title="isDarkMode ? 'Light Mode' : 'Dark Mode'">
      {{ isDarkMode ? '☀️' : '🌙' }}
    </button>

    <!-- App View Controller Switch -->
    <Dashboard v-if="isAuthenticated" :isDark="isDarkMode" />
    <Login v-else :isDark="isDarkMode" @login-success="handleLoginSuccess" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Login from './components/Login.vue'
import Dashboard from './components/Dashboard.vue'

const isAuthenticated = ref(false)
const isDarkMode = ref(false)

const handleLoginSuccess = () => {
  isAuthenticated.value = true
}

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
}
</script>

<style>
html, body, #app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  background-color: #f4f6f9;
  transition: background-color 0.3s ease;
}

.app-wrapper {
  width: 100%;
  height: 100%;
}

/* Floating Utility Switch button rules */
.global-dark-toggle {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999; /* Always on top of all application frames */
  background: rgba(255, 255, 255, 0.85);
  border: 2px solid #333;
  padding: 0.5rem;
  font-size: 1.2rem;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  transition: all 0.2s ease;
}
.global-dark-toggle:hover {
  transform: scale(1.08);
}

/* Dark Mode Global overrides */
.dark-theme {
  background-color: #121212 !important;
}
.dark-theme .global-dark-toggle {
  background: rgba(30, 30, 30, 0.85);
  border-color: #fff;
  color: #fff;
}
</style>
