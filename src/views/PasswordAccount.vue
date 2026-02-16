<template>
  <header>
    <router-link :to="`/passwords/${account?.website}`" class="back-btn">
      <span class="material-symbols-rounded">arrow_back</span>
    </router-link>
    <div class="header-info">
      <img v-if="account?.iconUrl" :src="account.iconUrl" alt="icon" class="website-icon" />
      <div class="info_website">
        <h1>{{ account?.website }}</h1>
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
  <AccountInfoCard
    v-if="account && !isEditing"
    :account_name="account.username"
    :password="account.password"
  />

  <form v-if="account && isEditing" class="edit-form" @submit.prevent="saveAccount">
    <label>
      Username/Email
      <input v-model="formUsername" type="text" required />
    </label>
    <label>
      Password
      <input v-model="formPassword" type="text" required />
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

  <div class="action-buttons" v-if="account && !isEditing">
    <button @click="editAccount" class="btn btn-edit">
      <!-- <span class="material-symbols-rounded">edit</span> -->
       Edit
    </button>
    <button @click="deleteAccount" class="btn btn-delete">Delete</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AccountInfoCard from '@/components/account-info-card.vue'

const route = useRoute()
const router = useRouter()
const account = ref(null)
const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '')
const isEditing = ref(false)
const isSaving = ref(false)
const formUsername = ref('')
const formPassword = ref('')
const formError = ref('')

onMounted(async () => {
  const website = route.params.website
  const accountName = route.params.accountId // from router path
  const res = await fetch(`${apiBase}/api/passwords/${website}/${accountName}`)
  const data = await res.json()
  account.value = Array.isArray(data) ? data[0] : null
  if (account.value) {
    formUsername.value = account.value.username
    formPassword.value = account.value.password
  }
})

const editAccount = () => {
  formError.value = ''
  isEditing.value = true
}

const cancelEdit = () => {
  if (!account.value) return
  formUsername.value = account.value.username
  formPassword.value = account.value.password
  formError.value = ''
  isEditing.value = false
}

const saveAccount = async () => {
  if (!account.value) return
  isSaving.value = true
  formError.value = ''

  try {
    const res = await fetch(
      `${apiBase}/api/passwords/${account.value.website}/${account.value._id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formUsername.value,
          password: formPassword.value,
        }),
      },
    )

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
    const website = account.value.website
    const accountId = account.value._id
    const res = await fetch(`${apiBase}/api/passwords/${website}/${accountId}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      router.push(`/passwords/${website}`)
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
  margin-bottom: 1.5rem;
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
  width: 48px;
  height: 48px;
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
  background: #1d3353;
  color: #fff;
}

.btn-delete {
  background: #b00020;
  color: #fff;
}

.btn-cancel {
  background: #b00020;
  color: #fff;
}

.form-error {
  color: #b00020;
  margin: 0;
}
</style>
