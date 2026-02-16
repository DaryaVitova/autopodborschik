<template>
  <svg width="28" height="28" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Градиентный круг-фон -->
    <circle cx="28" cy="28" r="24" fill="url(#bgCircle)" stroke="url(#borderGradient)" stroke-width="1.5"/>

    <!-- Автомобиль -->
    <path d="M40 24H16C14.8954 24 14 24.8954 14 26V34C14 35.1046 14.8954 36 16 36H40C41.1046 36 42 35.1046 42 34V26C42 24.8954 41.1046 24 40 24Z" fill="url(#autoGradient)" stroke="#2563EB" stroke-width="1.2"/>

    <!-- Окна автомобиля -->
    <path d="M34 20H22C20.8954 20 20 20.8954 20 22V24C20 25.1046 20.8954 24 22 24H34C35.1046 24 36 25.1046 36 24V22C36 20.8954 35.1046 20 34 20Z" fill="#93C5FD"/>

    <!-- Колеса -->
    <circle cx="20" cy="34" r="4" fill="#111827"/>
    <circle cx="20" cy="34" r="2" fill="url(#wheelGradient)"/>
    <circle cx="36" cy="34" r="4" fill="#111827"/>
    <circle cx="36" cy="34" r="2" fill="url(#wheelGradient)"/>

    <!-- Денежный символ в центре -->
    <circle cx="28" cy="22" r="6" fill="url(#moneyGradient)" stroke="#059669" stroke-width="1"/>
    <path d="M25 22H31M28 19V25" stroke="white" stroke-width="2" stroke-linecap="round"/>

    <!-- Блестящие элементы -->
    <circle cx="44" cy="22" r="2" fill="#FCD34D"/>
    <circle cx="44" cy="22" r="1" fill="#FEF3C7"/>

    <defs>
      <linearGradient id="bgCircle" x1="4" y1="4" x2="52" y2="52" gradientUnits="userSpaceOnUse">
        <stop stop-color="#DBEAFE"/>
        <stop offset="1" stop-color="#BFDBFE"/>
      </linearGradient>

      <linearGradient id="borderGradient" x1="4" y1="4" x2="52" y2="52" gradientUnits="userSpaceOnUse">
        <stop stop-color="#3B82F6"/>
        <stop offset="1" stop-color="#1D4ED8"/>
      </linearGradient>

      <linearGradient id="autoGradient" x1="14" y1="24" x2="42" y2="36" gradientUnits="userSpaceOnUse">
        <stop stop-color="#60A5FA"/>
        <stop offset="1" stop-color="#3B82F6"/>
      </linearGradient>

      <radialGradient id="wheelGradient" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(20 34) rotate(90) scale(2)">
        <stop stop-color="#6B7280"/>
        <stop offset="1" stop-color="#9CA3AF"/>
      </radialGradient>

      <linearGradient id="moneyGradient" x1="22" y1="16" x2="34" y2="28" gradientUnits="userSpaceOnUse">
        <stop stop-color="#34D399"/>
        <stop offset="1" stop-color="#10B981"/>
      </linearGradient>
    </defs>
  </svg>
</template>

<style scoped>
svg {
  @media (max-width: 1023px) {
    width: 22px;
    height: 22px;
  }
  @media (max-width: 767px) {
    width: 20px;
    height: 20px;
  }
}
</style>
