<template>
  <main class="admin-page">
    <h1>Admin</h1>
    <p>Select which password manager mode to open.</p>

    <label class="session-field" for="session-id">Shared session ID</label>
    <div class="session-actions">
      <input id="session-id" v-model="sessionInput" type="text" placeholder="default" />
      <button type="button" class="session-btn" @click="applySession">Use Session</button>
    </div>
    <p class="session-current">
      Current session: <strong>{{ currentSession }}</strong>
    </p>

    <div class="admin-actions">
      <button type="button" class="manager-btn manager-a" @click="goToManager('A')">
        Go To Password Manager A
      </button>
      <button type="button" class="manager-btn manager-b" @click="goToManager('B')">
        Go To Password Manager B
      </button>
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getCurrentSessionId, setCurrentSessionId } from '../composables/useSession'

const router = useRouter()
const currentSession = ref(getCurrentSessionId())
const sessionInput = ref(currentSession.value)

const applySession = () => {
  currentSession.value = setCurrentSessionId(sessionInput.value)
  sessionInput.value = currentSession.value
}

const goToManager = (mode) => {
  applySession()
  window.localStorage.setItem('pm.managerMode', mode)
  router.push('/')
}
</script>

<style scoped>
.admin-page {
  padding: 0;
}

.admin-page h1 {
  margin: 0 0 0.5rem;
  color: #1d3353;
  font-family: Inter;
  font-size: 1.5rem;
  font-weight: 700;
}

.admin-page p {
  margin: 0 0 1rem;
  color: #666;
  font-family: Inter;
}

.session-field {
  display: block;
  margin-bottom: 0.375rem;
  color: #1d3353;
  font-family: Inter;
  font-size: 0.875rem;
  font-weight: 600;
}

.session-actions {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.session-actions input {
  height: 2.375rem;
  border: 1px solid #d8dfe8;
  border-radius: 10px;
  padding: 0 0.75rem;
  font-family: Inter;
}

.session-btn {
  border: none;
  border-radius: 10px;
  padding: 0 0.875rem;
  background: #eff4fb;
  color: #1d3353;
  font-family: Inter;
  font-weight: 600;
  cursor: pointer;
}

.session-current {
  margin: 0 0 1rem;
}

.admin-actions {
  display: grid;
  gap: 0.75rem;
}

.manager-btn {
  border: none;
  border-radius: 12px;
  padding: 0.8rem 1rem;
  color: #fff;
  font-family: Inter;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

.manager-a {
  background: #1d3353;
}

.manager-b {
  background: #b00020;
}
</style>
