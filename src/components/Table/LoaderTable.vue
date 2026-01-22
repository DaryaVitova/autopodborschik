<template>
  <div class="wheel-loader">
    <div class="wheels-container">
      <div class="wheel"></div>
      <div class="wheel"></div>
    </div>
    <div class="loading-text">
      Загрузка<span class="dots"></span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.wheel-loader {
  text-align: center;
  margin-top: 50px;
}

.wheels-container {
  display: flex;
  justify-content: center;
  gap: 80px;
  margin-bottom: 30px;
}

.wheel {
  width: 80px;
  height: 80px;
  border: 8px solid #2c3e50;
  border-top: 8px solid transparent;
  border-radius: 50%;
  animation: wheel-spin 1.5s linear infinite;
  position: relative;
}

.wheel::before {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  background: #2c3e50;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.wheel::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 8px;
  background: #2c3e50;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
}

.wheel:nth-child(2) {
  border-color: #2c72a1;
  animation-delay: -0.5s;
}

.wheel:nth-child(2)::after {
  background: #2c72a1;
}

.loading-text {
  color: #2c3e50;
  font-size: 18px;
  font-weight: bold;
}

.dots::after {
  content: '';
  animation: dots 1.5s steps(3, end) infinite;
}

@keyframes wheel-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dots {
  0%, 20% { content: '.'; }
  40% { content: '..'; }
  60%, 100% { content: '...'; }
}
</style>
