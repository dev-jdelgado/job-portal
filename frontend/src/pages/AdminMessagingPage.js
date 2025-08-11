import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import socket from '../socket';
import config from '../config';

const API_URL = config.API_URL;

const AdminMessagingPage = () => {
  const { user } = useAuth();
  const [seekers, setSeekers] = useState([]);
  const [selectedSeeker, setSelectedSeeker] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef();

  // Handle window resize to update isMobile
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setShowSidebar(true); // always show sidebar on desktop
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!user) return;

    socket.emit('join', { userId: user.id });

    const cachedSeekers = localStorage.getItem('adminSeekers');
    if (cachedSeekers) {
      try {
        setSeekers(JSON.parse(cachedSeekers));
      } catch (e) {
        console.error("Failed to parse cached seekers", e);
      }
    }

    socket.on('updateSeekers', (newSeekers) => {
      setSeekers(prev => {
        const ids = prev.map(s => s.id);
        const merged = [...prev];
        newSeekers.forEach(seeker => {
          if (!ids.includes(seeker.id)) {
            merged.push(seeker);
          }
        });
        localStorage.setItem('adminSeekers', JSON.stringify(merged));
        return merged;
      });
    });

    socket.on('receiveMessage', (data) => {
      setMessages(prev => {
        if (prev.some(msg => msg.id === data.id)) return prev;
        return [...prev, data];
      });
    });

    return () => {
      socket.off('updateSeekers');
      socket.off('receiveMessage');
    };
  }, [user]);

  useEffect(() => {
    if (!selectedSeeker) {
      setMessages([]);
      return;
    }
    fetch(`${API_URL}/api/messages/${selectedSeeker.id}/${user.id}`)
      .then(res => res.json())
      .then(data => setMessages(data))
      .catch(console.error);

    localStorage.setItem('selectedSeekerId', selectedSeeker.id);

    if (isMobile) {
      setShowSidebar(false); // On mobile, hide sidebar when seeker selected
    }
  }, [selectedSeeker, user.id, isMobile]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !selectedSeeker) return;
    const message = {
      senderId: user.id,
      receiverId: selectedSeeker.id,
      content: input
    };
    socket.emit('sendMessage', message);
    setInput('');
  };

  const handleBackClick = () => {
    setShowSidebar(true);
    setSelectedSeeker(null);
  };

  return (
    <div style={styles.container}>
      <div style={{ 
        ...styles.layout, 
        flexDirection: isMobile ? 'column' : 'row',
        height: '80vh'
      }}>
        {(showSidebar || !isMobile) && (
          <div style={{
            ...styles.sidebar,
            width: isMobile ? '100%' : '200px',
            borderRight: isMobile ? 'none' : '1px solid #ccc',
            borderBottom: isMobile ? '1px solid #ccc' : 'none',
          }}>
            <p style={{ fontWeight: 'bold' }}>Seekers</p>
            {seekers.map((seeker) => (
              <div
                key={seeker.id}
                onClick={() => setSelectedSeeker(seeker)}
                style={{
                  ...styles.seekerItem,
                  backgroundColor: selectedSeeker?.id === seeker.id ? '#e0e7ff' : 'white',
                }}
              >
                {seeker.name}
              </div>
            ))}
          </div>
        )}

        {(!showSidebar || !isMobile) && (
          <div style={{
            ...styles.chatBox,
            width: isMobile ? '100%' : 'auto',
            height: isMobile ? 'calc(80vh - 50px)' : '80vh',
          }}>
            {selectedSeeker ? (
              <>
                {isMobile && (
                  <button 
                    onClick={handleBackClick} 
                    style={styles.backButton}
                    aria-label="Back to seekers list"
                  >
                    ← Back
                  </button>
                )}
                <h3 style={styles.h3}>Chat with {selectedSeeker.name}</h3>
                <div style={styles.messages}>
                  {messages.map((msg) => {
                    const isSender = msg.sender_id === user.id || msg.senderId === user.id;
                    return (
                      <div 
                        key={msg.id} 
                        style={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: isSender ? 'flex-end' : 'flex-start' 
                        }}
                      >
                        <div style={isSender ? styles.sender : styles.receiver}>
                          {msg.content}
                        </div>
                        <div style={styles.timestamp}>{new Date(msg.timestamp).toLocaleString()}</div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef}></div>
                </div>
                <div style={styles.inputBox}>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    style={styles.input}
                    placeholder="Type a message..."
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <button onClick={sendMessage} style={styles.button}>Send</button>
                </div>
              </>
            ) : (
              <p style={{ padding: '1rem' }}>Select a seeker to start chatting</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMessagingPage;

const styles = {
  container: {
    padding: '1rem',
  },
  layout: {
    display: 'flex',
    gap: '20px',
  },
  sidebar: {
    borderRight: '1px solid #ccc',
    paddingRight: '1rem',
    overflowY: 'auto',
    maxHeight: '80vh',
  },
  seekerItem: {
    padding: '0.5rem',
    cursor: 'pointer',
    borderBottom: '1px solid #eee',
  },
  chatBox: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid #ccc',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  messages: {
    flex: 1,
    padding: '1rem',
    overflowY: 'auto',
    background: '#f9f9f9',
  },
  sender: {
    alignSelf: 'flex-end',
    backgroundColor: '#2563eb',
    color: '#fff',
    padding: '10px 15px',
    borderRadius: '18px 18px 4px 18px',
    maxWidth: '70%',
    margin: '8px 0',
    wordWrap: 'break-word',
  },
  receiver: {
    alignSelf: 'flex-start',
    backgroundColor: '#e5e7eb',
    color: '#000',
    padding: '10px 15px',
    borderRadius: '18px 18px 18px 4px',
    maxWidth: '70%',
    margin: '8px 0',
    wordWrap: 'break-word',
  },
  h3: {
    padding: '.5rem 1rem',
    margin: 0,
  },
  timestamp: {
    fontSize: '0.7rem',
    marginTop: '4px',
    opacity: 0.6,
    textAlign: 'right',
  },
  inputBox: {
    display: 'flex',
    gap: '10px',
    padding: '1rem',
    borderTop: '1px solid #ccc',
    background: '#fff',
  },
  input: {
    flex: 1,
    padding: '0.5rem',
  },
  button: {
    padding: '0.5rem 1rem',
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: '#2563eb',
    fontSize: '1rem',
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    textAlign: 'left',
  },
};
