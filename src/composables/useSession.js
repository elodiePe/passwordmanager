const EMAIL_SESSION_STORAGE_KEY = 'email-simulation-active-session'
const PM_SESSION_STORAGE_KEY = 'pm.activeSessionId'
const DEFAULT_SESSION_ID = 'default'

function normalizeSessionId(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .toLowerCase()
}

function getCurrentSessionId() {
  if (typeof window === 'undefined') return DEFAULT_SESSION_ID

  const emailSession = normalizeSessionId(window.localStorage.getItem(EMAIL_SESSION_STORAGE_KEY))
  if (emailSession) return emailSession

  const pmSession = normalizeSessionId(window.localStorage.getItem(PM_SESSION_STORAGE_KEY))
  if (pmSession) return pmSession

  return DEFAULT_SESSION_ID
}

function setCurrentSessionId(value) {
  if (typeof window === 'undefined') return DEFAULT_SESSION_ID

  const normalized = normalizeSessionId(value)
  const nextSessionId = normalized || DEFAULT_SESSION_ID

  window.localStorage.setItem(EMAIL_SESSION_STORAGE_KEY, nextSessionId)
  window.localStorage.setItem(PM_SESSION_STORAGE_KEY, nextSessionId)

  return nextSessionId
}

export { getCurrentSessionId, setCurrentSessionId, normalizeSessionId }
