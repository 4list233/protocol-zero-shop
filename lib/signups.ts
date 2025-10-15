// Firestore functions for player sign-ups
import { getFirestore, collection, addDoc, getDocs, query, where, Timestamp } from 'firebase/firestore'
import { db } from './firebase'

export type Signup = {
  userId: string
  username: string
  date: string // YYYY-MM-DD
  timestamp: Timestamp
}

// Add a signup for a specific date
export async function addSignup(userId: string, username: string, date: string) {
  const ref = collection(db, 'signups')
  await addDoc(ref, {
    userId,
    username,
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
