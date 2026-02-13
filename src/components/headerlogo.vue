<template>
<div class="navigation">
    <img src="../assets/logo.svg" alt="Logo">
</div>
    </template> 
<script setup>

</script>
<style scoped>
.navigation {
  display: flex;
  width: 100%;
  padding: 1rem;
  justify-content: flex-start;
  align-items: center;
  position: relative;
  background: var(--Bg, #FEF0F0);
  box-sizing: border-box;
}

.navigation img {
  height: 60px;
  width: auto;
  max-width: 100%;
}

@media (max-width: 480px) {
  .navigation {
    padding: 0.75rem;
  }

  .navigation img {
    height: 50px;
  }
}
</style>