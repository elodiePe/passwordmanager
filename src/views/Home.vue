<template>
    <div>
        <SearchBar @search="handleSearch" />
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
import { ref, computed, onMounted } from 'vue';
import PasswordCard from '@/components/password-card.vue';
import SearchBar from '../components/search-bar.vue';

const data = ref([]);
const searchQuery = ref('');
const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

const uniqueWebsites = computed(() => {
  const websites = new Map();
  data.value.forEach(item => {
    if (!websites.has(item.website)) {
      websites.set(item.website, {
        name: item.website,
        iconUrl: item.iconUrl
      });
    }
  });
  return Array.from(websites.values());
});

const filteredWebsites = computed(() => {
  return uniqueWebsites.value.filter(website =>
    website.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const handleSearch = (query) => {
  searchQuery.value = query;
};

onMounted(async () => {
  const res = await fetch(`${apiBase}/api/passwords`);
  data.value = await res.json();
});
</script>

<style scoped>
.passwords-listing {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 1rem;
}
</style>