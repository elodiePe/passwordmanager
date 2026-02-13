<template>
  <main class="password-accounts">
    <header>
      <router-link to="/" class="back-btn">
        <span class="material-symbols-rounded">arrow_back</span>
      </router-link>
      <div class="header-info">
        <img v-if="accounts[0]?.iconUrl" :src="accounts[0].iconUrl" alt="icon" class="website-icon" />
        <h1>{{ websiteName }}</h1>
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
      <span class="material-symbols-rounded">add</span>
      Add Another Account
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
  padding: 1rem;
}

header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
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
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
}
</style>