<template>
  <main class="new-password">
    <h1>Add Password</h1>

    <form @submit.prevent="save">
      <label>
        Website URL
        <div class="url-input">
          <input v-model="websiteUrl" type="url" placeholder="https://example.com" @input="updateIcon" required />
          <img v-if="iconPreview" :src="iconPreview" alt="icon" class="icon-preview" />
        </div>
        <small v-if="websiteName">Website: {{ websiteName }}</small>
      </label>

      <label>
        Username/Email
        <input v-model="username" type="text" required />
      </label>

      <label>
        Password
        <input v-model="password" type="password" required />
      </label>

      <button type="submit" :disabled="loading">
        {{ loading ? "Saving..." : "Save" }}
      </button>

      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="success" class="success">Saved! Redirecting...</p>
    </form>
  </main>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const username = ref("");
const password = ref("");
const websiteUrl = ref("");
const iconPreview = ref("");
const loading = ref(false);
const error = ref("");
const success = ref(false);
const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const websiteName = computed(() => {
  try {
    if (websiteUrl.value) {
      const hostname = new URL(websiteUrl.value).hostname;
      return hostname.replace(/^www\./, '').split('.')[0];
    }
    return '';
  } catch {
    return '';
  }
});

const updateIcon = () => {
  try {
    if (websiteUrl.value) {
      const url = new URL(websiteUrl.value);
      iconPreview.value = `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=64`;
    } else {
      iconPreview.value = "";
    }
  } catch {
    iconPreview.value = "";
  }
};

const save = async () => {
  loading.value = true;
  error.value = "";
  success.value = false;

  try {
    const res = await fetch(`${apiBase}/api/passwords`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        websiteUrl: websiteUrl.value,
        username: username.value,
        password: password.value
      })
    });

    if (!res.ok) throw new Error("Failed to save");

    success.value = true;
    username.value = "";
    password.value = "";
    websiteUrl.value = "";
    iconPreview.value = "";

    setTimeout(() => router.push("/"), 1500);
  } catch (e) {
    error.value = e.message || "Error";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.new-password {
  padding: 1rem;
}

form {
  display: grid;
  gap: 0.75rem;
  max-width: 420px;
}

label {
  display: grid;
  gap: 0.25rem;
  font-weight: 500;
}

small {
  color: #666;
  font-size: 0.85rem;
}

.url-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.url-input input {
  flex: 1;
}

.icon-preview {
  width: 32px;
  height: 32px;
  border-radius: 4px;
}

input, button {
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
}

.error {
  color: #b00020;
}

.success {
  color: #0b7a28;
}
</style>