<script setup>
import Navigation from './components/navigation.vue'
import HeaderLogo from './components/headerlogo.vue'
import SearchBar from './components/search-bar.vue'
</script>

<template>
  <HeaderLogo />
  <Navigation />
 
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
  margin-top : 5.75rem;
  max-width: 5.75rem;
  padding: 1rem;
  max-width: 100%;
  box-sizing: border-box;
}

@media (max-width: 480px) {
  .main-content {
    padding-top: 5.25rem;
    padding: 0.75rem;
    padding-bottom: 6rem;
  }
}
</style>
