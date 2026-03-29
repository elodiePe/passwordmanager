<template>
  <div class="account-card">
    <div class="username-part">
      <div class="account-info">
        <p class="account-label">Username</p>
        <p class="account-name">{{ account_name }}</p>
      </div>
      <button @click="requestSensitiveAction('copyUsername')" class="icon-btn" type="button">
        <span class="material-symbols-rounded">content_copy</span>
      </button>
    </div>
    <div class="divider" style="height: 1px; background: #e0e0e0"></div>
    <div class="password-part">
      <div class="account-info">
        <p class="account-label">Password</p>
        <p class="account-name">{{ isPasswordVisible ? password : '••••••••' }}</p>
      </div>

      <div class="password-section">
        <button @click="requestSensitiveAction('togglePassword')" class="icon-btn" type="button">
          <span class="material-symbols-rounded">
            {{ isPasswordVisible ? 'visibility_off' : 'visibility' }}
          </span>
        </button>
        <button @click="requestSensitiveAction('copyPassword')" class="icon-btn" type="button">
          <span class="material-symbols-rounded">content_copy</span>
        </button>
      </div>
    </div>
  </div>
  <div v-if="showChallenge" class="challenge-box">
    <button @click="cancelChallenge" class="challenge-close-btn" type="button">
      <span class="material-symbols-rounded">close</span>
    </button>

    <div class="challenge-header">
      <span class="material-symbols-rounded attention-icon">warning</span>
      <h1>Action Required</h1>
    </div>

    <div class="challenge-task">
      <template v-if="challengeType === 'text'">
        <p class="challenge-text">
          Never share your passwords or access any accounts on non-official websites, as scammers
          often impersonate legitimate services to steal your credentials.
          <br /><br />
          To continue, type: {{ currentTextPrompt }}
        </p>
        <input
          v-model="challengeInput"
          type="text"
          class="challenge-input"
          :placeholder="`Type: ${currentTextPrompt}`"
        />
      </template>

      <template v-else-if="challengeType === 'slider'">
        <!-- http://aag-it.com/the-latest-phishing-statistics/ -->
        <p class="challenge-text">
          Did you know that phishing is the most commom form of cyber crime, with an estimated 3.4
          billion span emails sent daily? <br /><br />
          <!-- 83% of UK businesses that suffered a cyber attack in 2022 reported the attack type as
          phishing. <br /><br /> -->
          To continue, move the slide to {{ sliderTarget }}.
        </p>
        <input
          v-model.number="sliderValue"
          type="range"
          min="0"
          max="100"
          step="1"
          class="challenge-slider"
        />
        <div class="slider-values">
          <span>0</span>
          <span>{{ sliderValue }}</span>
          <span>100</span>
        </div>
      </template>

      <template v-else-if="challengeType === 'timer'">
        <p class="challenge-text">
          {{ currentTimerMessage }}
        </p>
        <p class="challenge-text timer-countdown">Continue available in {{ timerSecondsLeft }}s</p>
      </template>

      <template v-else-if="challengeType === 'phrase'">
        <p class="challenge-text">
          Tap the words in the correct order: {{ currentPhraseTargetWords.join(' ') }}
        </p>
        <div class="phrase-selected">
          <span v-if="selectedPhraseWords.length === 0" class="phrase-placeholder"
            >No words selected yet</span
          >
          <span v-else>{{ selectedPhraseWords.join(' ') }}</span>
        </div>
        <div class="phrase-bank">
          <button
            v-for="(word, index) in phraseWordBank"
            :key="`${word}-${index}`"
            type="button"
            class="phrase-word"
            @click="selectPhraseWord(index)"
          >
            {{ word }}
          </button>
        </div>
        <div class="phrase-controls">
          <button type="button" class="btn-secondary" @click="undoPhraseWord">Undo</button>
          <button type="button" class="btn-secondary" @click="clearPhraseSelection">Clear</button>
        </div>
      </template>

      <template v-else-if="challengeType === 'domain'">
        <p class="challenge-text">
          {{ currentDomainQuestion }}
        </p>
        <div class="domain-options">
          <label v-for="option in domainOptions" :key="option" class="domain-option">
            <input v-model="selectedDomain" type="radio" name="domain-challenge" :value="option" />
            <span>{{ option }}</span>
          </label>
        </div>
      </template>

      <template v-else>
        <p class="challenge-text">Challenge is unavailable. Please close and try again.</p>
      </template>

      <p v-if="challengeError" class="challenge-error">{{ challengeError }}</p>

      <div class="challenge-actions">
        <button
          class="btn-confirm"
          type="button"
          :disabled="isTimerConfirmDisabled"
          @click="confirmChallenge"
        >
          {{ confirmButtonLabel }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { getCurrentSessionId } from '../composables/useSession'
import { useGlobalChallenge } from '../composables/useGlobalChallenge'

const props = defineProps({
  account_name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  accountWebsite: {
    type: String,
    default: '',
  },
  accountCredentialLinkKey: {
    type: String,
    default: '',
  },
  accountId: {
    type: String,
    default: '',
  },
  requireChallenge: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['copied'])

const SLIDER_TOLERANCE = 2
const TIMER_WAIT_SECONDS = 5
const PM_FRICTION_LOG_KEY_PREFIX = 'pm-positive-friction-log'
const PM_CREDENTIAL_COPY_LOG_KEY_PREFIX = 'pm-study-credential-copy'
const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')

const appendLocalStudyEvent = (keyPrefix, sessionId, event) => {
  if (!sessionId) return
  const storageKey = `${keyPrefix}:${sessionId}`

  try {
    const existing = JSON.parse(window.localStorage.getItem(storageKey) || '[]')
    const history = Array.isArray(existing) ? existing : []
    history.push(event)
    window.localStorage.setItem(storageKey, JSON.stringify(history))
  } catch {
    window.localStorage.setItem(storageKey, JSON.stringify([event]))
  }
}

const isPasswordVisible = ref(false)

const showChallenge = ref(false)
const challengeType = ref('text')
const challengeInput = ref('')
const challengeError = ref('')
const sliderValue = ref(0)
const sliderTarget = ref(50)
const currentTextPrompt = ref('I am not being scammed')

const selectedDomain = ref('')
const domainOptions = ref([])
const currentDomainQuestion = ref('')
const currentDomainAnswer = ref('')
const currentTimerMessage = ref('')
const currentPhraseTargetWords = ref([])
const selectedPhraseWords = ref([])
const phraseWordBank = ref([])
const timerSecondsLeft = ref(0)
const pendingAction = ref(null)

const {
  challengePlan,
  challengePlanPosition,
  challengeValidUntilMs,
  challengeGrantAccountKey,
  ensureChallengePlan,
  syncChallengePlanWithLogin,
  shuffle,
  randomInt,
  TEXT_PROMPTS,
  TIMER_MESSAGES,
  PHRASE_CHALLENGES,
  DOMAIN_QUESTIONS,
} = useGlobalChallenge()
const challengeStartedAtMs = ref(null)
const actionRequestedAtMs = ref(null)
const challengeAttemptCount = ref(0)
let timerIntervalId = null

const isTimerConfirmDisabled = computed(
  () => challengeType.value === 'timer' && timerSecondsLeft.value > 0,
)

const confirmButtonLabel = computed(() => {
  if (challengeType.value === 'timer' && timerSecondsLeft.value > 0) {
    return `Continue (${timerSecondsLeft.value}s)`
  }
  return 'Continue'
})

const stopTimerChallenge = () => {
  if (timerIntervalId !== null) {
    window.clearInterval(timerIntervalId)
    timerIntervalId = null
  }
}

const startTimerChallenge = () => {
  stopTimerChallenge()
  timerSecondsLeft.value = TIMER_WAIT_SECONDS

  timerIntervalId = window.setInterval(() => {
    if (timerSecondsLeft.value <= 1) {
      timerSecondsLeft.value = 0
      stopTimerChallenge()
      return
    }

    timerSecondsLeft.value -= 1
  }, 1000)
}

const getAccountGrantKey = () => {
  return (
    props.accountId ||
    props.accountCredentialLinkKey ||
    props.accountWebsite ||
    props.account_name ||
    ''
  )
}

const hasActiveChallengeGrant = () => {
  const currentAccountKey = getAccountGrantKey()

  if (
    challengeValidUntilMs.value > 0 &&
    challengeGrantAccountKey.value !== '' &&
    challengeGrantAccountKey.value === currentAccountKey
  ) {
    return true
  }

  return false
}

const postCredentialCopyEvent = async (
  actionType,
  outcome,
  challengeDurationSeconds,
  challengeAttempts,
) => {
  if (
    actionType !== 'copyPassword' &&
    actionType !== 'copyUsername' &&
    actionType !== 'togglePassword'
  )
    return

  const completedAtMs = Date.now()
  const requestedAtMs =
    typeof actionRequestedAtMs.value === 'number' ? actionRequestedAtMs.value : completedAtMs
  const durationMs = Math.max(0, completedAtMs - requestedAtMs)
  const durationSeconds = durationMs / 1000

  console.log('[StudyTiming] Credential copy timing', {
    actionType,
    outcome,
    requestedAtMs,
    completedAtMs,
    durationMs,
    durationSeconds,
    challengeDurationSeconds:
      typeof challengeDurationSeconds === 'number' ? challengeDurationSeconds : null,
    challengeAttempts: typeof challengeAttempts === 'number' ? challengeAttempts : null,
  })

  const payload = {
    sessionId: getCurrentSessionId(),
    managerMode: window.localStorage.getItem('pm.managerMode') || 'unknown',
    website: props.accountWebsite || null,
    credentialLinkKey: props.accountCredentialLinkKey || null,
    accountId: props.accountId || null,
    actionType,
    challengeType: typeof challengeDurationSeconds === 'number' ? challengeType.value : null,
    challengeDurationSeconds:
      typeof challengeDurationSeconds === 'number' ? challengeDurationSeconds : null,
    challengeAttempts: typeof challengeAttempts === 'number' ? challengeAttempts : null,
    requestedAtMs,
    completedAtMs,
    durationMs,
    durationSeconds,
    outcome,
  }

  appendLocalStudyEvent(PM_CREDENTIAL_COPY_LOG_KEY_PREFIX, payload.sessionId, payload)

  try {
    await fetch(`${apiBase}/api/study/credential-copy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    })
  } catch {
    // Ignore logging failures so user action is not blocked.
  }

  actionRequestedAtMs.value = null
}

const saveChallengeEvent = (outcome) => {
  if (challengeStartedAtMs.value === null) return

  const completedAtMs = Date.now()
  const durationMs = Math.max(0, completedAtMs - challengeStartedAtMs.value)
  const durationSeconds = durationMs / 1000
  const sessionId = getCurrentSessionId()
  const logKey = `${PM_FRICTION_LOG_KEY_PREFIX}:${sessionId}`

  const event = {
    sessionId,
    challengeType: challengeType.value,
    action: pendingAction.value,
    outcome,
    attempts: challengeAttemptCount.value,
    startedAtMs: challengeStartedAtMs.value,
    completedAtMs,
    durationMs,
    durationSeconds,
  }

  try {
    const existing = JSON.parse(window.localStorage.getItem(logKey) || '[]')
    const history = Array.isArray(existing) ? existing : []
    history.push(event)
    window.localStorage.setItem(logKey, JSON.stringify(history))
  } catch {
    window.localStorage.setItem(logKey, JSON.stringify([event]))
  }

  challengeStartedAtMs.value = null
  console.log('[StudyTiming] Challenge timing', {
    action: pendingAction.value,
    outcome,
    startedAtMs: event.startedAtMs,
    completedAtMs,
    durationMs,
    durationSeconds,
    challengeType: challengeType.value,
    attempts: challengeAttemptCount.value,
  })
  return durationSeconds
}

const pickUnique = (arr, count) => shuffle(arr).slice(0, Math.min(count, arr.length))

const initPhraseChallenge = () => {
  const fallbackWords = PHRASE_CHALLENGES[0] || ['Check', 'the', 'URL']
  const sourceWords =
    Array.isArray(currentPhraseTargetWords.value) && currentPhraseTargetWords.value.length > 0
      ? currentPhraseTargetWords.value
      : fallbackWords

  selectedPhraseWords.value = []
  phraseWordBank.value = shuffle([...sourceWords])
}

const selectPhraseWord = (index) => {
  if (index < 0 || index >= phraseWordBank.value.length) return
  const [word] = phraseWordBank.value.splice(index, 1)
  selectedPhraseWords.value.push(word)
}

const undoPhraseWord = () => {
  if (selectedPhraseWords.value.length === 0) return
  const lastWord = selectedPhraseWords.value.pop()
  phraseWordBank.value.push(lastWord)
}

const clearPhraseSelection = () => {
  const fallbackWords = PHRASE_CHALLENGES[0] || ['Check', 'the', 'URL']
  const sourceWords =
    Array.isArray(currentPhraseTargetWords.value) && currentPhraseTargetWords.value.length > 0
      ? currentPhraseTargetWords.value
      : fallbackWords

  selectedPhraseWords.value = []
  phraseWordBank.value = shuffle([...sourceWords])
}

const buildDomainChallenge = (selectedQuestion) => {
  if (!selectedQuestion) return

  const fakePool = shuffle(selectedQuestion.lookalikes).slice(0, 3)
  currentDomainQuestion.value = selectedQuestion.prompt
  currentDomainAnswer.value = selectedQuestion.correct
  domainOptions.value = shuffle([selectedQuestion.correct, ...fakePool])
  selectedDomain.value = ''
}

const pickNextChallenge = () => {
  ensureChallengePlan()
  const planItem = challengePlan.value[challengePlanPosition.value]
  if (!planItem) return

  stopTimerChallenge()
  challengeType.value = planItem.type
  challengeInput.value = ''
  challengeError.value = ''
  challengeAttemptCount.value = 0
  sliderValue.value = 0
  selectedDomain.value = ''
  domainOptions.value = []
  currentPhraseTargetWords.value = []
  selectedPhraseWords.value = []
  phraseWordBank.value = []

  if (challengeType.value === 'text') {
    currentTextPrompt.value = planItem.prompt || TEXT_PROMPTS[0]
  } else if (challengeType.value === 'slider') {
    sliderTarget.value = randomInt(10, 90)
  } else if (challengeType.value === 'timer') {
    currentTimerMessage.value = planItem.message || TIMER_MESSAGES[0]
    startTimerChallenge()
  } else if (challengeType.value === 'domain') {
    buildDomainChallenge(planItem.question)
  } else if (challengeType.value === 'phrase') {
    currentPhraseTargetWords.value =
      Array.isArray(planItem.words) && planItem.words.length > 0
        ? planItem.words
        : PHRASE_CHALLENGES[0] || ['Check', 'the', 'URL']
    initPhraseChallenge()
  }
}

const togglePasswordVisibility = () => {
  isPasswordVisible.value = !isPasswordVisible.value
}

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    emit('copied')
    return true
  } catch (error) {
    console.error('Failed to copy text:', error)
    return false
  }
}

const runAction = async (action) => {
  if (action === 'togglePassword') {
    togglePasswordVisibility()
    return { success: true, isTrackedAction: true }
  } else if (action === 'copyPassword') {
    const success = await copyToClipboard(props.password)
    return { success, isTrackedAction: true }
  } else if (action === 'copyUsername') {
    const success = await copyToClipboard(props.account_name)
    return { success, isTrackedAction: true }
  }

  return { success: false, isTrackedAction: false }
}

const requestSensitiveAction = async (action) => {
  syncChallengePlanWithLogin()
  actionRequestedAtMs.value = Date.now()

  if (action === 'copyUsername') {
    const result = await runAction(action)
    if (result.isTrackedAction) {
      await postCredentialCopyEvent(action, result.success ? 'completed' : 'failed', null, 0)
    }
    return
  }

  if (!props.requireChallenge) {
    const result = await runAction(action)
    if (result.isTrackedAction) {
      await postCredentialCopyEvent(action, result.success ? 'completed' : 'failed', null, 0)
    }
    return
  }

  if (action !== 'copyUsername' && hasActiveChallengeGrant()) {
    const result = await runAction(action)
    if (result.isTrackedAction) {
      await postCredentialCopyEvent(action, result.success ? 'completed' : 'failed', null, 0)
    }
    return
  }

  if (action === 'togglePassword' && isPasswordVisible.value) {
    const result = await runAction(action)
    if (result.isTrackedAction) {
      await postCredentialCopyEvent(action, result.success ? 'completed' : 'failed', null, 0)
    }
    return
  }

  if (!showChallenge.value) {
    pendingAction.value = action
    pickNextChallenge()
    challengeStartedAtMs.value = Date.now()
    showChallenge.value = true
  }
}

const confirmChallenge = async () => {
  challengeAttemptCount.value += 1

  if (challengeType.value === 'text') {
    if (challengeInput.value.trim() !== currentTextPrompt.value) {
      challengeError.value = 'Text does not match.'
      return
    }
  } else if (challengeType.value === 'slider') {
    if (Math.abs(sliderValue.value - sliderTarget.value) > SLIDER_TOLERANCE) {
      challengeError.value = `Slider is not at ${sliderTarget.value}.`
      return
    }
  } else if (challengeType.value === 'timer') {
    if (timerSecondsLeft.value > 0) {
      challengeError.value = `Please wait ${timerSecondsLeft.value} second(s) before continuing.`
      return
    }
  } else if (challengeType.value === 'phrase') {
    if (selectedPhraseWords.value.join(' ') !== currentPhraseTargetWords.value.join(' ')) {
      challengeError.value = 'The phrase order is incorrect.'
      return
    }
  } else if (challengeType.value === 'domain') {
    if (selectedDomain.value !== currentDomainAnswer.value) {
      challengeError.value = 'Incorrect domain selected.'
      return
    }
  } else {
    challengeError.value = 'Challenge type is invalid.'
    return
  }

  showChallenge.value = false
  challengeError.value = ''
  stopTimerChallenge()
  const challengeDurationSeconds = saveChallengeEvent('completed')
  challengeValidUntilMs.value = Number.MAX_SAFE_INTEGER
  challengeGrantAccountKey.value = getAccountGrantKey()
  challengePlanPosition.value += 1

  const action = pendingAction.value
  pendingAction.value = null
  challengeInput.value = ''
  sliderValue.value = 0
  timerSecondsLeft.value = 0
  selectedDomain.value = ''
  domainOptions.value = []
  currentPhraseTargetWords.value = []
  selectedPhraseWords.value = []
  phraseWordBank.value = []

  if (action) {
    const result = await runAction(action)
    if (result.isTrackedAction) {
      await postCredentialCopyEvent(
        action,
        result.success ? 'completed' : 'failed',
        challengeDurationSeconds,
        challengeAttemptCount.value,
      )
    }
  }
}

const cancelChallenge = () => {
  const canceledAction = pendingAction.value
  const challengeDurationSeconds = saveChallengeEvent('canceled')
  stopTimerChallenge()

  if (
    canceledAction === 'copyPassword' ||
    canceledAction === 'copyUsername' ||
    canceledAction === 'togglePassword'
  ) {
    void postCredentialCopyEvent(
      canceledAction,
      'canceled',
      challengeDurationSeconds,
      challengeAttemptCount.value,
    )
  }

  showChallenge.value = false
  challengeInput.value = ''
  challengeError.value = ''
  sliderValue.value = 0
  timerSecondsLeft.value = 0
  selectedDomain.value = ''
  domainOptions.value = []
  currentPhraseTargetWords.value = []
  selectedPhraseWords.value = []
  phraseWordBank.value = []
  challengeAttemptCount.value = 0
  pendingAction.value = null
}

onBeforeUnmount(() => {
  stopTimerChallenge()
  challengeValidUntilMs.value = 0
  challengeGrantAccountKey.value = ''
})
</script>

<style scoped>
.account-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.5rem;
  background: var(--color-card-password);
  border-radius: 8px;
  box-shadow: 0 5px 6px 0 rgba(0, 0, 0, 0.25);
  margin-bottom: 2rem;
}

.username-part,
.password-part {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.password-section {
  display: flex;
  gap: 0.5rem;
}

.account-info {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding-left: 0.4rem;
  /* align-items: center; */
  flex-shrink: 0;
  color: #2b2b2b;
  font-family: Inter;
  font-size: 0.9375rem;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
}
.account-label {
  font-size: 0.68rem;
  color: #858383;
  margin: 0;
}

.account-name {
  margin: 0;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.material-symbols-rounded {
  width: 1.5rem;
  height: 1.5rem;
  color: #2b2b2b;
}
.attention-icon {
  width: 3rem;
  height: 3rem;
  color: #b00020;
  font-size: 3rem;
  /* display: flex; */
}
.close-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
}
.challenge-box {
  width: 80%;
  /* height: 30rem; */
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  padding: 0.75rem;
  background: #fff;
  border: 2px solid #b00020;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  padding-bottom: 2rem;
  /* margin:30%; */
  /* position: relative; */
}
.challenge-close-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
}
.challenge-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 1rem;
  gap: 0.7rem;
}
/* .challenge-box::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  z-index: -1;
} */
.challenge-box h1 {
  /* margin: 0 0 0.5rem 0; */
  text-align: center;
  font-family: Inter;
  font-size: 1.25rem;
}
.challenge-task {
  margin-left: 5%;
  margin-right: 5%;
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  /* align-items: center; */
}
.challenge-text {
  font-family: Inter;
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.challenge-input {
  width: 100%;
  padding: 0.45rem 0.6rem;
  margin-top: 1rem;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 1rem;
}

.phrase-selected {
  margin-top: 0.8rem;
  padding: 0.65rem;
  min-height: 2.5rem;
  border: 1px dashed #9aa3b2;
  border-radius: 6px;
  background: #f7f9fc;
  font-family: Inter;
  font-size: 0.95rem;
}

.phrase-placeholder {
  color: #7a7a7a;
}

.phrase-bank {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.9rem;
}

.phrase-word {
  border: 1px solid #c3d4ee;
  border-radius: 999px;
  background: #edf4ff;
  color: #1f3f6f;
  padding: 0.35rem 0.7rem;
  cursor: pointer;
  font-family: Inter;
  font-size: 0.92rem;
}

.phrase-word:hover {
  background: #dfeefe;
}

.phrase-controls {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.btn-secondary {
  border: 1px solid #cdd3de;
  border-radius: 6px;
  background: #f6f7f9;
  color: #2b2b2b;
  padding: 0.35rem 0.65rem;
  cursor: pointer;
}

.challenge-slider {
  width: 100%;
  margin-top: 1rem;
}

.slider-values {
  display: flex;
  justify-content: space-between;
  margin-top: 0.35rem;
  font-size: 0.9rem;
  color: #444;
}

.timer-countdown {
  margin-top: 0.75rem;
  font-weight: 600;
}

.challenge-error {
  margin: 0.75rem 0 0;
  padding: 0.75rem;
  color: #b00020;
  background: #ffebee;
  border-left: 4px solid #b00020;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.challenge-actions {
  margin-top: 2rem;
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.btn-confirm,
.btn-cancel {
  border: none;
  border-radius: 6px;
  padding: 0.4rem 0.7rem;
  cursor: pointer;
}

.btn-confirm {
  background: #1d3353;
  color: #fff;
}

.btn-confirm:disabled {
  background: #8d97a8;
  cursor: not-allowed;
}

.btn-cancel {
  background: #ececec;
  color: #222;
}
.domain-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
}

.domain-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-family: Inter;
  font-size: 0.95rem;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #f9f9f9;
}

.domain-option:hover {
  border-color: #9bd49e;
  background: #d9f4da;
}

.domain-option input[type='radio'] {
  cursor: pointer;
  width: 1.1rem;
  height: 1.1rem;
  accent-color: #9bd49e;
  border-color: #9bd49e;
  background: #d9f4da;
}

.domain-option input[type='radio']:checked {
  accent-color: #9bd49e;
  border-color: #9bd49e;
}

.domain-option:has(input[type='radio']:checked) {
  border-color: #9bd49e;
  background: #d9f4da;
}

.domain-option span {
  font-weight: 500;
  color: #2b2b2b;
}
</style>
