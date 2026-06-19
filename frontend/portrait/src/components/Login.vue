<template>
  <div class="login-wrapper">
    <div class="login-card" :class="{ 'dark-mode-card': isDark }">
      <h2>P👁rtra👁t {{ isRegistering ? 'Register' : 'Auth' }}</h2>
      <p class="subtitle">
        {{ isRegistering ? 'Provision a new identity layout' : 'Access your secure workspace environment' }}
      </p>

      <form @submit.prevent="handleSubmit" novalidate class="login-form">
        <div class="form-group" :class="{ 'has-error': errors.username && touched.username }">
          <label for="username">Username</label>
          <input
            id="username"
            type="text"
            v-model="form.username"
            @blur="touched.username = true"
            @input="validateUsername"
            placeholder="System username"
            autocomplete="username"
          />
          <span v-if="errors.username && touched.username" class="error-text">
            ⚠️ {{ errors.username }}
          </span>
        </div>

        <div class="form-group" :class="{ 'has-error': errors.password && touched.password }">
          <label for="password">Password</label>
          <input
            id="password"
            type="password"
            v-model="form.password"
            @blur="touched.password = true"
            @input="validatePassword"
            placeholder="••••••••"
            autocomplete="current-password"
          />
          <span v-if="errors.password && touched.password" class="error-text">
            ⚠️ {{ errors.password }}
          </span>
        </div>

        <div v-if="apiMessage" class="api-success-banner">
          ✅ {{ apiMessage }}
        </div>
        <div v-if="apiError" class="api-error-banner">
          ❌ {{ apiError }}
        </div>

        <button
          type="submit"
          class="submit-btn"
          :disabled="isSubmitting || hasValidationErrors"
        >
          <span v-if="isSubmitting">Syncing Payload...</span>
          <span v-else>{{ isRegistering ? 'Register Account +' : 'Authenticate →' }}</span>
        </button>

        <div class="toggle-mode-container">
          <button type="button" class="link-btn" @click="toggleMode">
            {{ isRegistering ? 'Already have an account? Log In' : 'Need an identity profile? Create Account' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

defineProps({
  isDark: { type: Boolean, default: true }
})

const API_URL = 'https://localhost:4430/api'

const isRegistering = ref(false)
const isSubmitting = ref(false)
const apiError = ref('')
const apiMessage = ref('')

const form = reactive({ username: '', password: '' })
const touched = reactive({ username: false, password: false })
const errors = reactive({ username: '', password: '' })

const validateUsername = () => {
  if (!form.username) {
    errors.username = 'Username is required.'
  } else if (form.username.includes(' ')) {
    errors.username = 'Username cannot contain spaces.'
  } else if (form.username.trim().length < 3) {
    errors.username = 'Username must be at least 3 characters long.'
  } else {
    errors.username = ''
  }
}

const validatePassword = () => {
  if (!form.password) {
    errors.password = 'Password input cannot be blank.'
  } else if (form.password.length < 6) {
    errors.password = 'Password requires at least 6 characters.'
  } else {
    errors.password = ''
  }
}

const hasValidationErrors = computed(() => {
  const usernameInvalid = !form.username || form.username.includes(' ') || form.username.trim().length < 3
  const passwordInvalid = !form.password || form.password.length < 6
  return usernameInvalid || passwordInvalid || !!errors.username || !!errors.password
})

const toggleMode = () => {
  isRegistering.value = !isRegistering.value
  apiError.value = ''
  apiMessage.value = ''
  // Clear layout inputs safely
  form.username = ''
  form.password = ''
  touched.username = false
  touched.password = false
  errors.username = ''
  errors.password = ''
}

const handleSubmit = async () => {
  touched.username = true
  touched.password = true
  validateUsername()
  validatePassword()

  if (hasValidationErrors.value) return

  isSubmitting.value = true
  apiError.value = ''
  apiMessage.value = ''

  // Shift target route based on structural functional state
  const endpoint = isRegistering.value ? 'register' : 'login'

  try {
    const response = await fetch(`${API_URL}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: form.username, password: form.password })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Transaction rejected by security matrix.')
    }

    if (isRegistering.value) {
      apiMessage.value = 'Profile created! Switching to login pipeline...'
      setTimeout(() => {
        toggleMode()
      }, 2000)
    } else {
      console.log('Login successful! Authorized session metadata payload received:', data)
      // Save your data.token to localStorage and push to main dashboard canvas view here
    }
  } catch (err) {
    apiError.value = err.message || 'Network sync timeout encountered.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.login-wrapper {
  display: flex; justify-content: center; align-items: center; width: 100vw; height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
.login-card {
  width: 100%; max-width: 400px; padding: 2.5rem; border: 2px solid #333; border-radius: 8px;
  background: rgba(255, 255, 255, 0.95); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08); transition: all 0.3s ease;
}
h2 { margin: 0 0 0.5rem 0; font-size: 1.8rem; font-weight: 800; letter-spacing: 2px; text-align: center; color: #111; }
.subtitle { margin: 0 0 2rem 0; font-size: 0.9rem; color: #666; text-align: center; }
.login-form { display: flex; flex-direction: column; gap: 1.25rem; }
.form-group { display: flex; flex-direction: column; gap: 0.35rem; }
.form-group label { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: #444; letter-spacing: 0.5px; }
.form-group input { padding: 0.75rem; border: 2px solid #333; border-radius: 4px; font-size: 1rem; outline: none; background: #fff; }
.form-group input:focus { border-color: #4784d8; }
.form-group.has-error input { border-color: #ef5350 !important; background-color: rgba(255, 235, 235, 0.3); }
.error-text { font-size: 0.75rem; color: #d32f2f; font-weight: 600; }
.api-error-banner { padding: 0.75rem; border: 2px solid #c62828; background: #ffebee; color: #c62828; border-radius: 4px; font-size: 0.85rem; font-weight: 600; }
.api-success-banner { padding: 0.75rem; border: 2px solid #2e7d32; background: #e8f5e9; color: #2e7d32; border-radius: 4px; font-size: 0.85rem; font-weight: 600; }
.submit-btn { margin-top: 0.5rem; padding: 0.85rem; background: #333; color: white; border: none; border-radius: 4px; font-size: 1rem; font-weight: 700; cursor: pointer; }
.submit-btn:disabled { background: #ccc; color: #777; cursor: not-allowed; }
.toggle-mode-container { text-align: center; margin-top: 0.5rem; }
.link-btn { background: none; border: none; color: #4784d8; font-size: 0.85rem; font-weight: 600; cursor: pointer; text-decoration: underline; }

/* DARK MODE THEME INJECTIONS */
.dark-mode-card { background: rgba(20, 20, 22, 0.95) !important; border-color: #444 !important; color: #e0e0e0; }
.dark-mode-card h2 { color: #fff; }
.dark-mode-card .subtitle { color: #aaa; }
.dark-mode-card .form-group label { color: #bbb; }
.dark-mode-card .form-group input { background: #1a1a1c; border-color: #444; color: #fff; }
.dark-mode-card .form-group input:focus { border-color: #64b5f6; }
.dark-mode-card .form-group.has-error input { background-color: rgba(198, 40, 40, 0.15); border-color: #ef5350 !important; }
.dark-mode-card .error-text { color: #ff8a80; }
.dark-mode-card .api-error-banner { background: rgba(198, 40, 40, 0.25); border-color: #ef5350; color: #ff8a80; }
.dark-mode-card .api-success-banner { background: rgba(46, 125, 50, 0.25); border-color: #66bb6a; color: #a5d6a7; }
.dark-mode-card .submit-btn { background: #444; color: #fff; }
.dark-mode-card .submit-btn:disabled { background: #2a2a2c; color: #555; }
</style>
