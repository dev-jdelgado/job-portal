import { io } from "socket.io-client";
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BiSolidMessage, BiX, BiMessageRoundedDots  } from "react-icons/bi";
import SkillLinkLogo from "../images/SkillLink-Logo-Banner.png";
import config from "../config";


const API_URL = config.API_URL;
const socketURL = process.env.REACT_APP_SOCKET_URL;
const socket = io(socketURL);

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const dropdownRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [isFAQOpen, setIsFAQOpen] = useState(false);
  const chatBodyRef = useRef(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const faqs = [
    {
      q: "I am a person with disability (PWD). How can I register on SkillLink?",
      a: "Go to the registration page and fill out your personal details. In the “PWD Category” section, select your disability type and upload your valid PWD ID to verify your status.",
    },
    {
      q: "What if I don’t have a PWD ID yet?",
      a: "You can still register, but your account will be marked as “Pending Verification” until you upload your PWD ID or supporting documents verified by the HRMO.",
    },
    {
      q: "Can a family member or guardian register for me?",
      a: "Yes. A guardian can assist in creating your account, but your personal and employment details must reflect your own information.",
    },
    {
      q: "Are there jobs specifically for PWDs?",
      a: "Yes. The system has a dedicated section for PWD-targeted job listings, verified and posted by the Provincial Government of Quezon through HRMO.",
    },
    {
      q: "Can I apply for non-PWD jobs?",
      a: "Absolutely. SkillLink promotes equal employment opportunities, and you may apply for any job that matches your skills and qualifications.",
    },
    {
      q: "How do I know if my job application was submitted successfully?",
      a: "Once you submit your application, you’ll receive a confirmation message and can check your “Application Status” on your dashboard.",
    },
    {
      q: "Is SkillLink accessible for visually impaired users?",
      a: "Yes. The system is designed with accessibility features such as screen reader compatibility, high-contrast mode, and keyboard navigation support.",
    },
    {
      q: "What should I do if I encounter difficulty using the website?",
      a: "You may contact the SkillLink Support Team or visit the Help Center. The HRMO also provides assistance to PWD applicants who need technical or physical support.",
    },
    {
      q: "Can I request assistance in filling out online forms?",
      a: "Yes. Assistance is available through the HRMO’s PWD Support Desk, or you can ask a trusted person to help you complete the forms online. Documents & Verification",
    },
    {
      q: "What documents are required for PWD verification?",
      a: "You’ll need to upload a valid PWD ID issued by your local government unit (LGU) or a medical certification confirming your disability.",
    },
    {
      q: "How long does verification take?",
      a: "Verification usually takes 1–3 business days. You’ll receive an email or notification once your account is verified.",
    },
    {
      q: "Who reviews my PWD verification?",
      a: "The Human Resource Management Office (HRMO) of the Provincial Government of Quezon verifies and approves all PWD-related registrations.",
    },
  ];

  const handleUserQuestion = (question, answer) => {
    // Add user message
    setChatMessages((prev) => [...prev, { sender: "user", text: question }]);
    setIsTyping(true);
  
    // Scroll after user message
    setTimeout(() => {
      if (chatBodyRef.current) {
        chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
      }
    }, 100);
  
    // Simulate bot typing and response
    setTimeout(() => {
      setIsTyping(false);
      setChatMessages((prev) => [...prev, { sender: "bot", text: answer }]);
  
      // Scroll again when bot replies
      setTimeout(() => {
        if (chatBodyRef.current) {
          chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
      }, 100);
    }, 1000);
  };
  

  const handleLogout = () => {
    logout();
    navigate("/login");
    localStorage.removeItem("adminSeekers");
    localStorage.removeItem("selectedSeekerId");
  };

  useEffect(() => {
    if (!user?.id) return;

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
    socket.emit("join", { userId: user.id });

    socket.on("receiveMessage", (message) => {
      if (message.receiver_id === user.id && message.is_read === 0) {
        setUnreadMessagesCount((count) => count + 1);
      }
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [user?.id]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${API_URL}/jobs/notifications/${user?.id}`);
        const data = await res.json();
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.is_read).length);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };
    if (user?.id) fetchNotifications();
  }, [user?.id]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.id) {
        try {
          const response = await fetch(`${API_URL}/api/users/${user.id}`);
          if (response.ok) {
            const profileData = await response.json();
            setProfilePicture(profileData.profile_picture_url);
          }
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
        }
      }
    };
    fetchUserProfile();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getInitials = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getProfileImageUrl = () => {
    if (profilePicture) {
      if (profilePicture.startsWith("http")) return profilePicture;
      return `${API_URL}/uploads/${user.id}/profile/${profilePicture}`;
    }
    return null;
  };


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

  return (
    <>
      <nav style={navbarStyle}>
        <div style={containerStyle}>
          <Link to="/" style={brandStyle}>
            <img style={Logo} src={SkillLinkLogo} alt="SkillLink Logo" className="logo" />
          </Link>

          <div className="navbar-actions">
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

            {/* Notification Bell */}
            {user?.role !== "admin" && (
              <div className="me-2 me-sm-4" style={{ position: "relative", marginRight: "1rem" }} ref={dropdownRef}>
                <button
                  onClick={() => setNotifDropdownOpen(!isNotifDropdownOpen)}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    position: "relative",
                    padding: "0",
                  }}
                >
                  <i className="fas fa-bell" style={{ fontSize: "20px", color: "#111827" }}></i>
                  {unreadCount > 0 && (
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
                      }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </button>

                {isNotifDropdownOpen && (
                  <div
                    className="notification-dropdown"
                    style={{
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
                      zIndex: 50,
                    }}
                  >
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
                            cursor: "pointer",
                          }}
                          onClick={async () => {
                            try {
                              await fetch(`${API_URL}/jobs/notifications/mark-read/${notification.id}`, {
                                method: "POST",
                              });
                              setNotifications((prev) =>
                                prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
                              );
                              setUnreadCount((prev) => Math.max(prev - 1, 0));
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

            {/* User Menu */}
            {user ? (
              <div style={{ position: "relative" }} ref={dropdownRef}>
                <button
                  style={profileTriggerStyle}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <div style={avatarStyle}>
                    {getProfileImageUrl() ? (
                      <img src={getProfileImageUrl()} alt={user.name} style={profileImageStyle} />
                    ) : (
                      getInitials(user.name)
                    )}
                  </div>
                  <span style={{ marginLeft: "8px", fontWeight: "500" }}>{user.name}</span>
                </button>

                {isDropdownOpen && (
                  <div style={dropdownMenuStyle} className="dropdown-profile">
                    <Link to="/profile" style={dropdownItemStyle}>
                      My Profile
                    </Link>
                    {user.role === "seeker" && (
                      <Link to="/job-applications" style={dropdownItemStyle}>
                        Job Applications
                      </Link>
                    )}
                    <Link to="/account-settings" style={dropdownItemStyle}>
                      Account Settings
                    </Link>
                    <button style={logoutItemStyle} onClick={handleLogout}>
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

      {user?.role === "seeker" && (
        <div style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 9999 }}>
          <button
            onClick={() => setIsFAQOpen(!isFAQOpen)}
            style={{
              position: "fixed",
              bottom: "30px",
              right: "30px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "50%",
              width: "60px",
              height: "60px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              transition: "transform 0.3s ease, background-color 0.3s ease",
              zIndex: 1000,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            title="Open FAQ"
          >
            <BiMessageRoundedDots />
          </button>
          {isFAQOpen && (
            <div
              className="faq-popup"
              style={{
                position: "absolute",
                bottom: "80px",
                right: "0",
                width: "320px",
                maxHeight: "450px",
                backgroundColor: "#f9fafb",
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                animation: "slideUp 0.3s ease",
              }}
            >
              {/* Header */}
              <div
                style={{
                  backgroundColor: "#2563eb",
                  color: "white",
                  padding: "12px",
                  fontWeight: "bold",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>💬 SkillLink Assistant</span>
                <button
                  onClick={() => setIsFAQOpen(false)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "white",
                    fontSize: "22px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  title="Close FAQ"
                >
                  <BiX />
                </button>
              </div>

              {/* Chat Body */}
              <div
                ref={chatBodyRef}
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  backgroundColor: "#f3f4f6",
                  scrollBehavior: "smooth",
                }}
              >
                {chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    style={{
                      alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                      backgroundColor: msg.sender === "user" ? "#2563eb" : "white",
                      color: msg.sender === "user" ? "white" : "#111827",
                      padding: "8px 12px",
                      borderRadius:
                        msg.sender === "user"
                          ? "12px 12px 0 12px"
                          : "12px 12px 12px 0",
                      boxShadow:
                        msg.sender === "bot"
                          ? "0 1px 3px rgba(0,0,0,0.1)"
                          : "none",
                      maxWidth: "80%",
                      fontSize: "14px",
                      lineHeight: "1.4",
                      animation: "fadeIn 0.3s ease",
                    }}
                  >
                    {msg.text}
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div
                    style={{
                      alignSelf: "flex-start",
                      backgroundColor: "white",
                      color: "#111827",
                      padding: "8px 12px",
                      borderRadius: "12px 12px 12px 0",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      maxWidth: "80%",
                      fontSize: "14px",
                      display: "flex",
                      gap: "4px",
                    }}
                  >
                    <span className="typing-dot">•</span>
                    <span className="typing-dot">•</span>
                    <span className="typing-dot">•</span>
                  </div>
                )}
              </div>

              {/* Footer with Question Buttons */}
              <div
                style={{
                  backgroundColor: "white",
                  borderTop: "1px solid #e5e7eb",
                  padding: "10px",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "6px",
                  justifyContent: "center",
                }}
              >
                {faqs.map((faq, i) => (
                  <button
                    key={i}
                    onClick={() => handleUserQuestion(faq.q, faq.a)}
                    style={{
                      backgroundColor: "#2563eb",
                      color: "white",
                      border: "none",
                      borderRadius: "20px",
                      padding: "6px 12px",
                      fontSize: "12px",
                      cursor: "pointer",
                      transition: "0.2s",
                    }}
                  >
                    {faq.q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Navbar;
