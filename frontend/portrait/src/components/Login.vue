<template>
  <div class="login-container">
    <div class="login-card">
      <h2>Welcome Back!</h2>
      <p class="subtitle">Please sign in to your account</p>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">Username</label>
          <input
            type="text"
            id="username"
            v-model="username"
            placeholder="John Smith"
            :class="{ 'input-error': errors.username }"
            required
          />
          <span v-if="errors.username" class="error-text">{{ errors.username }}</span>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            v-model="password"
            placeholder="••••••••"
            :class="{ 'input-error': errors.password }"
            required
          />
          <span v-if="errors.password" class="error-text">{{ errors.password }}</span>
        </div>

        <button type="submit" :disabled="isLoading">
          <span v-if="isLoading">Signing in...</span>
          <span v-else>Sign In</span>
        </button>
      </form>

      <p v-if="errorMessage" class="global-error">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Reactive state for form fields
const username = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const errors = ref({ username: '', password: '' })

// Basic Client-Side Validation
const validateForm = () => {
  let isValid = true
  errors.value = { username: '', password: '' }

  if (password.value.length < 6) {
    errors.value.username = 'Please enter a valid username.'
    isValid = false
  }
  if (password.value.length < 6) {
    errors.value.password = 'Password must be at least 6 characters.'
    isValid = false
  }

  return isValid
}

// Form Submission Handler
const handleLogin = async () => {
  errorMessage.value = ''

  if (!validateForm()) return

  isLoading.value = true

  try {
    // Fake API Call Simulation
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        if (username.value === 'john smith' && password.value === 'password123') {
          resolve({ token: 'fake-jwt-token' })
        } else {
          reject(new Error('Invalid username or password.'))
        }
      }, 1500)
    })

    alert('Login successful!')
    // Redirect user or save token to local storage/Pinia here

  } catch (err) {
    errorMessage.value = err.message || 'Something went wrong.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f4f6f9;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.login-card {
  background: #ffffff;
  padding: 2.5rem;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h2 {
  margin-bottom: 0.5rem;
  color: #333;
  text-align: center;
}

.subtitle {
  color: #666;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 0.9rem;
}

.form-group {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
}

label {
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #444;
}

input {
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

input:focus {
  outline: none;
  border-color: #42b883; /* Vue green */
}

input.input-error {
  border-color: #ff5252;
}

.error-text {
  color: #ff5252;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.global-error {
  color: #ff5252;
  background-color: #ffebee;
  padding: 0.75rem;
  border-radius: 5px;
  text-align: center;
  margin-top: 1rem;
  font-size: 0.9rem;
}

button {
  width: 100%;
  padding: 0.75rem;
  background-color: #4784d8;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #2a435e;
}

button:disabled {
  background-color: #a8caeb;
  cursor: not-allowed;
}
</style>
