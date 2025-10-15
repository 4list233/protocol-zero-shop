"use client"

import Link from "next/link"
import { CartDrawer } from "@/components/cart-drawer"
import { useState, useEffect } from "react"
import { getSignupCountsForWeek, addSignup } from "@/lib/signups"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { getClipsByDate, extractYouTubeId, type Clip } from "@/lib/clips"

// Helper function to get the current week's dates starting from Monday
function getCurrentWeekDates() {
  const today = new Date()
  const currentDay = today.getDay() // 0 = Sunday, 1 = Monday, etc.
  const monday = new Date(today)
  
  // Adjust to get Monday of current week
  const diff = currentDay === 0 ? -6 : 1 - currentDay
  monday.setDate(today.getDate() + diff)
  
  const weekDates = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    weekDates.push(date)
  }
  
  return weekDates
}

// Helper function to get pricing based on business hours
function getPricing(dayIndex: number) {
  // Monday and Tuesday: 50% off all day, no late night special
  if (dayIndex === 0 || dayIndex === 1) {
    return null // No late night pricing for Mon/Tue
  }
  
  const lastThreeHours = {
    2: "7PM-10PM",   // Wednesday
    3: "7PM-10PM",   // Thursday
    4: "8PM-11PM",   // Friday
    5: "9PM-12AM",   // Saturday
    6: "8PM-11PM",   // Sunday
  }
  
  return `$25 (${lastThreeHours[dayIndex as keyof typeof lastThreeHours]})`
}

// Helper function to get special events/pricing for each day
function getDaySpecial(dayIndex: number) {
  const specials = {
    0: { text: "50% OFF", hasDiscount: true, originalPrice: "$50", discountPrice: "$25" },        // Monday
    1: { text: "50% OFF", hasDiscount: true, originalPrice: "$50", discountPrice: "$25" },        // Tuesday
    2: { text: "SPEEDSOFT", hasDiscount: false, originalPrice: "$50", discountPrice: null },      // Wednesday
    3: { text: "FREE RENTAL", hasDiscount: false, originalPrice: "$50", discountPrice: null },    // Thursday
    4: { text: "Regular", hasDiscount: false, originalPrice: "$50", discountPrice: null },        // Friday
    5: { text: "Regular", hasDiscount: false, originalPrice: "$50", discountPrice: null },        // Saturday
    6: { text: "Regular", hasDiscount: false, originalPrice: "$50", discountPrice: null },        // Sunday
  }
  
  return specials[dayIndex as keyof typeof specials]
}

export default function HomePage() {
  const router = useRouter()
  const weekDates = getCurrentWeekDates()
  const [mounted, setMounted] = useState(false)
  const [checkInCounts, setCheckInCounts] = useState<number[]>([])
  const [loadingCounts, setLoadingCounts] = useState(true)
  const [signingUp, setSigningUp] = useState<number | null>(null)
  const { user, loading } = useAuth()
  const [pastClips, setPastClips] = useState<{ date: string; clips: Clip[] }[]>([])
  const [loadingClips, setLoadingClips] = useState(true)

  useEffect(() => {
    setMounted(true)
    // Fetch real sign-up counts from Firestore
    const fetchCounts = async () => {
      try {
        const dateStrings = weekDates.map(d => d.toISOString().slice(0,10))
        const counts = await getSignupCountsForWeek(dateStrings)
        setCheckInCounts(counts)
        setLoadingCounts(false)
      } catch (error) {
        console.error("Error fetching signup counts:", error)
        // Set all counts to 0 on error
        setCheckInCounts(Array(7).fill(0))
        setLoadingCounts(false)
      }
    }
    fetchCounts()

    // Fetch clips for past dates
    const fetchPastClips = async () => {
      try {
        const nowString = new Date().toISOString().slice(0,10)
        const pastDates = weekDates.filter(d => d.toISOString().slice(0,10) < nowString)
        const clipsData = await Promise.all(
          pastDates.map(async (date) => {
            const dateString = date.toISOString().slice(0,10)
            const clips = await getClipsByDate(dateString)
            return { date: dateString, clips }
          })
        )
        setPastClips(clipsData.filter(d => d.clips.length > 0))
        setLoadingClips(false)
      } catch (error) {
        console.error("Error fetching past clips:", error)
        setLoadingClips(false)
      }
    }
    fetchPastClips()
  }, [weekDates])

  async function handleSignup(index: number) {
    if (!user) {
      alert("Please sign in to check in!")
      router.push("/account")
      return
    }
    setSigningUp(index)
    const dateString = weekDates[index].toISOString().slice(0,10)
    await addSignup(user.uid, user.displayName || "Anonymous", dateString)
    // Refresh counts
    const dateStrings = weekDates.map(d => d.toISOString().slice(0,10))
    const counts = await getSignupCountsForWeek(dateStrings)
    setCheckInCounts(counts)
    setSigningUp(null)
  }

  // Helper to get today index
  const todayIndex = weekDates.findIndex(d => {
    const now = new Date()
    return d.toISOString().slice(0,10) === now.toISOString().slice(0,10)
  })
  
  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#2C2C2C] bg-[#1E1E1E]/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img 
              src="/logos/logo-icon.png" 
              alt="Protocol Zero" 
              className="h-10 w-auto"
            />
            <span className="text-xl font-heading font-bold tracking-wide uppercase">Protocol Zero</span>
          </Link>
          <nav className="flex gap-6 items-center">
            <Link href="/clips" className="text-sm font-medium hover:text-[#3D9A6C] transition-colors">Clips</Link>
            <Link href="/shop" className="text-sm font-medium hover:text-[#3D9A6C] transition-colors">Shop</Link>
            <Link href="/account" className="text-sm font-medium hover:text-[#3D9A6C] transition-colors">Account</Link>
            <CartDrawer />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-6 py-8">
            <div className="inline-block">
              <h1 className="text-5xl md:text-7xl font-heading font-black tracking-wider uppercase">
                <span className="text-[#F5F5F5]">WHEN WE </span>
                <span className="text-[#3D9A6C]">PLAY</span>
              </h1>
              <div className="h-1 bg-gradient-to-r from-transparent via-pza-accent to-transparent mt-4"></div>
            </div>
            <p className="text-xl text-[#A1A1A1] font-body">
              Check in for upcoming game days and see who's coming
            </p>
          </div>

          {/* Weekly Schedule with Check-in */}
          <div className="bg-[#1E1E1E] border border-[#2C2C2C] rounded-2xl p-4 md:p-8 shadow-card">
            <h2 className="text-3xl font-heading font-bold mb-8 text-center uppercase tracking-wide">
              📅 This Week's Schedule
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-7 gap-3 md:gap-4">
              {weekDates.map((date, index) => {
                const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
                const dayIndex = date.getDay()
                const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1 // Convert to Mon=0, Sun=6
                const dayName = dayNames[dayIndex]
                const dayDate = date.getDate()
                const hours = adjustedIndex === 0 ? "12PM-10PM" :
                             adjustedIndex === 1 ? "12PM-10PM" :
                             adjustedIndex === 2 ? "12PM-10PM" :
                             adjustedIndex === 3 ? "12PM-10PM" :
                             adjustedIndex === 4 ? "12PM-11PM" :
                             adjustedIndex === 5 ? "10AM-12AM" :
                             "10AM-11PM"
                const special = getDaySpecial(adjustedIndex)
                const pricing = getPricing(adjustedIndex)
                const checked = mounted && !loadingCounts ? (checkInCounts[index] || 0) : 0
                
                return (
                  <div 
                    key={index} 
                    className="group bg-[#0D0D0D] border-2 border-[#2C2C2C] rounded-2xl p-3 md:p-4 hover:border-[#3D9A6C] hover:bg-[#1E1E1E] cursor-pointer transition-all hover:scale-[1.03] hover:shadow-glow"
                  >
                    <div className="text-center space-y-2">
                      <div className="text-[#A1A1A1] text-xs md:text-sm font-medium font-heading uppercase tracking-wider">{dayName}</div>
                      <div className="text-3xl md:text-4xl font-bold font-mono text-[#F5F5F5] group-hover:text-[#3D9A6C] transition-colors">{dayDate}</div>
                      <div className="text-[10px] md:text-xs text-[#A1A1A1] font-mono">{hours}</div>
                      
                      {/* Special Event */}
                      <div className={`rounded-lg px-2 py-1 ${
                        special.text === "50% OFF" ? "bg-[#E4B100]/20 border border-[#E4B100]/30" :
                        special.text === "SPEEDSOFT" ? "bg-[#3D9A6C]/20 border border-[#3D9A6C]/30" :
                        special.text === "FREE RENTAL" ? "bg-[#3D9A6C]/20 border border-[#3D9A6C]/30" :
                        "bg-[#2C2C2C] border border-[#2C2C2C]"
                      }`}>
                        <div className={`text-xs font-bold font-heading uppercase tracking-wide ${
                          special.text === "50% OFF" ? "text-[#E4B100]" :
                          special.text === "SPEEDSOFT" || special.text === "FREE RENTAL" ? "text-[#3D9A6C]" :
                          "text-[#A1A1A1]"
                        }`}>
                          {special.text}
                        </div>
                      </div>
                      
                      {/* Pricing with strikethrough for deals */}
                      <div className="space-y-1">
                        {special.hasDiscount ? (
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-xs text-[#A1A1A1] line-through font-mono">{special.originalPrice}</span>
                            <span className="text-lg font-bold text-[#3D9A6C] font-mono">{special.discountPrice}</span>
                          </div>
                        ) : (
                          <div className="text-sm font-bold text-[#F5F5F5] font-mono">{special.originalPrice}</div>
                        )}
                      </div>
                      
                      {/* Last 3 Hours Pricing (Wed-Sun only) */}
                      {pricing && (
                        <div className="bg-[#3D9A6C]/10 border border-[#3D9A6C]/30 rounded-lg px-2 py-1">
                          <div className="text-[#3D9A6C] text-[10px] md:text-xs font-semibold font-mono">{pricing}</div>
                        </div>
                      )}
                      
                      <div className="pt-2 border-t border-[#2C2C2C] mt-2">
                        <div className="text-2xl font-bold text-[#3D9A6C] font-mono">{mounted && !loadingCounts ? checked : "—"}</div>
                        <div className="text-[10px] md:text-xs text-[#A1A1A1] uppercase tracking-wide">checked in</div>
                        {user && (
                          <button
                            className="mt-2 px-3 py-1 rounded-xl bg-[#3D9A6C] text-[#F5F5F5] font-bold text-xs hover:bg-[#337E59] transition disabled:opacity-60"
                            disabled={signingUp === index}
                            onClick={() => handleSignup(index)}
                          >
                            {signingUp === index ? "Signing up..." : "Sign Up"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-6 p-4 bg-[#2C2C2C]/30 rounded-lg border border-[#2C2C2C]">
              <p className="text-sm text-[#A1A1A1] text-center font-body">
                💡 <strong className="text-[#3D9A6C]">Wed-Sun last 3 hours:</strong> 50% OFF admission ($25) • <strong className="text-[#E4B100]">Mon-Tue:</strong> 50% OFF all day ($25) • <strong className="text-[#F5F5F5]">Regular:</strong> $50
              </p>
            </div>

            {/* Check in for today */}
            <div className="mt-8 flex flex-col items-center gap-2">
              <h3 className="text-lg font-heading text-[#3D9A6C]">Check in for Today</h3>
              <button
                className="px-4 py-2 rounded-xl bg-[#3D9A6C] text-[#F5F5F5] font-bold text-sm hover:bg-[#337E59] transition disabled:opacity-60"
                disabled={signingUp === todayIndex || todayIndex === -1}
                onClick={() => handleSignup(todayIndex)}
              >
                {signingUp === todayIndex ? "Checking in..." : "Check In"}
              </button>
            </div>

            {/* Sign up for future dates */}
            <div className="mt-8 p-4 bg-[#1E1E1E] border border-[#2C2C2C] rounded-xl">
              <h3 className="text-lg font-heading text-[#3D9A6C] mb-2">Sign Up for Future Dates</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {weekDates.map((date, idx) => {
                  const dateString = date.toISOString().slice(0,10)
                  const nowString = new Date().toISOString().slice(0,10)
                  if (dateString <= nowString) return null // Only future dates
                  return (
                    <button
                      key={dateString}
                      className="px-3 py-1 rounded-xl bg-[#3D9A6C] text-[#F5F5F5] font-mono text-xs hover:bg-[#337E59] transition disabled:opacity-60"
                      disabled={signingUp === idx}
                      onClick={() => handleSignup(idx)}
                    >
                      {signingUp === idx ? "Signing up..." : dateString}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Show clips for past dates */}
            <div className="mt-8 p-4 bg-[#1E1E1E] border border-[#2C2C2C] rounded-xl">
              <h3 className="text-lg font-heading text-[#3D9A6C] mb-4">Clips from Past Dates</h3>
              {loadingClips ? (
                <p className="text-sm text-[#A1A1A1]">Loading clips...</p>
              ) : pastClips.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-[#A1A1A1] mb-3">No clips from past game days yet.</p>
                  <Link href="/clips" className="text-[#3D9A6C] hover:text-[#337E59] font-semibold underline">
                    View all clips →
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {pastClips.map(({ date, clips }) => (
                    <div key={date} className="border-t border-[#2C2C2C] pt-4 first:border-t-0 first:pt-0">
                      <h4 className="text-md font-mono text-[#F5F5F5] mb-3">{date}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {clips.slice(0, 4).map((clip) => (
                          <div key={clip.id} className="bg-[#0D0D0D] border border-[#2C2C2C] rounded-xl p-3 hover:border-[#3D9A6C] transition">
                            <div className="aspect-video bg-black rounded-lg mb-2 overflow-hidden">
                              <iframe
                                src={`https://www.youtube.com/embed/${clip.youtubeId}`}
                                className="w-full h-full"
                                allowFullScreen
                              />
                            </div>
                            <h5 className="text-sm font-heading text-[#F5F5F5] truncate">{clip.title}</h5>
                            <p className="text-xs text-[#A1A1A1]">by {clip.username}</p>
                          </div>
                        ))}
                      </div>
                      {clips.length > 4 && (
                        <Link href="/clips" className="text-xs text-[#3D9A6C] hover:text-[#337E59] mt-2 inline-block">
                          View all {clips.length} clips from {date} →
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
