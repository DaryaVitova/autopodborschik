import { createRouter, createWebHashHistory } from 'vue-router'
import MainPageView from '@/views/MainPageView.vue'
import CreateAdView from '@/views/CreateAdView.vue'
import ShowAdView from '@/views/ShowAdView.vue'
import CardsView from '@/views/CardsView.vue'
import TableView from '@/views/TableView.vue'
import FavoritesAdView from "@/views/FavoritesAdView.vue";

const routes = [
  {
    path: '/',
    name: 'main',
    component: MainPageView,
    redirect: { name: 'cards' },
    children: [
      {
        path: 'table',
        name: 'table',
        component: TableView
      },
      {
        path: 'cards',
        name: 'cards',
        component: CardsView
      }
    ]
  },
  {
    path: '/createAd',
    name: 'createAd',
    component: CreateAdView
  },
  {
    path: '/showAd/:id',
    name: 'showAd',
    component: ShowAdView,
    props: true
  },
  {
    path: '/favorites',
    name: 'favorites',
    component: FavoritesAdView
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
