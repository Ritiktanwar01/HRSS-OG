"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

const AuthContext = createContext()


export const fetchCsrfToken = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/csrf/`, {
        credentials: "include",
      })
      const data = await res.json()
      return data.csrfToken
    } catch (err) {
      console.error("Failed to fetch CSRF token:", err)
      return null
    }
  }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Fetch CSRF token from backend
  

  // Check if user is logged in
  const checkAuth = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/auth/me/`, {
        method: "GET",
        credentials: "include",
      })
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        setUser(null)
        router.push("/admin/login")
      }
    } catch (error) {
      console.error("Auth check error:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  // Login
  const Login = async (email, password) => {
    try {
      const csrfToken = await fetchCsrfToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/auth/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken && { "X-CSRFToken": csrfToken }),
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      })

      if (response.ok) {
        await checkAuth()
        return { success: true }
      } else {
        const error = await response.json()
        return { success: false, message: error.message || "Login failed" }
      }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, message: "An error occurred during login" }
    }
  }

  // Logout
  const Logout = async () => {
    try {
      const csrfToken = await fetchCsrfToken()
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/auth/logout/`, {
        method: "POST",
        headers: {
          ...(csrfToken && { "X-CSRFToken": csrfToken }),
        },
        credentials: "include",
      })
      setUser(null)
      router.push("/admin/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const value = {
    user,
    loading,
    Login,
    Logout,
    checkAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
