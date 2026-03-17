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
          To continue, type: I am not being scammed
        </p>
        <input
          v-model="challengeInput"
          type="text"
          class="challenge-input"
          placeholder="Type: I am not being scammed"
        />
      </template>

      <template v-else-if="challengeType === 'slider'">
        <!-- http://aag-it.com/the-latest-phishing-statistics/ -->
        <p class="challenge-text">
          Did you know that phishing is the most commom form of cyber crime, with an estimated 3.4
          billion span emails sent daily? <br /><br />
          83% of UK businesses that suffered a cyber attack in 2022 reported the attack type as
          phishing. <br /><br />
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

      <template v-else>
        <p class="challenge-text">
          Attackers often use lookalike domains (typosquatting) in phishing messages. Select the
          official website domain:
        </p>
        <div class="domain-options">
          <label v-for="option in domainOptions" :key="option" class="domain-option">
            <input v-model="selectedDomain" type="radio" name="domain-challenge" :value="option" />
            <span>{{ option }}</span>
          </label>
        </div>
      </template>

      <p v-if="challengeError" class="challenge-error">{{ challengeError }}</p>

      <div class="challenge-actions">
        <button class="btn-confirm" type="button" @click="confirmChallenge">Confirm</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  account_name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  requireChallenge: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['copied'])

const REQUIRED_TEXT = 'I am not being scammed'
const CHALLENGE_TYPES = ['text', 'slider', 'domain']
const SLIDER_TOLERANCE = 2
const CHALLENGE_INDEX_STORAGE_KEY = 'pm.challenge.index'

const loadChallengeIndex = () => {
  if (typeof window === 'undefined') return 0

  const raw = window.sessionStorage.getItem(CHALLENGE_INDEX_STORAGE_KEY)
  const parsed = Number.parseInt(raw ?? '', 10)

  if (!Number.isInteger(parsed) || parsed < 0) return 0
  return parsed % CHALLENGE_TYPES.length
}

const saveChallengeIndex = (index) => {
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem(CHALLENGE_INDEX_STORAGE_KEY, String(index))
}

const isPasswordVisible = ref(false)

const showChallenge = ref(false)
const challengeType = ref('text')
const challengeIndex = ref(loadChallengeIndex())
const challengeInput = ref('')
const challengeError = ref('')
const sliderValue = ref(0)
const sliderTarget = ref(50)

const selectedDomain = ref('')
const domainOptions = ref([])

const pendingAction = ref(null)

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5)

const OFFICIAL_DOMAIN = 'accounts.google.com'
const PHISHING_LOOKALIKES = [
  'account-google.com',
  'accounts-google.com',
  'acc0unts.google.com',
  'accounts.g00gle.com',
  'google.accounts.security-login.com',
]

const buildDomainChallenge = () => {
  const fakePool = shuffle(PHISHING_LOOKALIKES).slice(0, 3)
  domainOptions.value = shuffle([OFFICIAL_DOMAIN, ...fakePool])
  selectedDomain.value = ''
}

const pickNextChallenge = () => {
  challengeType.value = CHALLENGE_TYPES[challengeIndex.value]
  challengeIndex.value = (challengeIndex.value + 1) % CHALLENGE_TYPES.length
  saveChallengeIndex(challengeIndex.value)
  challengeInput.value = ''
  challengeError.value = ''
  sliderValue.value = 0
  selectedDomain.value = ''
  domainOptions.value = []

  if (challengeType.value === 'slider') {
    sliderTarget.value = 83 // Based on the phishing stat mentioned in the challenge text
  } else if (challengeType.value === 'domain') {
    buildDomainChallenge()
  }
}

const togglePasswordVisibility = () => {
  isPasswordVisible.value = !isPasswordVisible.value
}

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    emit('copied')
  } catch (error) {
    console.error('Failed to copy text:', error)
  }
}

const runAction = async (action) => {
  if (action === 'togglePassword') {
    togglePasswordVisibility()
  } else if (action === 'copyPassword') {
    await copyToClipboard(props.password)
  } else if (action === 'copyUsername') {
    await copyToClipboard(props.account_name)
  }
}

const requestSensitiveAction = async (action) => {
  if (!props.requireChallenge) {
    await runAction(action)
    return
  }

  if (action === 'togglePassword' && isPasswordVisible.value) {
    togglePasswordVisibility()
    return
  }

  pendingAction.value = action
  pickNextChallenge()
  showChallenge.value = true
}

const confirmChallenge = async () => {
  if (challengeType.value === 'text') {
    if (challengeInput.value.trim() !== REQUIRED_TEXT) {
      challengeError.value = 'Text does not match.'
      return
    }
  } else if (challengeType.value === 'slider') {
    if (Math.abs(sliderValue.value - sliderTarget.value) > SLIDER_TOLERANCE) {
      challengeError.value = `Slider is not at ${sliderTarget.value}.`
      return
    }
  } else {
    if (selectedDomain.value !== OFFICIAL_DOMAIN) {
      challengeError.value = 'Incorrect domain selected.'
      return
    }
  }

  showChallenge.value = false
  challengeError.value = ''

  const action = pendingAction.value
  pendingAction.value = null
  challengeInput.value = ''
  sliderValue.value = 0
  selectedDomain.value = ''
  domainOptions.value = []

  if (action) await runAction(action)
}

const cancelChallenge = () => {
  showChallenge.value = false
  challengeInput.value = ''
  challengeError.value = ''
  sliderValue.value = 0
  selectedDomain.value = ''
  domainOptions.value = []
  pendingAction.value = null
}
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
