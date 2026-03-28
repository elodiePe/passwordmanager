<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Navigation from './components/navigation.vue'
import HeaderLogo from './components/headerlogo.vue'
import SearchBar from './components/search-bar.vue'
import { setCurrentSessionId, getCurrentSessionId } from './composables/useSession'
import { isAuthenticated, logout } from './composables/useAuth'

const PM_CREDENTIAL_COPY_LOG_KEY_PREFIX = 'pm-study-credential-copy'
const PM_PAGE_SESSION_LOG_KEY_PREFIX = 'pm-study-password-page-session'

const route = useRoute()
const showSignOut = computed(() => route.path !== '/login' && isAuthenticated())

onMounted(() => {
  // Keep a normalized shared session id available across apps.
  setCurrentSessionId(getCurrentSessionId())
})

function signOut() {
  const confirmed = window.confirm('Are you sure you want to sign out?')
  if (!confirmed) return

  logout()
  window.location.assign('#/login')
}

function exportStudyLogs() {
  const sessionId = getCurrentSessionId()
  const credentialKey = `${PM_CREDENTIAL_COPY_LOG_KEY_PREFIX}:${sessionId}`
  const pageSessionKey = `${PM_PAGE_SESSION_LOG_KEY_PREFIX}:${sessionId}`

  let credentialCopy = []
  let passwordPageSessions = []

  try {
    const parsed = JSON.parse(window.localStorage.getItem(credentialKey) || '[]')
    credentialCopy = Array.isArray(parsed) ? parsed : []
  } catch {
    credentialCopy = []
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(pageSessionKey) || '[]')
    passwordPageSessions = Array.isArray(parsed) ? parsed : []
  } catch {
    passwordPageSessions = []
  }

  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    sessionId,
    credentialCopy,
    passwordPageSessions,
  }

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `pm-study-logs-${sessionId}.json`
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <HeaderLogo />
  <!-- <Navigation /> -->
  <!-- <button v-if="showSignOut" class="export-study-btn" @click="exportStudyLogs">
    Export PM Logs
  </button> -->
  <button v-if="showSignOut" class="signout-btn" @click="signOut">Sign out</button>

  <main class="main-content">
    <router-view />
  </main>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
}

.main-content {
  padding-top: 5.75rem;
  margin-top: 5.75rem;
  max-width: 5.75rem;
  padding: 1rem;
  max-width: 100%;
  box-sizing: border-box;
}

.signout-btn {
  position: fixed;
  top: 1.5rem;
  right: 1rem;
  z-index: 1100;
  border: 1px solid var(--color-border-input-alt);
  background: var(--color-surface);
  color: var(--color-text-primary);
  border-radius: 0.45rem;
  padding: 0.35rem 0.7rem;
  cursor: pointer;
}

.export-study-btn {
  position: fixed;
  top: 1.5rem;
  right: 6.7rem;
  z-index: 1100;
  border: 1px solid var(--color-border-input-alt);
  background: var(--color-surface);
  color: var(--color-text-primary);
  border-radius: 0.45rem;
  padding: 0.35rem 0.7rem;
  cursor: pointer;
}

@media (max-width: 480px) {
  .main-content {
    padding-top: 5.25rem;
    padding: 0.75rem;
    padding-bottom: 6rem;
  }
}
</style>
