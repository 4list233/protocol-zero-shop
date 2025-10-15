// Firebase operations for clips functionality
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  where,
  Timestamp,
  increment,
  serverTimestamp
} from 'firebase/firestore'
import { 
  ref, 
  uploadBytes, 
  getDownloadURL,
  deleteObject 
} from 'firebase/storage'
import { db, storage } from './firebase'

// Types
export type ClipTag = "speedsoft" | "milsim" | "multikill" | "funny" | "tutorial" | "gear-review"

export interface ClipData {
  userId: string
  username: string
  userAvatar: string
  title: string
  description: string
  youtubeUrl: string
  youtubeId: string
  tags: ClipTag[]
  likes: number
  likedBy: string[] // Array of user IDs who liked this clip
  comments: number
  timestamp: Date | Timestamp
  videoFile?: string // Optional: path to uploaded video file in Storage
}

export interface Clip extends ClipData {
  id: string
  isLiked?: boolean // Client-side only, calculated based on current user
}

// ==================== CLIPS OPERATIONS ====================

/**
 * Add a new clip to Firestore
 */
export async function addClip(clipData: Omit<ClipData, 'likes' | 'likedBy' | 'comments' | 'timestamp'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'clips'), {
      ...clipData,
      likes: 0,
      likedBy: [],
      comments: 0,
      timestamp: serverTimestamp(),
    })
    console.log("Clip added with ID:", docRef.id)
    return docRef.id
  } catch (error) {
    console.error("Error adding clip:", error)
    throw error
  }
}

/**
 * Get all clips, optionally filtered by tags
 */
export async function getClips(tags?: ClipTag[]): Promise<Clip[]> {
  try {
    let q = query(collection(db, 'clips'), orderBy('timestamp', 'desc'))
    
    // Note: Firestore doesn't support array-contains-any with multiple values efficiently
    // For tag filtering, we'll fetch all and filter client-side, or use multiple queries
    
    const querySnapshot = await getDocs(q)
    const clips: Clip[] = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as ClipData
      
      // Filter by tags if provided
      if (tags && tags.length > 0) {
        const hasMatchingTag = tags.some(tag => data.tags.includes(tag))
        if (!hasMatchingTag) return
      }
      
      clips.push({
        id: doc.id,
        ...data,
        // Convert Firestore Timestamp to Date
        timestamp: data.timestamp instanceof Timestamp 
          ? data.timestamp.toDate() 
          : new Date(data.timestamp),
      })
    })
    
    return clips
  } catch (error) {
    console.error("Error getting clips:", error)
    throw error
  }
}

/**
 * Get clips by a specific user
 */
export async function getUserClips(userId: string): Promise<Clip[]> {
  try {
    const q = query(
      collection(db, 'clips'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    const clips: Clip[] = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as ClipData
      clips.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp instanceof Timestamp 
          ? data.timestamp.toDate() 
          : new Date(data.timestamp),
      })
    })
    
    return clips
  } catch (error) {
    console.error("Error getting user clips:", error)
    throw error
  }
}

/**
 * Update a clip
 */
export async function updateClip(clipId: string, updates: Partial<ClipData>): Promise<void> {
  try {
    const clipRef = doc(db, 'clips', clipId)
    await updateDoc(clipRef, updates)
    console.log("Clip updated successfully")
  } catch (error) {
    console.error("Error updating clip:", error)
    throw error
  }
}

/**
 * Delete a clip
 */
export async function deleteClip(clipId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'clips', clipId))
    console.log("Clip deleted successfully")
  } catch (error) {
    console.error("Error deleting clip:", error)
    throw error
  }
}

// ==================== LIKE OPERATIONS ====================

/**
 * Toggle like on a clip
 */
export async function toggleLike(clipId: string, userId: string): Promise<{ liked: boolean; newLikeCount: number }> {
  try {
    const clipRef = doc(db, 'clips', clipId)
    
    // First, get the current state
    const clipDoc = await getDocs(query(collection(db, 'clips'), where('__name__', '==', clipId)))
    
    if (clipDoc.empty) {
      throw new Error('Clip not found')
    }
    
    const clipData = clipDoc.docs[0].data() as ClipData
    const likedBy = clipData.likedBy || []
    const isLiked = likedBy.includes(userId)
    
    // Update the clip
    if (isLiked) {
      // Unlike: remove user from likedBy array and decrement likes
      await updateDoc(clipRef, {
        likedBy: likedBy.filter(id => id !== userId),
        likes: increment(-1),
      })
      return { liked: false, newLikeCount: clipData.likes - 1 }
    } else {
      // Like: add user to likedBy array and increment likes
      await updateDoc(clipRef, {
        likedBy: [...likedBy, userId],
        likes: increment(1),
      })
      return { liked: true, newLikeCount: clipData.likes + 1 }
    }
  } catch (error) {
    console.error("Error toggling like:", error)
    throw error
  }
}

/**
 * Check if a user has liked specific clips
 */
export function markClipsAsLiked(clips: Clip[], userId: string): Clip[] {
  return clips.map(clip => ({
    ...clip,
    isLiked: clip.likedBy?.includes(userId) || false,
  }))
}

// ==================== STORAGE OPERATIONS ====================

/**
 * Upload a video file to Firebase Storage
 * @param file - The video file to upload
 * @param userId - The user ID (for organizing files)
 * @returns The download URL and storage path
 */
export async function uploadClipVideo(
  file: File, 
  userId: string
): Promise<{ downloadURL: string; storagePath: string }> {
  try {
    // Create a unique filename
    const timestamp = Date.now()
    const fileName = `${userId}_${timestamp}_${file.name}`
    const storagePath = `clips/${userId}/${fileName}`
    const storageRef = ref(storage, storagePath)
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file)
    console.log('Video uploaded successfully')
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref)
    
    return { downloadURL, storagePath }
  } catch (error) {
    console.error("Error uploading video:", error)
    throw error
  }
}

/**
 * Delete a video file from Firebase Storage
 */
export async function deleteClipVideo(storagePath: string): Promise<void> {
  try {
    const storageRef = ref(storage, storagePath)
    await deleteObject(storageRef)
    console.log('Video deleted successfully')
  } catch (error) {
    console.error("Error deleting video:", error)
    throw error
  }
}

/**
 * Upload a thumbnail image to Firebase Storage
 */
export async function uploadClipThumbnail(
  file: File,
  userId: string
): Promise<{ downloadURL: string; storagePath: string }> {
  try {
    const timestamp = Date.now()
    const fileName = `${userId}_${timestamp}_thumb_${file.name}`
    const storagePath = `clips/thumbnails/${userId}/${fileName}`
    const storageRef = ref(storage, storagePath)
    
    const snapshot = await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(snapshot.ref)
    
    return { downloadURL, storagePath }
  } catch (error) {
    console.error("Error uploading thumbnail:", error)
    throw error
  }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Extract YouTube video ID from various URL formats
 */
export function extractYouTubeId(url: string): string | null {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[7].length === 11 ? match[7] : null
}

/**
 * Validate YouTube URL
 */
export function isValidYouTubeUrl(url: string): boolean {
  return extractYouTubeId(url) !== null
}

/**
 * Format timestamp to relative time (e.g., "2h ago")
 */
export function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return date.toLocaleDateString()
}
