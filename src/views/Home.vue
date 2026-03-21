<template>
  <div class="top-controls">
    <h1 class="accounts-title">Your passwords ({{ filteredWebsites.length }})</h1>
    <div class="search-new">
      <div class="search-wrapper">
        <SearchBar class="desktop-only-search" @search="handleSearch" />
      </div>
      <router-link to="/newpassword" class="add-btn">
        <span class="material-symbols-rounded">add_2</span>
        New password
      </router-link>
    </div>
  </div>
  <div class="search-wrapper">
      <SearchBar class="mobile-only-search" @search="handleSearch" />

  </div>

  <div>
    <div class="passwords-listing">
      <PasswordCard
        v-for="website in filteredWebsites"
        :key="website.name"
        :title="website.name"
        :imageSrc="website.iconUrl || 'https://via.placeholder.com/60'"
        :link="`/passwords/${website.name}`"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import PasswordCard from '@/components/password-card.vue'
import SearchBar from '../components/search-bar.vue'

const data = ref([])
const searchQuery = ref('')
const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')

function normalizePasswordList(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.items)) return payload.items
  return []
}

const uniqueWebsites = computed(() => {
  const websites = new Map()
  data.value.forEach((item) => {
    if (!item || typeof item !== 'object' || !item.website) return
    if (!websites.has(item.website)) {
      websites.set(item.website, {
        name: item.website,
        iconUrl: item.iconUrl,
      })
    }
  })
  return Array.from(websites.values())
})

const filteredWebsites = computed(() => {
  return uniqueWebsites.value.filter((website) =>
    website.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

const handleSearch = (query) => {
  searchQuery.value = query
}

onMounted(async () => {
  try {
    const res = await fetch(`${apiBase}/api/passwords`)
    const payload = await res.json()
    data.value = normalizePasswordList(payload)
  } catch {
    data.value = []
  }
})
</script>

<style scoped>
.top-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.search-wrapper {
  flex: 1;
  min-width: 0;
}

.search-wrapper :deep(.search-bar) {
  width: 100%;
  height: 2.5rem;
  box-sizing: border-box;
}

.passwords-listing {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
}

.add-btn {
  display: flex;
  height: 2.5rem;
  padding: 0 0.875rem;
  justify-content: center;
  align-items: center;
  gap: 0.625rem;
  flex-shrink: 0;
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
  color: #fff;
}
.accounts-title {
  margin: 0;
  color: #1d3353;
  font-family: Inter;
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.2;
}
.search-new {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-left: auto;
}

.mobile-only-search {
  display: none;
}

@media (max-width: 720px) {
  .mobile-only-search {
    display: flex;
    width: 100%;
    margin-top: 1rem;
  }

  .desktop-only-search {
    display: none;
  }
}
</style>
