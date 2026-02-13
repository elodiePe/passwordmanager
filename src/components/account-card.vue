<template>
  <router-link :to="link" class="account-card">
    <div class="account-info">
      <p class="account-name">{{ account_name }}</p>
    </div>
    <span class="material-symbols-rounded">arrow_forward_ios</span>
  </router-link>
</template>

<script>
export default {
  props: {
    account_name: {
      type: String,
      required: true
    },
    link: {
      type: String,
      required: true
    }
  }
}
</script>

<style scoped>
.account-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: #fff;
  border-radius: 8px;
    background:  #fef0f0;

  box-shadow: 0 5px 6px 0 rgba(0, 0, 0, 0.25);
  text-decoration: none;
  color: inherit;
}

.account-info {
 display: flex;
  /* width: 14.5625rem; */
  /* padding: 0.0625rem 0; */
  padding-left: 0.4rem;
  align-items: center;
  /* gap: 0.625rem; */
  flex-shrink: 0;
  color: #2b2b2b;
  font-family: Inter;
  font-size: 0.9375rem;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
}

/* .account-name {
  font-weight: 600;
  margin: 0;
} */

.material-symbols-rounded {
 width: 1.5rem;
  height: 1.5rem;
  justify-content: center;
  color: #2b2b2b;
}
</style>