// Get all signups (for listing players)
export async function getAllSignups() {
  const ref = collection(db, 'signups')
  const snapshot = await getDocs(ref)
  return snapshot.docs.map(doc => doc.data())
}
// Firestore functions for player sign-ups
import { getFirestore, collection, addDoc, getDocs, query, where, Timestamp } from 'firebase/firestore'
import { db } from './firebase'

export type Signup = {
  userId?: string // present for authenticated users
  username: string // display name or guest name
  displayName?: string // present for authenticated users
  email?: string // present for authenticated users
  isGuest: boolean
  // For guests added by an authenticated user
  sponsorUserId?: string
  sponsorName?: string
  sponsorEmail?: string | null
  date: string // YYYY-MM-DD
  timestamp: Timestamp
}

// Add a signup for a specific date
// For authenticated users, pass userId, username, displayName, email, isGuest=false
// For guests, pass username, isGuest=true
export async function addSignup({
  userId,
  username,
  displayName,
  email,
  isGuest,
  sponsorUserId,
  sponsorName,
  sponsorEmail,
  date,
}: {
  userId?: string
  username: string
  displayName?: string
  email?: string
  isGuest: boolean
  sponsorUserId?: string
  sponsorName?: string
  sponsorEmail?: string | null
  date: string
}) {
  const ref = collection(db, 'signups')
  await addDoc(ref, {
    userId: userId || null,
    username,
    displayName: displayName || null,
    email: email || null,
    isGuest,
    sponsorUserId: sponsorUserId || null,
    sponsorName: sponsorName || null,
    sponsorEmail: sponsorEmail || null,
    date,
    timestamp: new Date(),
  })
}

// Get signup count for a specific date
export async function getSignupCount(date: string): Promise<number> {
  const ref = collection(db, 'signups')
  const q = query(ref, where('date', '==', date))
  const snapshot = await getDocs(q)
  return snapshot.size
}

// Get all signups for a week (array of dates)
export async function getSignupCountsForWeek(dates: string[]): Promise<number[]> {
  const ref = collection(db, 'signups')
  const counts: number[] = []
  for (const date of dates) {
    const q = query(ref, where('date', '==', date))
    const snapshot = await getDocs(q)
    counts.push(snapshot.size)
  }
  return counts
}
