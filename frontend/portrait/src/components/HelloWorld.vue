<template>
  <div class="login-container">
    <div class="login-card">
      <h2>{{ isLogin ? 'Welcome Back!' : 'Create an Account' }}</h2>
      <p class="subtitle">
        {{ isLogin ? 'Please sign in to your account' : 'Sign up to get started' }}
      </p>

      <form @submit.prevent="handleSubmit">
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

        <div v-if="!isLogin" class="form-group">
          <label for="email">Email Address</label>
          <input
            type="email"
            id="email"
            v-model="email"
            placeholder="john@example.com"
            :class="{ 'input-error': errors.email }"
            required
          />
          <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
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

        <div v-if="!isLogin" class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            v-model="confirmPassword"
            placeholder="••••••••"
            :class="{ 'input-error': errors.confirmPassword }"
            required
          />
          <span v-if="errors.confirmPassword" class="error-text">{{ errors.confirmPassword }}</span>
        </div>

        <button type="submit" :disabled="isLoading">
          <span v-if="isLoading">Processing...</span>
          <span v-else>{{ isLogin ? 'Sign In' : 'Register' }}</span>
        </button>
      </form>

      <p v-if="errorMessage" class="global-error">{{ errorMessage }}</p>
      <p v-if="successMessage" class="global-success">{{ successMessage }}</p>

      <div class="toggle-footer">
        <p v-if="isLogin">
          Don't have an account?
          <a href="#" @click.prevent="toggleState">Create an account</a>
        </p>
        <p v-else>
          Already have an account?
          <a href="#" @click.prevent="toggleState">Sign in</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// UI State
const isLogin = ref(true) // true = Login Form, false = Sign Up Form
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Form Fields
const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')

// Field-Specific Errors
const errors = ref({ username: '', email: '', password: '', confirmPassword: '' })

// Reset form fields and errors when switching views
const toggleState = () => {
  isLogin.value = !isLogin.value
  username.value = ''
  email.value = ''
  password.value = ''
  confirmPassword.value = ''
  errorMessage.value = ''
  successMessage.value = ''
  errors.value = { username: '', email: '', password: '', confirmPassword: '' }
}

// Client-side validation logic
const validateForm = () => {
  let isValid = true
  errors.value = { username: '', email: '', password: '', confirmPassword: '' }

  if (username.value.trim().length < 3) {
    errors.value.username = 'Username must be at least 3 characters.'
    isValid = false
  }

  if (password.value.length < 6) {
    errors.value.password = 'Password must be at least 6 characters.'
    isValid = false
  }

  // Sign up specific rules
  if (!isLogin.value) {
    if (!email.value.includes('@')) {
      errors.value.email = 'Please enter a valid email address.'
      isValid = false
    }
    if (password.value !== confirmPassword.value) {
      errors.value.confirmPassword = 'Passwords do not match.'
      isValid = false
    }
  }

  return isValid
}

// Direct submission to proper endpoint
const handleSubmit = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (!validateForm()) return

  isLoading.value = true

  try {
    if (isLogin.value) {
      // --- Handle Login Process ---
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (username.value === 'john smith' && password.value === 'password123') {
            resolve()
          } else {
            reject(new Error('Invalid username or password.'))
          }
        }, 1200)
      })
      alert('Login Successful!')
    } else {
      // --- Handle Registration Process ---
      await new Promise((resolve) => setTimeout(resolve, 1200))
      successMessage.value = 'Account created successfully! You can now log in.'
      isLogin.value = true // automatically kick them to login view
    }
  } catch (err) {
    errorMessage.value = err.message || 'An error occurred.'
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
  width: 100vw;
  height: 100vh;
  background-color: #f4f6f9;
  box-sizing: border-box;
}

.login-card {
  background: #ffffff;
  padding: 2.5rem;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  box-sizing: border-box;
}

h2, .subtitle {
  text-align: center;
}

h2 {
  margin-bottom: 0.5rem;
  color: #333;
}

.subtitle {
  color: #666;
  margin-bottom: 2rem;
  font-size: 0.9rem;
}

.form-group {
  margin-bottom: 1.25rem;
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
  border-color: #4784d8;
}

input.input-error {
  border-color: #ff5252;
}

.error-text {
  color: #ff5252;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.global-error, .global-success {
  padding: 0.75rem;
  border-radius: 5px;
  text-align: center;
  margin-top: 1rem;
  font-size: 0.9rem;
}

.global-error {
  color: #ff5252;
  background-color: #ffebee;
}

.global-success {
  color: #2e7d32;
  background-color: #e8f5e9;
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
  margin-top: 0.5rem;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #2a435e;
}

button:disabled {
  background-color: #a8caeb;
  cursor: not-allowed;
}

.toggle-footer {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.9rem;
}

.toggle-footer a {
  color: #4784d8;
  text-decoration: none;
  font-weight: 600;
}

.toggle-footer a:hover {
  text-decoration: underline;
}
</style>
