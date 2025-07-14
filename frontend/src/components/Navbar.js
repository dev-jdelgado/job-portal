"use client"

import { useState, useRef, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [profilePicture, setProfilePicture] = useState(null)
  const dropdownRef = useRef(null)

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Fetch user profile picture
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.id) {
        try {
          const response = await fetch(`http://localhost:5000/api/users/${user.id}`)
          if (response.ok) {
            const profileData = await response.json()
            setProfilePicture(profileData.profile_picture_url)
          }
        } catch (error) {
          console.error("Failed to fetch user profile:", error)
        }
      }
    }

    fetchUserProfile()
  }, [user])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const navbarStyle = {
    background: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    padding: 0,
    position: "sticky",
    top: 0,
    zIndex: 1000,
  }

  const containerStyle = {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 1rem",
    height: "64px",
  }

  const brandStyle = {
    fontSize: "1.25rem",
    fontWeight: "bold",
    color: "#111827",
    textDecoration: "none",
  }

  const profileTriggerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.5rem",
    background: "transparent",
    border: "none",
    borderRadius: "0.5rem",
    cursor: "pointer",
    transition: "background-color 0.2s",
  }

  const avatarStyle = {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "#3b82f6",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.875rem",
    fontWeight: "500",
    overflow: "hidden",
    border: "2px solid #e5e7eb",
  }

  const profileImageStyle = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "50%",
  }

  const dropdownMenuStyle = {
    position: "absolute",
    top: "100%",
    right: 0,
    marginTop: "0.25rem",
    width: "240px",
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "0.5rem",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    zIndex: 50,
  }

  const dropdownHeaderStyle = {
    padding: "1rem",
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  }

  const dropdownAvatarStyle = {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    background: "#3b82f6",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1rem",
    fontWeight: "500",
    overflow: "hidden",
    border: "2px solid #e5e7eb",
    flexShrink: 0,
  }

  const dropdownItemStyle = {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    width: "100%",
    padding: "0.75rem 1rem",
    fontSize: "0.875rem",
    color: "#374151",
    textDecoration: "none",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    transition: "background-color 0.2s",
  }

  const logoutItemStyle = {
    ...dropdownItemStyle,
    color: "#dc2626",
  }

  const btnStyle = {
    padding: "0.5rem 1rem",
    borderRadius: "0.375rem",
    fontSize: "0.875rem",
    fontWeight: "500",
    textDecoration: "none",
    border: "1px solid transparent",
    cursor: "pointer",
    transition: "all 0.2s",
    marginLeft: "0.5rem",
  }

  const btnOutlineStyle = {
    ...btnStyle,
    color: "#374151",
    borderColor: "#d1d5db",
    background: "white",
  }

  const btnPrimaryStyle = {
    ...btnStyle,
    color: "white",
    background: "#3b82f6",
    borderColor: "#3b82f6",
  }

  const getProfileImageUrl = () => {
    if (profilePicture) {
      // If it's already a full URL, use it as is
      if (profilePicture.startsWith("http")) {
        return profilePicture
      }
      // Otherwise, prepend your backend URL
      return `http://localhost:5000${profilePicture}`
    }
    return null
  }

  return (
    <nav style={navbarStyle}>
      <div style={containerStyle}>
        <Link to="/" style={brandStyle}>
          Job Portal
        </Link>

        <div style={{ display: "flex", alignItems: "center" }}>
          {user ? (
            <div style={{ position: "relative" }} ref={dropdownRef}>
              <button
                style={profileTriggerStyle}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#f3f4f6")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
              >
                <div style={avatarStyle}>
                  {getProfileImageUrl() ? (
                    <img
                      src={getProfileImageUrl() || "/placeholder.svg"}
                      alt={user.name}
                      style={profileImageStyle}
                      onError={(e) => {
                        // Fallback to initials if image fails to load
                        e.target.style.display = "none"
                        e.target.nextSibling.style.display = "flex"
                      }}
                    />
                  ) : null}
                  <div
                    style={{
                      display: getProfileImageUrl() ? "none" : "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                      height: "100%",
                    }}
                  >
                    {getInitials(user.name)}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "0.875rem", fontWeight: "500", color: "#111827" }}>Hi, {user.name}</span>
                </div>
                <svg
                  style={{
                    transition: "transform 0.2s",
                    color: "#6b7280",
                    transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6,9 12,15 18,9"></polyline>
                </svg>
              </button>

              {isDropdownOpen && (
                <div style={dropdownMenuStyle}>
                  <div style={dropdownHeaderStyle}>
                    <div style={dropdownAvatarStyle}>
                      {getProfileImageUrl() ? (
                        <img
                          src={getProfileImageUrl() || "/placeholder.svg"}
                          alt={user.name}
                          style={profileImageStyle}
                          onError={(e) => {
                            e.target.style.display = "none"
                            e.target.nextSibling.style.display = "flex"
                          }}
                        />
                      ) : null}
                      <div
                        style={{
                          display: getProfileImageUrl() ? "none" : "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "100%",
                          height: "100%",
                        }}
                      >
                        {getInitials(user.name)}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                      <p style={{ fontSize: "0.875rem", fontWeight: "600", color: "#111827", margin: 0 }}>
                        {user.name}
                      </p>
                      {user.email && <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: 0 }}>{user.email}</p>}
                    </div>
                  </div>
                  <div style={{ height: "1px", background: "#e5e7eb", margin: "0.25rem 0" }}></div>

                  <Link
                    to="/profile"
                    style={dropdownItemStyle}
                    onClick={() => setIsDropdownOpen(false)}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "#f3f4f6"
                      e.target.style.color = "#111827"
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "transparent"
                      e.target.style.color = "#374151"
                    }}
                  >
                    <svg
                      style={{ flexShrink: 0 }}
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    My Profile
                  </Link>

                  <Link
                    to="/job-applications"
                    style={dropdownItemStyle}
                    onClick={() => setIsDropdownOpen(false)}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "#f3f4f6"
                      e.target.style.color = "#111827"
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "transparent"
                      e.target.style.color = "#374151"
                    }}
                  >
                    <svg
                      style={{ flexShrink: 0 }}
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14,2 14,8 20,8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10,9 9,9 8,9"></polyline>
                    </svg>
                    Job Applications
                  </Link>

                  <Link
                    to="/saved-jobs"
                    style={dropdownItemStyle}
                    onClick={() => setIsDropdownOpen(false)}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "#f3f4f6"
                      e.target.style.color = "#111827"
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "transparent"
                      e.target.style.color = "#374151"
                    }}
                  >
                    <svg
                      style={{ flexShrink: 0 }}
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                    </svg>
                    Saved Jobs
                  </Link>

                  <Link
                    to="/account-settings"
                    style={dropdownItemStyle}
                    onClick={() => setIsDropdownOpen(false)}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "#f3f4f6"
                      e.target.style.color = "#111827"
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "transparent"
                      e.target.style.color = "#374151"
                    }}
                  >
                    <svg
                      style={{ flexShrink: 0 }}
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >wwwwww 
                      <circle cx="12" cywwwwww ="12" r="3"></circle>
                      <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1m17-4a4 4 0 0 1-8 0 4 4 0 0 1 8 0zM7 12a4 4 0 0 1-8 0 4 4 0 0 1 8 0z"></path>
                    </svg>
                    Account Settings
                  </Link>

                  <div style={{ height: "1px", background: "#e5e7eb", margin: "0.25rem 0" }}></div>

                  <button
                    style={logoutItemStyle}
                    onClick={handleLogout}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "#fef2f2"
                      e.target.style.color = "#dc2626"
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "transparent"
                      e.target.style.color = "#dc2626"
                    }}
                  >
                    <svg
                      style={{ flexShrink: 0 }}
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16,17 21,12 16,7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center" }}>
              <Link to="/login" style={btnOutlineStyle}>
                Login
              </Link>
              <Link to="/register" style={btnPrimaryStyle}>
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
