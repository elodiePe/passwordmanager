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
       <router-link to="/newpassword" class="add-btn">
      <span class="material-symbols-rounded">add_2</span>
      New password
    </router-link>
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
.add-btn {
display: flex;
padding: 0.625rem;
justify-content: center;
align-items: center;
gap: 0.625rem;
position: fixed;
right: 1rem;
bottom: 12.875rem;
  border-radius: 12px;
background: #1D3353;
box-shadow: 5px 10px 10px 0 rgba(0, 0, 0, 0.25);
color: #FFF;
text-align: center;
font-family: Inter;
font-size: 0.9375rem;
font-style: normal;
font-weight: 400;
line-height: normal;
text-decoration: none;
}
</style>