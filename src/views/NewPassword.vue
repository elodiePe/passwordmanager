<template>
  <main class="new-password">
    <!-- <div class="header">
      <button class="back-button" type="button" @click="goBack" aria-label="Go back">
        <span class="material-symbols-rounded">arrow_back</span>
      </button>
      <h1>New password</h1>
    </div> -->

    <form @submit.prevent="save">
      <label>
        Website URL
        <div class="url-input">
          <input
            v-model="websiteUrl"
            type="url"
            placeholder="https://example.com"
            @input="updateIcon"
            required
          />
          <img v-if="iconPreview" :src="iconPreview" alt="icon" class="icon-preview" />
        </div>
        <small v-if="websiteName">Website: {{ websiteName }}</small>
      </label>

      <label>
        Username/Email
        <input v-model="username" type="text" required />
      </label>

      <label>
        Password
        <input v-model="password" type="password" required />
      </label>

      <div class="button-group">
           <button type="button" class="cancelBTN" @click="goBack">
          Cancel
        </button>
        <button type="submit" :disabled="loading">
          {{ loading ? 'Saving...' : 'Save' }}
        </button>
     
      </div>

      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="success" class="success">Saved! Redirecting...</p>
    </form>
  </main>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const username = ref('')
const password = ref('')
const websiteUrl = ref('')
const iconPreview = ref('')
const loading = ref(false)
const error = ref('')
const success = ref(false)
const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '')

const websiteName = computed(() => {
  try {
    if (websiteUrl.value) {
      const hostname = new URL(websiteUrl.value).hostname
      return hostname.replace(/^www\./, '').split('.')[0]
    }
    return ''
  } catch {
    return ''
  }
})

const updateIcon = () => {
  try {
    if (websiteUrl.value) {
      const url = new URL(websiteUrl.value)
      iconPreview.value = `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=64`
    } else {
      iconPreview.value = ''
    }
  } catch {
    iconPreview.value = ''
  }
}

const save = async () => {
  loading.value = true
  error.value = ''
  success.value = false

  try {
    const res = await fetch(`${apiBase}/api/passwords`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        websiteUrl: websiteUrl.value,
        username: username.value,
        password: password.value,
      }),
    })

    if (!res.ok) throw new Error('Failed to save')

    success.value = true
    username.value = ''
    password.value = ''
    websiteUrl.value = ''
    iconPreview.value = ''

    setTimeout(() => router.push('/'), 1500)
  } catch (e) {
    error.value = e.message || 'Error'
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.new-password {
  padding: 0;
}
header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
h1 {
  font-family: Inter;
  font-style: normal;
  font-weight: 600;
}
.back-button {
  background: transparent;
  border: none;
  color: #1d3353;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  margin-bottom: 0.5rem;
}
form {
  display: grid;
  gap: 0.9rem;
  max-width: 100%;
  background: #fff7f7;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

label {
  display: grid;
  gap: 0.35rem;
  font-family: Inter;
  font-size: 0.9375rem;
  font-style: normal;
  font-weight: 400;
}

small {
  color: #666;
  font-size: 0.85rem;
}

.url-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.url-input input {
  flex: 1;
}

.icon-preview {
  width: 32px;
  height: 32px;
  border-radius: 4px;
}

input {
  padding: 0.6rem 0.8rem;
  font-size: 1rem;
  border: 1px solid #e2dede;
  border-radius: 8px;
  background: #fff;
}

input:focus {
  outline: none;
  border-color: #1d3353;
  box-shadow: 0 0 0 3px rgba(29, 51, 83, 0.15);
}

button {
  padding: 0.7rem 1rem;
  font-size: 1rem;
  border: none;
  border-radius: 10px;
  background: #1d3353;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.08s ease,
    box-shadow 0.2s ease;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.cancelBTN {
  background: #b00020;
}
button:active {
  transform: translateY(1px);
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.button-group button {
  width: 100%;
}

.error {
  color: #b00020;
}

.success {
  color: #0b7a28;
}
</style>
