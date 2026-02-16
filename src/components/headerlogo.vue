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
  position: fixed;
  top: 0;
  left: 0;
  background: var(--Bg, #FEF0F0);
  box-sizing: border-box;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 80px;
  
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