import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import socket from '../socket';
import config from '../config';

const API_URL = config.API_URL;

const SeekerMessagingPage = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef();

    const ADMIN_ID = 1; // your admin ID

    useEffect(() => {
        if (!user) return;

        socket.emit('join', { userId: user.id });

        socket.on('receiveMessage', (data) => {
            setMessages(prev => {
                if (prev.some(msg => msg.id === data.id)) return prev;
                return [...prev, data];
            });
        });

        fetch(`${API_URL}/api/messages/${user.id}/${ADMIN_ID}`)
            .then(res => res.json())
            .then(data => setMessages(data))
            .catch(console.error);

        return () => {
            socket.off('receiveMessage');
        };
    }, [user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = () => {
        if (!input.trim()) return;
        const message = {
            senderId: user.id,
            receiverId: ADMIN_ID,
            content: input
        };
        socket.emit('sendMessage', message);
        setInput('');
    };

    return (
        <div style={styles.container}>
            <h2>Chat with HR</h2>
            <div style={styles.chatBox}>
                <div style={styles.messages}>
                    {messages.map((msg) => {
                        const isSender = msg.sender_id === user.id || msg.senderId === user.id;
                        return (
                            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isSender ? 'flex-end' : 'flex-start' }}>
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
            </div>
        </div>
    );
};

export default SeekerMessagingPage;

const styles = {
    container: {
        padding: '1rem',
        maxWidth: '600px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        height: '80vh',
    },
    chatBox: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #ccc',
        borderRadius: '8px',
        overflow: 'hidden',
        background: '#f9f9f9',
    },
    messages: {
        flex: 1,
        padding: '1rem',
        overflowY: 'auto',
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
};
