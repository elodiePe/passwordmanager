<template>
  <main class="password-accounts">
    <header>
      <router-link to="/" class="back-btn">
        <span class="material-symbols-rounded">arrow_back</span>
      </router-link>
      <div class="header-info">
        <img v-if="accounts[0]?.iconUrl" :src="accounts[0].iconUrl" alt="icon" class="website-icon" />
        <div class="info_website">
       <h1>{{ websiteName }}</h1>
       <p>{{ accounts[0]?.websiteUrl|| 'No URL' }}</p>
        </div>
 
      </div>
    </header>

    <section class="accounts-list">
         <account-card
            v-for="account in accounts" 
            :key="account._id" 
            :account_name="account.username"
            :link="`/passwords/${websiteName}/${account._id}`"
          />

    </section>

    <router-link to="/newpassword" class="add-btn">
      <span class="material-symbols-rounded">add_2</span>
      New password
    </router-link>
  </main>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AccountCard from '@/components/account-card.vue';

const route = useRoute();
const router = useRouter();
const accounts = ref([]);
const showPassword = ref({});
const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

const websiteName = computed(() => route.params.website || 'Accounts');

onMounted(async () => {
  const res = await fetch(`${apiBase}/api/passwords/${route.params.website}`);
  accounts.value = await res.json();
});

const togglePassword = (id) => {
  showPassword.value[id] = !showPassword.value[id];
};
</script>

<style scoped>
.password-accounts {
  padding: 0;
}
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

.accounts-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 2rem;
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
.material-symbols-rounded {
width: 1.375rem;
height: 1.375rem;
aspect-ratio: 1/1;
}
</style>