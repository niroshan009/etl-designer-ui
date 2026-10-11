import { createApp } from 'vue'
import App from './App.vue'

import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

import 'vue-markdown-shiki/style'
import markdownPlugin from 'vue-markdown-shiki'
import './main.css'


createApp(App)
  .use(markdownPlugin)
  .mount('#app')

