"use client"

import Link from "next/link"
import { CartDrawer } from "@/components/cart-drawer"
import { useState, useEffect } from "react"

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
  const weekDates = getCurrentWeekDates()
  const [mounted, setMounted] = useState(false)
  const [checkInCounts, setCheckInCounts] = useState<number[]>([])

  useEffect(() => {
    setMounted(true)
    // Generate random check-in counts only on client side
    setCheckInCounts([
      Math.floor(Math.random() * 30) + 8,  // Monday
      Math.floor(Math.random() * 30) + 8,  // Tuesday
      Math.floor(Math.random() * 30) + 8,  // Wednesday
      Math.floor(Math.random() * 30) + 8,  // Thursday
      Math.floor(Math.random() * 30) + 15, // Friday
      Math.floor(Math.random() * 30) + 20, // Saturday
      Math.floor(Math.random() * 30) + 15, // Sunday
    ])
  }, [])
  
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
                const checked = mounted ? (checkInCounts[index] || 0) : 0
                
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
                        <div className="text-2xl font-bold text-[#3D9A6C] font-mono">{mounted ? checked : "—"}</div>
                        <div className="text-[10px] md:text-xs text-[#A1A1A1] uppercase tracking-wide">checked in</div>
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
            <p className="text-sm text-[#A1A1A1] text-center mt-6 flex items-center justify-center gap-2 font-body">
              🔒 <Link href="/auth/signin" className="text-[#3D9A6C] hover:text-[#3D9A6C]-hover font-semibold underline-offset-4 hover:underline">Sign in</Link> to check in for game days
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
