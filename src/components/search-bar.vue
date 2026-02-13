<template>
  <div class="search-bar">
    <span class="material-symbols-rounded">search</span>
    <input
      v-model="searchQuery"
      type="text"
      placeholder="Search for a password..."
      aria-label="Search"
      @input="$emit('search', searchQuery)"
    />
  </div>
</template>

<script>
export default {
  name: 'SearchBar',
  data() {
    return {
      searchQuery: ''
    }
  }
}
</script>

<style scoped>
.search-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #fff;
  /* border: 1px solid #e0e0e0;
  border-radius: 9999px; */
  padding: 0.5rem 0.875rem;
  /* margin-top:1rem; */
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
}

.search-bar input {
  border: none;
  outline: none;
  width: 100%;
  font-size: 0.95rem;
  background: transparent;
}

.material-symbols-rounded {
  font-size: 1.25rem;
  color: #555;
}
</style>