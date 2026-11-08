import { createApp } from 'vue'
// @ts-expect-error Vue SFC type declarations are not configured in this project.
import App from './App.vue'

import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

import 'vue-markdown-shiki/style'
import VueMarkdownShiki from 'vue-markdown-shiki'
import './main.css'


createApp(App)
  .use(VueMarkdownShiki)
  .mount('#app')