import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/colors.css'
import './assets/local-icons.css'

const iconModules = import.meta.glob('./assets/icons/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
})

const iconUrlByName = Object.entries(iconModules).reduce((acc, [path, iconUrl]) => {
  const fileName = path
    .split('/')
    .pop()
    ?.replace(/\.svg$/i, '')
  if (fileName && typeof iconUrl === 'string') {
    acc[fileName] = iconUrl
  }
  return acc
}, {})

const ICON_NAME_ALIASES = {
  arrow_forward_ios: 'arrow_forward',
  close: 'close_24dp_000000_FILL0_wght400_GRAD0_opsz24',
  content_copy: 'content_copy_24dp_000000_FILL0_wght400_GRAD0_opsz24',
  visibility: 'visibility_24dp_000000_FILL0_wght400_GRAD0_opsz24',
  visibility_off: 'visibility_off_24dp_000000_FILL0_wght400_GRAD0_opsz24',
  warning: 'warning_24dp_B00020_FILL0_wght400_GRAD0_opsz24',
}

function resolveIconUrl(iconName) {
  const mappedName = ICON_NAME_ALIASES[iconName] || iconName
  return iconUrlByName[mappedName] || null
}

function hydrateLocalIcons(root = document) {
  const icons = root.querySelectorAll('.material-symbols-rounded')

  icons.forEach((iconNode) => {
    const iconName = String(iconNode.textContent || '').trim()
    const iconUrl = iconName ? resolveIconUrl(iconName) : null
    if (!iconName || !iconUrl) {
      iconNode.removeAttribute('data-local-icon')
      iconNode.style.removeProperty('--local-icon-url')
      iconNode.style.removeProperty('--local-icon-size')
      return
    }

    const computedStyles = window.getComputedStyle(iconNode)
    const computedWidth = computedStyles.width
    const computedHeight = computedStyles.height
    const computedFontSize = computedStyles.fontSize
    const iconSize =
      (computedWidth && computedWidth !== '0px' && computedWidth !== 'auto' && computedWidth) ||
      (computedHeight && computedHeight !== '0px' && computedHeight !== 'auto' && computedHeight) ||
      (computedFontSize && computedFontSize !== '0px' && computedFontSize) ||
      '1.5rem'

    iconNode.setAttribute('data-local-icon', 'true')
    iconNode.style.setProperty('--local-icon-url', `url("${iconUrl}")`)
    iconNode.style.setProperty('--local-icon-size', iconSize)

    if (!iconNode.getAttribute('aria-label')) {
      iconNode.setAttribute('aria-label', iconName.replace(/_/g, ' '))
    }
  })
}

function watchLocalIcons() {
  hydrateLocalIcons()

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList' || mutation.type === 'characterData') {
        hydrateLocalIcons()
        break
      }
    }
  })

  observer.observe(document.body, {
    subtree: true,
    childList: true,
    characterData: true,
  })
}

const app = createApp(App)

app.use(router)

app.mount('#app')

watchLocalIcons()
