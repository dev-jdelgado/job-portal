import { io } from "socket.io-client";
import { useState, useRef, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { BiSolidMessage } from "react-icons/bi";
import SkillLinkLogo from '../images/SkillLink-Logo-Banner.png';
import config from '../config';

const API_URL = config.API_URL;
const socket = io(config.API_SOCKET_URL || "http://localhost:5000");

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isNotifDropdownOpen, setNotifDropdownOpen] = useState(false)
  const [profilePicture, setProfilePicture] = useState(null)
  const dropdownRef = useRef(null)
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  const handleLogout = () => {
    logout()
    navigate("/login")
    localStorage.removeItem('adminSeekers');
    localStorage.removeItem('selectedSeekerId');
  }

  useEffect(() => {
    if (!user?.id) return;
  
    // Fetch initial unread messages count
    const fetchUnreadMessages = async () => {
      try {
        const res = await fetch(`${API_URL}/api/messages/unread-count/${user.id}`);
        const data = await res.json();
        setUnreadMessagesCount(data.unreadCount || 0);
      } catch (err) {
        console.error("Error fetching unread messages count:", err);
      }
    };
  
    fetchUnreadMessages();
  
    // Join socket room for this user to receive messages
    socket.emit("join", { userId: user.id });
  
    // Listen for incoming messages
    socket.on("receiveMessage", (message) => {
      // If message is for current user and is unread, increment badge
      if (message.receiver_id === user.id && message.is_read === 0) {
        setUnreadMessagesCount((count) => count + 1);
      }
    });
  
    // Cleanup on unmount or user change
    return () => {
      socket.off("receiveMessage");
    };
  }, [user?.id]);


  const getInitials = (name) => {
    if (!name) return ""
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Fetch Notification
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${API_URL}/jobs/notifications/${user?.id}`);
        const data = await res.json();
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };
  
    if (user?.id) fetchNotifications();
  }, [user?.id]);

  // Fetch user profile picture
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.id) {
        try {
          const response = await fetch(`${API_URL}/api/users/${user.id}`)
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

  // --- Start of Style Definitions ---
  const navbarStyle = {
    background: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    padding: 0,
    position: "sticky",
    top: 0,
    zIndex: 1000,
  }

  const containerStyle = {
    maxWidth: "1320px",
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

  const Logo = {
    height: "45px"
  }

  const profileTriggerStyle = {
    display: "flex",
    alignItems: "center",
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
    width: "300px",
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
  // --- End of Style Definitions ---

  const getProfileImageUrl = () => {
    if (profilePicture) {
      if (profilePicture.startsWith("http")) {
        return profilePicture
      }
      return `${API_URL}/uploads/${user.id}/profile/${profilePicture}`
    }
    return null
  }

  return (
    <nav style={navbarStyle}>
      <div style={containerStyle}>
        <Link to="/" style={brandStyle}>
          <img style={Logo} src={SkillLinkLogo} alt="SkillLink Logo" className="logo"/>
        </Link>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>

          {user && (
            <Link
              className="me-2 me-sm-4"
              to={user.role === "seeker" ? "/messaging" : "/admin/messaging"}
              style={{
                fontWeight: "500",
                color: "#111827",
                fontSize: "20px",
                display: "flex",
                position: "relative",
              }}
              title="Messages"
            >
              <BiSolidMessage />
              {unreadMessagesCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-5px",
                    right: "-8px",
                    backgroundColor: "red",
                    color: "white",
                    borderRadius: "50%",
                    padding: "2px 6px",
                    fontSize: "10px",
                    fontWeight: "bold",
                    pointerEvents: "none",
                  }}
                >
                  {unreadMessagesCount}
                </span>
              )}
            </Link>
          )}

          {user?.role !== 'admin' && (
            <div className="me-2 me-sm-4" style={{ position: "relative", marginRight: "1rem" }} ref={dropdownRef}>
              <button
                onClick={() => setNotifDropdownOpen(!isNotifDropdownOpen)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  position: "relative",
                  padding: "0"
                }}
              >
                <i className="fas fa-bell" style={{ fontSize: "20px", color: "#111827" }}></i>
                {unreadCount > 0 && (
                  <span style={{
                    position: "absolute", top: "-5px", right: "-8px",
                    backgroundColor: "red", color: "white",
                    borderRadius: "50%", padding: "2px 6px",
                    fontSize: "10px", fontWeight: "bold"
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotifDropdownOpen && (
                <div className='notification-dropdown' style={{
                  position: "absolute",
                  right: 0,
                  marginTop: "0.5rem",
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.5rem",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                  width: "300px",
                  maxHeight: "400px",
                  overflowY: "auto",
                  zIndex: 50
                }}>
                  <div style={{ padding: "0.5rem", fontWeight: "bold", borderBottom: "1px solid #e5e7eb" }}>
                    Notifications
                  </div>
                  {notifications.length === 0 ? (
                    <div style={{ padding: "0.75rem", color: "#6b7280", fontSize: "0.875rem" }}>
                      No new notifications
                    </div>
                  ) : (
                    notifications.map((notification, index) => (
                      <div
                        key={index}
                        style={{
                          padding: "0.75rem",
                          borderBottom: "1px solid #f3f4f6",
                          backgroundColor: notification.is_read ? "white" : "#d6ebff",
                          fontSize: "0.875rem",
                          cursor: "pointer"
                        }}
                        onClick={async () => {
                          try {
                            await fetch(`${API_URL}/jobs/notifications/mark-read/${notification.id}`, { method: "POST" });
                        
                            setNotifications((prevNotifications) =>
                              prevNotifications.map((n) =>
                                n.id === notification.id ? { ...n, is_read: true } : n
                              )
                            );
                        
                            setUnreadCount((prevCount) => Math.max(prevCount - 1, 0));
                        
                          } catch (err) {
                            console.error("Error marking notification as read:", err);
                          }
                        }}                                            
                      >
                        {notification.message}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {user ? (
            <div style={{ position: "relative" }} ref={dropdownRef}>
              <button
                className="gap-sm-2 gap-1"
                style={profileTriggerStyle}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f3f4f6")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <div style={avatarStyle}>
                  {getProfileImageUrl() ? (
                    <img
                      src={getProfileImageUrl()}
                      alt={user.name}
                      style={profileImageStyle}
                      onError={(e) => {
                        e.target.style.display = "none"
                        const nextSibling = e.target.nextSibling
                        if (nextSibling) {
                            nextSibling.style.display = "flex"
                        }
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
                  <span className="hide-on-mobile" style={{ fontSize: "0.875rem", fontWeight: "500", color: "#111827" }}>{user.name}</span>
                </div>
                <svg
                  className="dropdown-arrow"
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
                <div style={dropdownMenuStyle} className="dropdown-profile">
                  <div style={dropdownHeaderStyle}>
                    <div style={dropdownAvatarStyle}>
                      {getProfileImageUrl() ? (
                        <img
                          src={getProfileImageUrl()}
                          alt={user.name}
                          style={profileImageStyle}
                          onError={(e) => {
                            e.target.style.display = "none"
                            const nextSibling = e.target.nextSibling
                            if (nextSibling) {
                                nextSibling.style.display = "flex"
                            }
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

                  {user.role === 'seeker' && (
                    <>
                      <Link
                        to="/profile"
                        style={dropdownItemStyle}
                        onClick={() => setIsDropdownOpen(false)}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f3f4f6"; e.currentTarget.style.color = "#111827"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#374151"; }}
                      >
                        <svg style={{ flexShrink: 0 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        My Profile
                      </Link>
                      <Link
                        to="/job-applications"
                        style={dropdownItemStyle}
                        onClick={() => setIsDropdownOpen(false)}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f3f4f6"; e.currentTarget.style.color = "#111827"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#374151"; }}
                      >
                        <svg style={{ flexShrink: 0 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14,2 14,8 20,8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10,9 9,9 8,9"></polyline>
                        </svg>
                        Job Applications
                      </Link>
                    </>
                  )}

                  {user.role === 'admin' && (
                    <>
                       <Link
                        to="/admin-dashboard"
                        style={dropdownItemStyle}
                        onClick={() => setIsDropdownOpen(false)}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f3f4f6"; e.currentTarget.style.color = "#111827"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#374151"; }}
                      >
                        <svg style={{ flexShrink: 0 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                           <rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect>
                        </svg>
                        Dashboard
                      </Link>
                      </>
                       )}
                      {/* 
                      {user.role === 'system_admin' && (
                      <Link
                        to="/admin/create-user"
                        style={dropdownItemStyle}
                        onClick={() => setIsDropdownOpen(false)}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f3f4f6"; e.currentTarget.style.color = "#111827"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#374151"; }}
                      >
                        <svg style={{ flexShrink: 0 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                           <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="17" y1="11" x2="23" y2="11"></line>
                        </svg>
                        Create User
                      </Link>
                      )}
                      */}
                 

                  <Link
                    to="/account-settings"
                    style={dropdownItemStyle}
                    onClick={() => setIsDropdownOpen(false)}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f3f4f6"; e.currentTarget.style.color = "#111827"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#374151"; }}
                  >
                    <svg style={{ flexShrink: 0 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3"></circle>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                    Account Settings
                  </Link>

                  <div style={{ height: "1px", background: "#e5e7eb", margin: "0.25rem 0" }}></div>

                  <button
                    style={logoutItemStyle}
                    onClick={handleLogout}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#fef2f2"; e.currentTarget.style.color = "#dc2626"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#dc2626"; }}
                  >
                    <svg style={{ flexShrink: 0 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16,17 21,12 16,7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line>
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
