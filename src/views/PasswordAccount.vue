<template>
  <AccountInfoCard
    v-if="account"
    :account_name="account.username"
    :password="account.password"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import AccountInfoCard from '@/components/account-info-card.vue';

const route = useRoute();
const account = ref(null);

onMounted(async () => {
  const website = route.params.website;
  const accountName = route.params.accountId; // from router path
  const res = await fetch(`http://localhost:5000/api/passwords/${website}/${accountName}`);
  const data = await res.json();
  account.value = Array.isArray(data) ? data[0] : null;
});
</script>