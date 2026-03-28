<template>
  <div class="top-controls">
    <h1 class="accounts-title">Your groups ({{ filteredGroups.length }})</h1>
    <div class="top-actions">
      <router-link to="/newpassword" class="add-btn">
        <span class="material-symbols-rounded">add_2</span>
        New password
      </router-link>
    </div>
  </div>

  <div class="groups-listing">
    <router-link
      v-for="group in filteredGroups"
      :key="group.name"
      class="group-card"
      :to="{ path: '/passwords', query: { group: group.name } }"
    >
      <div class="group-card-main">
        <img
          :src="group.logo || 'https://via.placeholder.com/60'"
          :alt="`${group.name} logo`"
          class="group-logo"
        />
        <div class="group-text">
          <h2 class="group-name">{{ group.name }}</h2>
          <p class="group-count">{{ group.count }} password(s)</p>
        </div>
      </div>
      <span class="material-symbols-rounded">arrow_forward_ios</span>
    </router-link>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const data = ref([])
const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')

function normalizePasswordList(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.items)) return payload.items
  return []
}

const uniqueGroups = computed(() => {
  const groups = new Map()
  data.value.forEach((item) => {
    if (!item || typeof item !== 'object') return
    const groupKey = item.groupName || 'Other'

    if (!groups.has(groupKey)) {
      groups.set(groupKey, {
        name: groupKey,
        count: 0,
        logo: item.logo || '',
      })
    }

    groups.get(groupKey).count += 1

    // Keep first non-empty logo for the group.
    if (!groups.get(groupKey).logo && item.logo) {
      groups.get(groupKey).logo = item.logo
    }
  })
  return Array.from(groups.values())
})

const filteredGroups = computed(() => uniqueGroups.value)

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
  justify-content: space-between;
  gap: 0.75rem;
}

.groups-listing {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
}

.group-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 0.9rem;
  border-radius: 10px;
  text-decoration: none;
  color: inherit;
  background: var(--color-card-password);
  box-shadow: 0 5px 6px 0 rgba(0, 0, 0, 0.25);
}

.group-card:hover {
  background: var(--color-card-hovered);
}

.group-card-main {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.group-logo {
  width: var(--logo-size);
  height: var(--logo-size);
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.group-text {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.group-name {
  margin: 0;
  color: var(--color-text-primary);
  font-family: Inter;
  font-size: 1.05rem;
  font-weight: 600;
}

.group-count {
  margin: 0;
  color: #6d6d6d;
  font-family: Inter;
  font-size: 0.86rem;
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

.top-actions {
  display: flex;
  align-items: center;
}

.material-symbols-rounded {
  width: 1.5rem;
  height: 1.5rem;
  aspect-ratio: 1/1;
}

@media (max-width: 720px) {
  .accounts-title {
    font-size: 1.1rem;
  }
}
</style>
