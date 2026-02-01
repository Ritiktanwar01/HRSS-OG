"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Check if user is logged in on initial load
  const checkAuth = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          method: "GET",
        })
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        } else {
          const NewToken =  await refreshToken()
          return NewToken

        }
      } catch (error) {
        const NewToken =  await refreshToken()
        console.log("Login:",NewToken )
      } finally {
        setLoading(false)
      }
    }
  useEffect(() => {
    checkAuth()
  }, [])

  // Login function
  const Login = async (email, password, role) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role }),
        credentials: "include",
      })

      if (response.ok) {
        const userData = await response.json()
        console.log("User data:", userData)
        localStorage.clear()
        localStorage.setItem("access_token", userData.user.access_token)
        localStorage.setItem("refresh_token", userData.user.refresh_token)
        setUser(userData.user)
        return { success: true }
      } else {
        const error = await response.json()
        return { success: false, message: error.message }
      }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, message: "An error occurred during login" }
    }
  }

  // Logout function
  const Logout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      })
      setUser(null)
      router.push("/admin/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  // Get auth token from cookies (client-side only)
  const getAuthToken = () => {
    if (typeof window !== "undefined") {
      const cookies = document.cookie.split(";")
      const tokenCookie = cookies.find((cookie) => cookie.trim().startsWith("access_token="))
      if (tokenCookie) {
        return tokenCookie.split("=")[1]
      }
    }
    return null
  }

  // Refresh token function
  const refreshToken = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh-token`, {
        method: "POST",
        credentials: "include",
         headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("refresh_token")}`,
        },
      })

      if (response.ok) {
        localStorage.clear()
        const userData = await response.json()
        localStorage.setItem("access_token", userData.tokens.access_token)
        localStorage.setItem("refresh_token", userData.tokens.refresh_token);
        checkAuth()
        return true
      } else {
        setUser(null)
        router.push("/admin/login")
        return false
      }
    } catch (error) {
      console.error("Token refresh error:", error)
      setUser(null)
      router.push("/admin/login")
      return false
    }
  }

  const value = {
    user,
    loading,
    Login,
    Logout,
    getAuthToken,
    refreshToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}