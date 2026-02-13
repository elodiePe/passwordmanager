<template>
  <nav class="navigation">
    <ul class="nav-list">
      <li>
        <router-link to="/" :class="{ active: isActive('/') }">
          <span class="material-symbols-rounded">key</span>
          <span>Passwords</span>
        </router-link>
      </li>
      <li>
        <router-link to="/settings" :class="{ active: isActive('/settings') }">
          <span class="material-symbols-rounded">settings</span>
          <span>Settings</span>
        </router-link>
      </li>

    </ul>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

const isActive = (path) => {
  return route.path === path
}

</script>

<style scoped>
.navigation {
  display: flex;
  width: 100%;
  height: 5.375rem;
  justify-content: center;
  align-items: center;
  align-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--Bg, #FEF0F0);
  box-shadow: 0 -4px 10px 0 rgba(0, 0, 0, 0.10);
  box-sizing: border-box;
}

.nav-list {
  list-style: none;
  display: flex;
  gap: 0;
  margin: 0;
  padding: 0;
  width: 100%;
  justify-content: center;
  flex-wrap: wrap;
}

.nav-list li {
  margin: 0;
  flex: 1;
  min-width: 120px;
  max-width: 200px;
}

.nav-list a {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.625rem 1rem;
  text-decoration: none;
  color: #333;
  font-weight: 500;
  transition: all 0.3s ease;
  border-radius: 0.3125rem;
  height: 100%;
  width: 100%;
  font-size: 0.875rem;
}

.material-symbols-rounded {
  font-size: 1.5rem;
  vertical-align: middle;
}

.nav-list a:hover {
  background-color: #e8e8e8;
}

.nav-list a.active {
  background-color: #1D3353;
  color: white;
}

/* Mobile responsiveness */
@media (max-width: 480px) {
  .nav-list a {
    padding: 0.5rem 0.5rem;
    font-size: 0.75rem;
  }
  
  .material-symbols-rounded {
    font-size: 1.25rem;
  }
  
  .nav-list li {
    min-width: 80px;
    max-width: 150px;
  }
}
</style>



