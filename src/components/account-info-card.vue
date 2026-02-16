<template>
  <div class="account-card">
    <div class="username-part">
      <div class="account-info">
        <p class="account-name">{{ account_name }}</p>
      </div>
      <button @click="copyToClipboard(account_name)" class="icon-btn">
        <span class="material-symbols-rounded">content_copy</span>
      </button>
    </div>
    <div class="password-part">
      <div class="account-info">
        <p class="account-name">{{ isPasswordVisible ? password : '••••••••' }}</p>
      </div>

        <div class="password-section">
                <button @click="togglePasswordVisibility" class="icon-btn">
             <span class="material-symbols-rounded">
          {{ isPasswordVisible ? 'visibility_off' : 'visibility' }}
        </span>
      </button>
      <button @click="copyToClipboard(password)" class="icon-btn">
        <span class="material-symbols-rounded">content_copy</span>
      </button>
        </div>
     
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  account_name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

const isPasswordVisible = ref(false);

const togglePasswordVisibility = () => {
  isPasswordVisible.value = !isPasswordVisible.value;
};

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text);
};
</script>

<style scoped>
.account-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.5rem;
  background: #fef0f0;
  border-radius: 8px;
  box-shadow: 0 5px 6px 0 rgba(0, 0, 0, 0.25);
  margin-bottom: 2rem;
}

.username-part,
.password-part {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}
.password-section {
  display: flex;
  gap: 0.5rem;
}
.account-info {
  display: flex;
  padding-left: 0.4rem;
  align-items: center;
  flex-shrink: 0;
  color: #2b2b2b;
  font-family: Inter;
  font-size: 0.9375rem;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
}

.account-name {
  margin: 0;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.material-symbols-rounded {
  width: 1.5rem;
  height: 1.5rem;
  color: #2b2b2b;
}
</style>