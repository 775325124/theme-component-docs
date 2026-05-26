import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import './styles/vars.css'
import './styles/custom.css'
import Layout from './Layout.vue'
import MetafieldInstallerButton from './components/MetafieldInstallerButton.vue'

const theme: Theme = {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('MetafieldInstallerButton', MetafieldInstallerButton)
  },
}

export default theme
