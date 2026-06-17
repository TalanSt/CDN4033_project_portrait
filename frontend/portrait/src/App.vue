<template>
  <Dashboard v-if="isAuthenticated" />

  <Login v-else @login-success="handleLoginSuccess" />
</template>

<script setup>
import { ref } from 'vue'
import Login from './components/Login.vue'
import Dashboard from './components/Dashboard.vue'

const isAuthenticated = ref(false)

const handleLoginSuccess = () => {
  isAuthenticated.value = true
}
</script>

<style>
html, body, #app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}
</style>
