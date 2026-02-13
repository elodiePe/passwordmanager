<template>
  <router-link :to="link" class="password-card">
    <div class="img-title">
      <img :src="imageSrc" :alt="`${title} Logo`" />
      <h1 class="password-title">{{ title }}</h1>
    </div>

    <span class="material-symbols-rounded">arrow_forward_ios</span>
  </router-link>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      required: true,
    },
    imageSrc: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      default: '/',
    },
  },
}
</script>
<style scoped>
.password-card {
  display: flex;
  width: 100%;
  padding: 0.4375rem 0.5rem;
  align-items: center;
  gap: 0.5rem;
  border-radius: 0.3125rem;
  background:  #fef0f0;
  box-shadow: 0 5px 6px 0 rgba(0, 0, 0, 0.25);
  justify-content: space-between;
  text-decoration: none;
}
/* .password-card:hover {
transform: translateY(-4px);
} */
.img-title {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}
.password-card img {
  display: flex;
  width: 3.75rem;
  height: 3.75rem;
  justify-content: center;
  align-items: center;
  aspect-ratio: 1/1;
  /* position: absolute; */
  left: 0.625rem;
}
.password-title {
  display: flex;
  width: 14.5625rem;
  padding: 0.0625rem 0;
  align-items: center;
  gap: 0.625rem;
  flex-shrink: 0;
  color: #2b2b2b;
  font-family: Inter;
  font-size: 0.9375rem;
  font-style:normal;
  font-weight: 600;
  line-height: normal;
}
.password-card .material-symbols-rounded {
  width: 1.5rem;
  height: 1.5rem;
  justify-content: center;
  color: #2b2b2b;
}
</style>
