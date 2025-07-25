// AdminMessagingPage.js
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
    const messagesEndRef = useRef();

    // Effect to join socket and fetch initial seekers
    useEffect(() => {
        socket.emit('join', { userId: user.id });
    
        // Restore seekers from cache
        const cachedSeekers = localStorage.getItem('adminSeekers');
        if (cachedSeekers) {
            try {
                const parsedSeekers = JSON.parse(cachedSeekers);
                setSeekers(parsedSeekers);
            } catch (e) {
                console.error("Failed to parse cached seekers", e);
            }
        }
    
        // Fetch fresh list
        fetch(`${API_URL}/api/messages/seekers/${user.id}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.length > 0) {
                    setSeekers(data);
                    localStorage.setItem('adminSeekers', JSON.stringify(data));
                }
    
                // Restore selected seeker
                const storedSelectedSeekerId = localStorage.getItem('selectedSeekerId');
                if (storedSelectedSeekerId) {
                    const storedId = parseInt(storedSelectedSeekerId);
                    const foundSeeker = data.find(s => s.id === storedId);
                    if (foundSeeker) {
                        setSelectedSeeker(foundSeeker);
                    }
                }
            })
            .catch(console.error);
    
        // Set up message listener once
        const handleReceiveMessage = async (data) => {
            const isCurrentChat = selectedSeeker && data.senderId === selectedSeeker.id;
    
            if (isCurrentChat) {
                setMessages(prev => {
                    const last = prev[prev.length - 1];
                    if (!last || last.content !== data.content || last.timestamp !== data.timestamp) {
                        return [...prev, data];
                    }
                    return prev;
                });
            }
    
            setSeekers(prev => {
                if (prev.some(s => s.id === data.senderId)) return prev;
    
                fetch(`${API_URL}/api/users/${data.senderId}`)
                    .then(res => res.json())
                    .then(newSeeker => {
                        const updated = [...prev, newSeeker];
                        setSeekers(updated);
                        localStorage.setItem('adminSeekers', JSON.stringify(updated));
                    });
    
                return prev;
            });
        };
    
        socket.on('receiveMessage', handleReceiveMessage);
    
        return () => {
            socket.off('receiveMessage', handleReceiveMessage);
        };
    }, [user.id, selectedSeeker]);
    

    // Effect to fetch messages when a seeker is selected
    useEffect(() => {
        if (!selectedSeeker) {
            setMessages([]);
            return;
        }
    
        fetch(`${API_URL}/api/messages/${selectedSeeker.id}/${user.id}`)
            .then((res) => res.json())
            .then(setMessages)
            .catch(console.error);
    
        localStorage.setItem('selectedSeekerId', selectedSeeker.id);
    }, [selectedSeeker, user.id]);
    

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSeekerClick = (seeker) => {
        setSelectedSeeker(seeker);
    };

    const sendMessage = async () => {
        if (!input.trim() || !selectedSeeker) return;

        const message = {
            senderId: user.id,
            receiverId: selectedSeeker.id,
            content: input,
        };

        socket.emit('sendMessage', message);

        await fetch(`${API_URL}/api/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(message),
        });

        setMessages((prev) => [...prev, { ...message, timestamp: new Date().toISOString() }]);
        setInput('');
    };

    return (
        <div style={styles.container}>
            <div style={styles.layout}>
                <div style={styles.sidebar}>
                    <p>Seekers</p>
                    {seekers.map((seeker) => (
                        <div
                            key={seeker.id}
                            onClick={() => handleSeekerClick(seeker)}
                            style={{
                                ...styles.seekerItem,
                                backgroundColor: selectedSeeker?.id === seeker.id ? '#e0e7ff' : 'white',
                            }}
                        >
                            {seeker.name}
                        </div>
                    ))}
                </div>

                <div style={styles.chatBox}>
                    {selectedSeeker ? (
                        <>
                            <h3 style={styles.h3}>Chat with {selectedSeeker.name}</h3>
                                <div style={styles.messages}>
                                    {messages.map((msg, i) => {
                                        const isSender = msg.sender_id === user.id || msg.senderId === user.id;
                                        return (
                                            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: isSender ? 'flex-end' : 'flex-start' }}>
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
                        <p>Select a seeker to start chatting</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminMessagingPage;

const styles = {
    container: { 
        padding: '1rem' 
    },
    layout: { 
        display: 'flex', 
        gap: '20px' 
    },
    sidebar: { 
        width: '200px', 
        borderRight: '1px solid #ccc', 
        paddingRight: '1rem' 
    },
    seekerItem: { 
        padding: '0.5rem', 
        cursor: 'pointer', 
        borderBottom: '1px solid #eee' 
    },
    chatBox: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '80vh', // 80% of the viewport height
        border: '1px solid #ccc',
        borderRadius: '8px',
        overflow: 'hidden',
    },
    messages: {
        flex: 1,
        padding: '1rem',
        overflowY: 'auto',
        background: '#f9f9f9',
        maxHeight: 'calc(80vh - 100px)', // optional fallback if needed
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
        padding: '0.5rem' 
    },
    button: { 
        padding: '0.5rem 1rem', 
        background: '#2563eb', 
        color: '#fff', 
        border: 'none', 
        borderRadius: '4px' 
    },
};