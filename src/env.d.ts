
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Для Firebase
declare module 'firebase/app'
declare module 'firebase/auth'
declare module 'firebase/firestore'
declare module 'firebase/storage'
