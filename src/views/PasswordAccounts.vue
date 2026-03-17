<template>
  <main class="password-accounts">
    <header>
      <router-link to="/" class="back-btn">
        <span class="material-symbols-rounded">arrow_back</span>
      </router-link>
      <div class="header-info">
        <img
          v-if="accounts[0]?.iconUrl"
          :src="accounts[0].iconUrl"
          alt="icon"
          class="website-icon"
        />
        <div class="info_website">
          <h1>{{ websiteName }}</h1>
          <p>{{ accounts[0]?.websiteUrl || 'No URL' }}</p>
        </div>
      </div>


    </header>

    <section class="accounts-list">
      <div class="section-header">
      <h1 class="accounts-title">Accounts ({{ accounts.length }})</h1>
      <router-link to="/newpassword" class="add-btn ">
        <span class="material-symbols-rounded">add_2</span>
        New account
      </router-link>

      
      </div>
      <account-card
        v-for="account in accounts"
        :key="account._id"
        :account_name="account.username"
        :link="`/passwords/${websiteName}/${account._id}`"
      />
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AccountCard from '@/components/account-card.vue'

const route = useRoute()
const router = useRouter()
const accounts = ref([])
const showPassword = ref({})
const showMobileActions = ref(false)
const mobileActionsRef = ref(null)
const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '')

const websiteName = computed(() => route.params.website || 'Accounts')

onMounted(async () => {
  const res = await fetch(`${apiBase}/api/passwords/${route.params.website}`)
  accounts.value = await res.json()

  document.addEventListener('click', handleDocumentClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick)
})

const handleDocumentClick = (event) => {
  if (!mobileActionsRef.value) return
  if (!mobileActionsRef.value.contains(event.target)) {
    showMobileActions.value = false
  }
}

const toggleMobileActions = () => {
  showMobileActions.value = !showMobileActions.value
}

const closeMobileActions = () => {
  showMobileActions.value = false
}

const togglePassword = (id) => {
  showPassword.value[id] = !showPassword.value[id]
}
</script>

<style scoped>
.password-accounts {
  padding: 0;
}
header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-bottom: 0.75rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #eff1f4;
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
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  /* margin-bottom: 1rem; */
}
.accounts-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.accounts-title {
  margin: 0 0 0.25rem;
  color: #1d3353;
  font-family: Inter;
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.2;
}

.add-btn {
  display: flex;
  height: 2.5rem;
  padding: 0 0.875rem;
  justify-content: center;
  align-items: center;
  gap: 0.625rem;
  flex-shrink: 0;
  margin-left: auto;
  box-sizing: border-box;
  border-radius: 12px;
  background: var(--color-primary);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  color: #fff;
  text-align: center;
  font-family: Inter;
  font-size: 0.975rem;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  text-decoration: none;
}
.add-btn:hover {
  background: var(--color-primary-hovered);
}

.mobile-actions {
  display: none;
  position: relative;
  margin-left: auto;
}

.menu-trigger {
  border: none;
  border-radius: 10px;
  background: #f1f4f8;
  color: #1d3353;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
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
  min-width: 8rem;
}

.mobile-menu-link {
  display: block;
  text-decoration: none;
  color: #1d3353;
  font-family: Inter;
  font-size: 0.95rem;
  font-weight: 600;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
}

.mobile-menu-link:hover {
  background: #f1f4f8;
}

.material-symbols-rounded {
  width: 1.375rem;
  height: 1.375rem;
  aspect-ratio: 1/1;
}

@media (max-width: 720px) {
  .desktop-add-btn {
    display: none;
  }

  .mobile-actions {
    display: block;
  }
}
</style>
