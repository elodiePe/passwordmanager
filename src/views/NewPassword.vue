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
        Group Name
        <input v-model="groupName" type="text" placeholder="e.g. Work, Personal" required />
      </label>

      <label>
        Name
        <input v-model="title" type="text" placeholder="e.g. Work Github" required />
      </label>

      <label>
        Website URL
        <input v-model="websiteUrl" type="url" placeholder="https://example.com" required />
      </label>

      <label>
        Username/Email
        <input v-model="username" type="text" required />
      </label>

      <label>
        Password
        <input v-model="password" type="password" required />
      </label>

      <label>
        Image
        <div class="image-input-wrapper">
          <input type="file" accept="image/*" @change="handleImageUpload" />
          <div v-if="logoPreview" class="logo-preview-container">
            <img :src="logoPreview" alt="logo preview" class="logo-preview" />
            <button type="button" @click="clearImage" class="clear-btn">✕</button>
          </div>
          <p v-else class="placeholder-text">No image selected</p>
        </div>
      </label>

      <label>
        Link Key (for email linkage)
        <input v-model="credentialLinkKey" type="text" placeholder="e.g. github" />
        <small>Used to match `linkedCredentialWebsite` in the email simulation.</small>
      </label>

      <div class="button-group">
        <button type="button" class="cancelBTN" @click="goBack">Cancel</button>
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

const groupName = ref('')
const title = ref('')
const username = ref('')
const password = ref('')
const websiteUrl = ref('')
const logoPreview = ref('')
const logoFile = ref(null)
const credentialLinkKey = ref('')
const loading = ref(false)
const error = ref('')
const success = ref(false)
const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')

const effectiveCredentialLinkKey = computed(() => {
  const raw = credentialLinkKey.value || title.value || ''
  return String(raw)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9_-]/g, '')
})

const handleImageUpload = (event) => {
  const file = event.target.files?.[0]
  if (file) {
    logoFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      logoPreview.value = e.target?.result || ''
    }
    reader.readAsDataURL(file)
  }
}

const clearImage = () => {
  logoFile.value = null
  logoPreview.value = ''
}

const save = async () => {
  loading.value = true
  error.value = ''
  success.value = false

  try {
    let logoData = null

    if (logoFile.value) {
      const reader = new FileReader()
      logoData = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(logoFile.value)
      })
    }

    const res = await fetch(`${apiBase}/api/passwords`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        groupName: groupName.value,
        title: title.value,
        websiteUrl: websiteUrl.value,
        credentialLinkKey: effectiveCredentialLinkKey.value,
        username: username.value,
        password: password.value,
        logo: logoData,
      }),
    })

    if (!res.ok) throw new Error('Failed to save')

    success.value = true
    groupName.value = ''
    title.value = ''
    username.value = ''
    password.value = ''
    websiteUrl.value = ''
    logoPreview.value = ''
    logoFile.value = null
    credentialLinkKey.value = ''

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

.image-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.image-input-wrapper input[type='file'] {
  padding: 0.6rem 0.8rem;
  font-size: 0.95rem;
  border: 2px dashed #e2dede;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
}

.image-input-wrapper input[type='file']:hover {
  border-color: #1d3353;
}

.logo-preview-container {
  position: relative;
  width: fit-content;
}

.logo-preview {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid #e2dede;
}

.clear-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  padding: 0;
  border-radius: 50%;
  background: #b00020;
  color: #fff;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
}

.clear-btn:hover {
  background: #8b0000;
}

.placeholder-text {
  color: #999;
  font-size: 0.9rem;
  margin: 0;
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
