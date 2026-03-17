<template>
  <main class="admin-page">
    <h1>Admin</h1>
    <p>Select which password manager mode to open.</p>

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
import { useRouter } from 'vue-router'

const router = useRouter()

const goToManager = (mode) => {
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
