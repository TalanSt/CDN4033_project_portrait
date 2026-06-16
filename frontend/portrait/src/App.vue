<template>
  <Login />
</template>

<script setup>
import Login from './components/Login.vue'
</script>

<style>
/* Reset body and html defaults globally to clear out system margins and dark themes */
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  background-color: #ffffff; /* Sets default fallback background to white */
}

#app {
  width: 100%;
  height: 100%;
}
</style>
