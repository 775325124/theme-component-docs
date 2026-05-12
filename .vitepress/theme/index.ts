import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import './styles/vars.css'
import './styles/custom.css'
import Layout from './Layout.vue'

const theme: Theme = {
  extends: DefaultTheme,
  Layout,
}

export default theme
