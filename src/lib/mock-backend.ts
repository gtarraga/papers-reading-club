export interface User {
  id: string
  name: string
  token: string
}

export interface Submission {
  id: string
  title: string
  url: string
  publicationDate: Date
  recommendation: string
  submittedBy: string
  submittedByUserId: string
  submittedAt: Date
}

export interface Vote {
  userId: string
  rankings: Record<string, number> // submissionId -> rank
  submittedAt: Date
}

export interface Cycle {
  id: number
  cycleNumber: number
  submissionStart: Date
  submissionEnd: Date
  votingEnd: Date
  submissions: Submission[]
  votes: Vote[]
}

export interface PastResult {
  cycleNumber: number
  winner: {
    title: string
    url: string
    submittedBy: string
  }
  votingEndDate: Date
  allSubmissions: {
    title: string
    finalRank: number
  }[]
}

// Valid tokens for demo
const VALID_TOKENS = ["PAPER2025-ALICE", "PAPER2025-BOB", "PAPER2025-CHARLIE", "PAPER2025-DIANA", "PAPER2025-EVE"]

// Initialize mock data
function initializeMockData() {
  const stored = localStorage.getItem("paperClubData")
  if (stored) {
    const data = JSON.parse(stored)
    // Convert date strings back to Date objects
    data.currentCycle.submissionStart = new Date(data.currentCycle.submissionStart)
    data.currentCycle.submissionEnd = new Date(data.currentCycle.submissionEnd)
    data.currentCycle.votingEnd = new Date(data.currentCycle.votingEnd)
    data.currentCycle.submissions = data.currentCycle.submissions.map((s: any) => ({
      ...s,
      publicationDate: new Date(s.publicationDate),
      submittedAt: new Date(s.submittedAt),
    }))
    data.currentCycle.votes = data.currentCycle.votes.map((v: any) => ({
      ...v,
      submittedAt: new Date(v.submittedAt),
    }))
    data.pastResults = data.pastResults.map((r: any) => ({
      ...r,
      votingEndDate: new Date(r.votingEndDate),
    }))
    return data
  }

  // Create initial data
  const now = new Date()
  const submissionEnd = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
  const votingEnd = new Date(submissionEnd.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days after submission

  return {
    currentCycle: {
      id: 1,
      cycleNumber: 5,
      submissionStart: now,
      submissionEnd,
      votingEnd,
      submissions: [
        {
          id: "demo-1",
          title: "Attention Is All You Need",
          url: "https://arxiv.org/abs/1706.03762",
          publicationDate: new Date("2017-06-12"),
          recommendation:
            "This foundational paper introduced the Transformer architecture that revolutionized NLP and became the basis for models like GPT and BERT.",
          submittedBy: "Alice",
          submittedByUserId: "user-alice",
          submittedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        },
      ],
      votes: [],
    },
    pastResults: [
      {
        cycleNumber: 4,
        winner: {
          title: "Deep Residual Learning for Image Recognition",
          url: "https://arxiv.org/abs/1512.03385",
          submittedBy: "Bob",
        },
        votingEndDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
        allSubmissions: [
          { title: "Deep Residual Learning for Image Recognition", finalRank: 1 },
          { title: "BERT: Pre-training of Deep Bidirectional Transformers", finalRank: 2 },
          { title: "Generative Adversarial Networks", finalRank: 3 },
        ],
      },
      {
        cycleNumber: 3,
        winner: {
          title: "ImageNet Classification with Deep Convolutional Neural Networks",
          url: "https://arxiv.org/abs/1409.1556",
          submittedBy: "Charlie",
        },
        votingEndDate: new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000),
        allSubmissions: [
          { title: "ImageNet Classification with Deep Convolutional Neural Networks", finalRank: 1 },
          { title: "Dropout: A Simple Way to Prevent Neural Networks from Overfitting", finalRank: 2 },
        ],
      },
    ],
  }
}

function saveMockData(data: any) {
  localStorage.setItem("paperClubData", JSON.stringify(data))
}

// Auth functions
export function validateToken(token: string): boolean {
  return VALID_TOKENS.includes(token.toUpperCase())
}

export function getCurrentUser(): User | null {
  const stored = localStorage.getItem("paperClubUser")
  if (!stored) return null
  return JSON.parse(stored)
}

export function loginWithToken(token: string): User | null {
  const upperToken = token.toUpperCase()
  if (!validateToken(upperToken)) return null

  const name = upperToken.split("-")[1]
  const user: User = {
    id: `user-${name.toLowerCase()}`,
    name,
    token: upperToken,
  }

  localStorage.setItem("paperClubUser", JSON.stringify(user))
  return user
}

export function logout() {
  localStorage.removeItem("paperClubUser")
}

// Data functions
export function getCurrentCycle(): Cycle {
  const data = initializeMockData()
  return data.currentCycle
}

export function getPastResults(): PastResult[] {
  const data = initializeMockData()
  return data.pastResults
}

export function submitPaper(submission: Omit<Submission, "id" | "submittedAt">): Submission {
  const data = initializeMockData()
  const newSubmission: Submission = {
    ...submission,
    id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    submittedAt: new Date(),
  }

  data.currentCycle.submissions.push(newSubmission)
  saveMockData(data)
  return newSubmission
}

export function deletePaper(submissionId: string, userId: string): boolean {
  const data = initializeMockData()
  const submission = data.currentCycle.submissions.find((s: Submission) => s.id === submissionId)

  if (!submission || submission.submittedByUserId !== userId) {
    return false
  }

  data.currentCycle.submissions = data.currentCycle.submissions.filter((s: Submission) => s.id !== submissionId)
  saveMockData(data)
  return true
}

export function submitVote(userId: string, rankings: Record<string, number>): boolean {
  const data = initializeMockData()

  // Remove any existing vote from this user
  data.currentCycle.votes = data.currentCycle.votes.filter((v: Vote) => v.userId !== userId)

  // Add new vote
  const newVote: Vote = {
    userId,
    rankings,
    submittedAt: new Date(),
  }

  data.currentCycle.votes.push(newVote)
  saveMockData(data)
  return true
}

export function getUserVote(userId: string): Vote | null {
  const data = initializeMockData()
  return data.currentCycle.votes.find((v: Vote) => v.userId === userId) || null
}

export function getUserSubmissionCount(userId: string): number {
  const data = initializeMockData()
  return data.currentCycle.submissions.filter((s: Submission) => s.submittedByUserId === userId).length
}
