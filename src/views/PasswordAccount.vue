<template>
  <header>
    <router-link :to="backToListLink" class="back-btn">
      <span class="material-symbols-rounded">arrow_back</span>
    </router-link>
    <div class="header-info">
      <img v-if="account?.logo" :src="account.logo" alt="icon" class="website-icon" />
      <div class="info_website">
        <h1>{{ account?.title || 'Account' }}</h1>
        <a
          v-if="account?.websiteUrl"
          :href="account.websiteUrl"
          target="_blank"
          class="website-link"
        >
          <p>{{ account.websiteUrl }}</p>
          <!-- <span class="material-symbols-rounded">open_in_new</span> -->
        </a>
        <p v-else>No URL</p>
      </div>
    </div>
  </header>
  <p v-if="isLoading">Loading account...</p>
  <p v-else-if="loadError" class="form-error">{{ loadError }}</p>

  <div v-else class="copied-message" v-show="showCopiedMessage">Copied to clipboard!</div>
  <div class="section-header">
    <h1 class="accounts-title">Account informations</h1>
    <div class="action-buttons desktop-actions" v-if="account && !isEditing">
      <button @click="handleEditAction" class="btn btn-edit">Edit</button>
      <button @click="handleDeleteAction" class="btn btn-delete">Delete</button>
    </div>

    <div class="mobile-actions" v-if="account && !isEditing" ref="mobileActionsRef">
      <button
        class="menu-trigger"
        type="button"
        aria-label="Open account actions"
        @click="toggleMobileActions"
      >
        <img
          src="@/assets/icons/more_vert_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg"
          alt="More actions"
          class="icon"
        />
      </button>
      <div v-if="showMobileActions" class="mobile-menu">
        <button @click="handleEditAction" class="btn btn-edit" type="button">Edit</button>
        <button @click="handleDeleteAction" class="btn btn-delete" type="button">Delete</button>
      </div>
    </div>
  </div>

  <AccountInfoCard
    v-if="account && !isEditing"
    :account_name="account.username"
    :password="account.password"
    :account-website="account.website"
    :account-credential-link-key="account.credentialLinkKey"
    :account-id="account._id"
    :require-challenge="requireChallenge"
    @copied="handleCopied"
  />

  <form v-if="account && isEditing" class="edit-form" @submit.prevent="saveAccount">
    <label>
      Group Name
      <input v-model="formGroupName" type="text" required />
    </label>
    <label>
      Title
      <input v-model="formTitle" type="text" required />
    </label>
    <label>
      Website URL
      <input v-model="formWebsiteUrl" type="url" required />
    </label>
    <label>
      Username/Email
      <input v-model="formUsername" type="text" required />
    </label>
    <label>
      Password
      <input v-model="formPassword" type="text" required />
    </label>
    <label>
      Link Key
      <input v-model="formCredentialLinkKey" type="text" placeholder="e.g. github" />
    </label>

    <label>
      Logo
      <div class="image-input-wrapper">
        <input type="file" accept="image/*" @change="handleEditImageUpload" />
        <div v-if="formLogoPreview" class="logo-preview-container">
          <img :src="formLogoPreview" alt="logo preview" class="logo-preview" />
          <button type="button" @click="clearEditImage" class="clear-btn">x</button>
        </div>
        <p v-else class="placeholder-text">No image selected</p>
      </div>
    </label>

    <p v-if="formError" class="form-error">{{ formError }}</p>
    <div class="action-buttons">
      <button type="submit" class="btn btn-edit" :disabled="isSaving">
        {{ isSaving ? 'Saving...' : 'Save' }}
      </button>
      <button type="button" class="btn btn-cancel" @click="cancelEdit" :disabled="isSaving">
        Cancel
      </button>
    </div>
  </form>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AccountInfoCard from '@/components/account-info-card.vue'
import { getCurrentSessionId } from '../composables/useSession'

const route = useRoute()
const router = useRouter()
const account = ref(null)
const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')
const PM_PAGE_SESSION_LOG_KEY_PREFIX = 'pm-study-password-page-session'
const ACTION_PIN_CODE = '2324'
const isEditing = ref(false)
const isSaving = ref(false)
const formGroupName = ref('')
const formTitle = ref('')
const formWebsiteUrl = ref('')
const formUsername = ref('')
const formPassword = ref('')
const formCredentialLinkKey = ref('')
const formLogoPreview = ref('')
const formLogoData = ref(null)
const formError = ref('')
const showMobileActions = ref(false)
const mobileActionsRef = ref(null)
const requireChallenge = ref(true)

const showCopiedMessage = ref(false)
let copiedTimer = null
const isLoading = ref(true)
const loadError = ref('')
const pageOpenedAtMs = ref(null)
const pageSessionLogged = ref(false)

const appendLocalStudyEvent = (keyPrefix, sessionId, event) => {
  if (!sessionId) return
  const storageKey = `${keyPrefix}:${sessionId}`

  try {
    const existing = JSON.parse(window.localStorage.getItem(storageKey) || '[]')
    const history = Array.isArray(existing) ? existing : []
    history.push(event)
    window.localStorage.setItem(storageKey, JSON.stringify(history))
  } catch {
    window.localStorage.setItem(storageKey, JSON.stringify([event]))
  }
}

const backToListLink = computed(() => {
  const group = String(route.query.group || account.value?.groupName || '').trim()
  if (!group) return '/passwords'
  return { path: '/passwords', query: { group } }
})

const handleCopied = () => {
  showCopiedMessage.value = true
  if (copiedTimer) clearTimeout(copiedTimer)
  copiedTimer = setTimeout(() => {
    showCopiedMessage.value = false
  }, 2000)
}

onUnmounted(() => {
  void flushPasswordPageSession('route-leave')
  if (copiedTimer) clearTimeout(copiedTimer)
  window.removeEventListener('beforeunload', handleBeforeUnload)
  document.removeEventListener('click', handleDocumentClick)
})

onMounted(async () => {
  const managerMode = window.localStorage.getItem('pm.managerMode')
  requireChallenge.value = managerMode !== 'A'

  isLoading.value = true
  loadError.value = ''

  try {
    const accountId = route.params.accountId

    let payload = null
    let res = await fetch(`${apiBase}/api/passwords/${accountId}`)

    if (res.ok) {
      payload = await res.json()
    }

    // Compatibility fallback for older deployed API shape: /api/passwords/:website/:accountId
    if (!res.ok || Array.isArray(payload)) {
      const website = String(route.query.website || '').trim()
      if (website) {
        const legacyRes = await fetch(`${apiBase}/api/passwords/${website}/${accountId}`)
        if (legacyRes.ok) {
          payload = await legacyRes.json()
        }
      }
    }

    const normalizedAccount = Array.isArray(payload) ? payload[0] || null : payload
    account.value =
      normalizedAccount && typeof normalizedAccount === 'object' ? normalizedAccount : null

    if (!account.value) throw new Error('Account not found')

    formTitle.value = account.value.title || ''
    formGroupName.value = account.value.groupName || 'Other'
    formWebsiteUrl.value = account.value.websiteUrl || ''
    formUsername.value = account.value.username || ''
    formPassword.value = account.value.password || ''
    formCredentialLinkKey.value = account.value.credentialLinkKey || ''
    formLogoPreview.value = account.value.logo || ''
    formLogoData.value = account.value.logo || null
    pageOpenedAtMs.value = Date.now()
    pageSessionLogged.value = false
  } catch (error) {
    loadError.value = error.message || 'Failed to load account'
    account.value = null
  } finally {
    isLoading.value = false
  }

  document.addEventListener('click', handleDocumentClick)
  window.addEventListener('beforeunload', handleBeforeUnload)
})

const handleBeforeUnload = () => {
  void flushPasswordPageSession('beforeunload')
}

const flushPasswordPageSession = async (exitReason) => {
  if (pageSessionLogged.value) return
  if (!account.value) return
  if (typeof pageOpenedAtMs.value !== 'number') return

  pageSessionLogged.value = true

  const endedAtMs = Date.now()
  const payload = {
    sessionId: getCurrentSessionId(),
    managerMode: window.localStorage.getItem('pm.managerMode') || 'unknown',
    website: account.value.website || String(route.params.website || ''),
    accountId: account.value._id || String(route.params.accountId || ''),
    startedAtMs: pageOpenedAtMs.value,
    endedAtMs,
    exitReason,
  }

  appendLocalStudyEvent(PM_PAGE_SESSION_LOG_KEY_PREFIX, payload.sessionId, payload)

  try {
    await fetch(`${apiBase}/api/study/password-page-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    })
  } catch {
    // Ignore logging failures so user flow is never blocked.
  }
}

const handleDocumentClick = (event) => {
  if (!mobileActionsRef.value) return
  if (!mobileActionsRef.value.contains(event.target)) {
    showMobileActions.value = false
  }
}

const toggleMobileActions = () => {
  showMobileActions.value = !showMobileActions.value
}

const requestActionPin = (actionLabel) => {
  const enteredPin = window.prompt(`Enter PIN to ${actionLabel}:`)
  if (enteredPin === null) return false

  if (String(enteredPin).trim() !== ACTION_PIN_CODE) {
    window.alert('Incorrect PIN.')
    return false
  }

  return true
}

const handleEditAction = () => {
  showMobileActions.value = false
  if (!requestActionPin('edit this password')) return
  editAccount()
}

const handleDeleteAction = () => {
  showMobileActions.value = false
  if (!requestActionPin('delete this password')) return
  deleteAccount()
}

const editAccount = () => {
  formError.value = ''
  showMobileActions.value = false
  isEditing.value = true
}

const cancelEdit = () => {
  if (!account.value) return
  formGroupName.value = account.value.groupName || 'Other'
  formTitle.value = account.value.title || ''
  formWebsiteUrl.value = account.value.websiteUrl || ''
  formUsername.value = account.value.username
  formPassword.value = account.value.password
  formCredentialLinkKey.value = account.value.credentialLinkKey || ''
  formLogoPreview.value = account.value.logo || ''
  formLogoData.value = account.value.logo || null
  formError.value = ''
  isEditing.value = false
}

const handleEditImageUpload = (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const result = e.target?.result || ''
    formLogoPreview.value = result
    formLogoData.value = result || null
  }
  reader.readAsDataURL(file)
}

const clearEditImage = () => {
  formLogoPreview.value = ''
  formLogoData.value = null
}

const saveAccount = async () => {
  if (!account.value) return
  isSaving.value = true
  formError.value = ''

  try {
    const res = await fetch(`${apiBase}/api/passwords/${account.value._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        groupName: formGroupName.value,
        title: formTitle.value,
        websiteUrl: formWebsiteUrl.value,
        username: formUsername.value,
        password: formPassword.value,
        credentialLinkKey: formCredentialLinkKey.value,
        logo: formLogoData.value,
      }),
    })

    if (!res.ok) {
      throw new Error('Failed to update account')
    }

    const updated = await res.json()
    account.value = updated
    isEditing.value = false
  } catch (error) {
    formError.value = error.message || 'Failed to update account'
  } finally {
    isSaving.value = false
  }
}

const deleteAccount = async () => {
  if (confirm('Are you sure you want to delete this account?')) {
    const groupName = String(route.query.group || account.value.groupName || '').trim()
    const accountId = account.value._id
    const res = await fetch(`${apiBase}/api/passwords/${accountId}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      if (groupName) {
        router.push({ path: '/passwords', query: { group: groupName } })
      } else {
        router.push('/passwords')
      }
    } else {
      alert('Failed to delete account')
    }
  }
}
</script>
<style scoped>
header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-bottom: 0.75rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #eff1f4;
}
.accounts-title {
  margin: 0;
  color: #1d3353;
  font-family: Inter;
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.2;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1rem;
}
.info_website {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  font-family: Inter;
}
.info_website p {
  font-size: 0.875rem;
  color: #666;
  margin: 0;
}
.info_website h1 {
  font-size: 1.5rem;
  margin: 0;
}
.back-btn {
  text-decoration: none;
  color: #333;
}
a {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #1d3353;
  text-decoration: none;
}
/* a .material-symbols-rounded {
  width: 0.5rem;
  height: 0.5rem;
  aspect-ratio: 1/1;
} */
.header-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.website-icon {
  width: var(--logo-size);
  height: var(--logo-size);
  aspect-ratio: 1 / 1;
  object-fit: cover;
  flex-shrink: 0;
  border-radius: 8px;
}

.edit-form {
  display: grid;
  gap: 0.85rem;
  margin: 0.75rem 0 1rem;
  background: #fff7f7;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}
.material-symbols-rounded {
  width: 1.375rem;
  height: 1.375rem;
  aspect-ratio: 1/1;
}
.edit-form label {
  display: grid;
  gap: 0.25rem;
  font-family: Inter;
  font-size: 0.9375rem;
  font-style: normal;
  font-weight: 400;
}

.edit-form input {
  padding: 0.6rem 0.8rem;
  font-size: 1rem;
  border: 1px solid #e2dede;
  border-radius: 8px;
  background: #fff;
}

.image-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.logo-preview-container {
  position: relative;
  width: fit-content;
}

.logo-preview {
  width: var(--logo-size);
  height: var(--logo-size);
  border-radius: 8px;
  object-fit: cover;
}

.clear-btn {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 1.2rem;
  height: 1.2rem;
  border: none;
  border-radius: 999px;
  background: #b00020;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.placeholder-text {
  margin: 0;
  color: #666;
  font-size: 0.85rem;
}

.edit-form input:focus {
  outline: none;
  border-color: #1d3353;
  box-shadow: 0 0 0 3px rgba(29, 51, 83, 0.15);
}

.action-buttons {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.5rem;
}

.desktop-actions {
  flex-direction: row;
  align-items: center;
}

.desktop-actions .btn {
  width: auto;
  min-width: 5.5rem;
}

.mobile-actions {
  display: none;
  position: relative;
}

.menu-trigger {
  border: none;
  border-radius: 10px;
  background: #ffff;
  color: #1d3353;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.menu-trigger:hover {
  background: #f1f4f8;
}

.mobile-menu {
  position: absolute;
  right: 0;
  top: calc(100% + 0.4rem);
  z-index: 10;
  background: #fff;
  border: 1px solid #e2dede;
  border-radius: 10px;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.12);
  padding: 0.4rem;
  min-width: 7rem;
  display: grid;
  gap: 0.4rem;
}

.mobile-menu .btn {
  width: 100%;
}

.btn {
  padding: 0.7rem 1rem;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  justify-content: center;
  transition:
    transform 0.08s ease,
    box-shadow 0.2s ease;
}

.btn:active {
  transform: translateY(1px);
}

.btn-edit {
  background: var(--color-primary);
  color: #fff;
}
.btn-edit:hover {
  background: var(--color-primary-hovered);
}

.btn-delete {
  background: var(--color-danger);
  color: #fff;
}
.btn-delete:hover {
  background: var(--color-danger-hovered);
  color: #fff;
}
.btn-cancel {
  background: var(--color-danger);
  color: #fff;
}
.btn-cancel:hover {
  background: var(--color-danger-hovered);
  color: #fff;
}
.form-error {
  color: #b00020;
  margin: 0;
}

.copied-message {
  margin: 0.5rem 0 1rem;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  background: #e8f3ff;
  color: #1d3353;
  font-size: 0.9rem;
}

@media (max-width: 720px) {
  .desktop-actions {
    display: none;
  }

  .mobile-actions {
    display: block;
  }
}
</style>
