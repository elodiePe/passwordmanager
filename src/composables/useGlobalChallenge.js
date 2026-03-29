import { ref } from 'vue'

const CHALLENGE_RESET_STORAGE_KEY = 'pm.challenge.order.resetAt'

let globalChallengePlan = ref([])
let globalChallengePlanPosition = ref(0)
let globalChallengeValidUntilMs = ref(0)
let globalChallengeGrantAccountKey = ref('')
let globalChallengeResetToken = ref('')
let globalChallengeCycleIndex = ref(0)

const TEXT_PROMPTS = [
  'I verify the website before signing in',
  'I will check the URL before entering my password',
]

const TIMER_MESSAGES = [
  'Cyberattacks often succeed when people act too quickly, so take a short pause before continuing.',
  'Scammers create urgency to force mistakes. Pause, review, and only then continue.',
]

const PHRASE_CHALLENGES = [
  ['Check', 'the', 'URL'],
  ['Only', 'sign', 'in', 'on', 'official', 'sites'],
]

const DOMAIN_QUESTIONS = [
  {
    prompt:
      'Attackers often use lookalike domains (typosquatting) in phishing messages. Select the official Google account domain:',
    correct: 'accounts.google.com',
    lookalikes: [
      'account-google.com',
      'accounts-google.com',
      'acc0unts.google.com',
      'accounts.g00gle.com',
      'google.accounts.security-login.com',
    ],
  },
  {
    prompt: 'You receive an urgent account alert by email. What is the safest first step?',
    correct: 'Open the official app or website directly and verify the alert there',
    lookalikes: [
      'Click the email link immediately to fix it faster',
      'Reply to the email with your password to confirm identity',
      'Download the attachment to verify your account details',
      'Call the phone number in the email without checking official contact pages',
    ],
  },
  {
    prompt:
      'You receive repeated MFA (Multi-Factor Authentication) approval requests you did not initiate. What should you do first?',
    correct: 'Deny the requests, secure your account, and change your password immediately',
    lookalikes: [
      'Approve one request to stop the notifications',
      'Ignore them and wait for the prompts to stop on their own',
      'Share the MFA code with support over email',
      'Disable MFA completely to avoid future prompt spam',
    ],
  },
]

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5)
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

const ensureChallengePlan = () => {
  if (globalChallengePlanPosition.value < globalChallengePlan.value.length) return

  const text1 = TEXT_PROMPTS[0]
  const text2 = TEXT_PROMPTS[1] || TEXT_PROMPTS[0]
  const domainOffset = globalChallengeCycleIndex.value * 2
  const question1 = DOMAIN_QUESTIONS[domainOffset % DOMAIN_QUESTIONS.length]
  const question2 = DOMAIN_QUESTIONS[(domainOffset + 1) % DOMAIN_QUESTIONS.length]
  const timer1 = TIMER_MESSAGES[0]
  const timer2 = TIMER_MESSAGES[1] || TIMER_MESSAGES[0]
  const phrase1 = PHRASE_CHALLENGES[0]
  const phrase2 = PHRASE_CHALLENGES[1] || PHRASE_CHALLENGES[0]
  const question3 = DOMAIN_QUESTIONS[2] || DOMAIN_QUESTIONS[0]

  globalChallengePlan.value = [
    { type: 'domain', question: question3 },
    { type: 'slider' },
    { type: 'text', prompt: text1 },
    { type: 'domain', question: question1 },
    { type: 'timer', message: timer1 },
    { type: 'phrase', words: phrase1 },
    { type: 'slider' },
    { type: 'text', prompt: text2 },
    { type: 'domain', question: question2 },
    { type: 'timer', message: timer2 },
    { type: 'phrase', words: phrase2 },
  ]
  globalChallengePlanPosition.value = 0
  globalChallengeCycleIndex.value += 1
}

const getChallengeResetToken = () => {
  if (typeof window === 'undefined') return ''
  return window.localStorage.getItem(CHALLENGE_RESET_STORAGE_KEY) || ''
}

const syncChallengePlanWithLogin = () => {
  const nextToken = getChallengeResetToken()

  if (nextToken !== globalChallengeResetToken.value) {
    globalChallengeResetToken.value = nextToken
    globalChallengePlan.value = []
    globalChallengePlanPosition.value = 0
    globalChallengeCycleIndex.value = 0
    globalChallengeValidUntilMs.value = 0
    globalChallengeGrantAccountKey.value = ''
  }
}

export const useGlobalChallenge = () => {
  syncChallengePlanWithLogin()
  ensureChallengePlan()

  return {
    challengePlan: globalChallengePlan,
    challengePlanPosition: globalChallengePlanPosition,
    challengeValidUntilMs: globalChallengeValidUntilMs,
    challengeGrantAccountKey: globalChallengeGrantAccountKey,
    ensureChallengePlan,
    syncChallengePlanWithLogin,
    getChallengeResetToken,
    shuffle,
    randomInt,
    TEXT_PROMPTS,
    TIMER_MESSAGES,
    PHRASE_CHALLENGES,
    DOMAIN_QUESTIONS,
  }
}
