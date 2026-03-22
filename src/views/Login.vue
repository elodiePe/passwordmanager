<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { login } from '../composables/useAuth'

const route = useRoute()
const router = useRouter()

const username = ref('')
const password = ref('')
const errorMessage = ref('')

function submitLogin() {
  const isValid = login(username.value.trim(), password.value)

  if (!isValid) {
    errorMessage.value = 'Invalid username or password.'
    return
  }

  const redirectPath = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
  router.replace(redirectPath)
}
</script>

<template>
  <section class="login-layout">
    <form class="login-card" @submit.prevent="submitLogin">
      <h1>Password Manager Login</h1>

      <label for="password-manager-username">Username</label>
      <input
        id="password-manager-username"
        v-model="username"
        type="text"
        autocomplete="username"
        required
      />

      <label for="password-manager-password">Password</label>
      <input
        id="password-manager-password"
        v-model="password"
        type="password"
        autocomplete="current-password"
        required
      />

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

      <button type="submit">Enter Password Manager</button>
    </form>
  </section>
</template>

<style scoped>
.login-layout {
  min-height: calc(100vh - 5.75rem);
  display: grid;
  place-items: center;
  padding: 1rem;
}

.login-card {
  width: min(26rem, 100%);
  display: grid;
  gap: 0.65rem;
  padding: 1rem;
  border-radius: 0.75rem;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
}

.login-card h1 {
  margin: 0 0 0.5rem;
  font-size: 1.2rem;
  color: var(--color-primary);
}

.login-card input {
  border: 1px solid var(--color-border-input);
  border-radius: 0.45rem;
  padding: 0.55rem;
}

.login-card button {
  margin-top: 0.45rem;
  border: none;
  border-radius: 0.45rem;
  background: var(--color-primary);
  color: var(--color-primary-on);
  padding: 0.65rem;
  cursor: pointer;
}

.login-card button:hover {
  background: var(--color-primary-hovered);
}

.error {
  margin: 0;
  color: var(--color-danger-hovered);
}
</style>
