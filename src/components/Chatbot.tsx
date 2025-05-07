import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css';
import SendIcon from '@mui/icons-material/Send';
import ReactMarkdown from 'react-markdown';

const Chatbot: React.FC = () => {
    const defaultContext = [
        "Hello! I’m here to help you with health-related questions. Feel free to ask me anything!",
    ];

    const [messages, setMessages] = useState<{ text: string; type: 'user' | 'bot' }[]>(defaultContext.map((msg) => ({ text: msg, type: 'bot' })));
    const [input, setInput] = useState<string>('');
    const chatBodyRef = useRef<HTMLDivElement>(null);
    const [responseQueue, setResponseQueue] = useState<string[]>([]);
    const [botMessage, setBotMessage] = useState<string>(''); // Temporary message for line-by-line rendering

    const handleSend = async () => {
        if (input.trim()) {
            const userMessage = input.trim();

            setMessages(prev => [...prev, { text: userMessage, type: 'user' }]);
            setInput('');
            setBotMessage('');

            try {
                const response = await fetch("http://localhost:8000/chat", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ message: userMessage })
                });

                const data = await response.json();
                const botResponse = data.reply;

                setResponseQueue(botResponse.split('. ').map((line: string) => line.trim() + '.'));
            } catch (error) {
                console.error("Error fetching from backend:", error);
                setResponseQueue(["Sorry, something went wrong while getting a response."]);
            }
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSend();
        }
    };

    // for chat history
    useEffect(() => {
        // Fetch chat history once on component mount
        const fetchChatHistory = async () => {
            try {
                const response = await fetch('http://localhost:8000/chat/history');
                const history = await response.json();
                if (history.length === 0) {
                    setMessages([{ text: "Hey, how can I assist you with medical and healthcare related queries?", type: 'bot' }]);
                } else {
                    const historyMessages = history.flatMap((msg: any) => [
                        { text: msg.user, type: 'user' },
                        { text: msg.bot, type: 'bot' }
                    ]);
                    setMessages(historyMessages);
                }
            } catch (error) {
                console.error("Failed to fetch chat history:", error);
            }
        };

        fetchChatHistory();
    }, []);

    useEffect(() => {
        const scrollToBottom = () => {
            if (chatBodyRef.current) {
                chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
            }
        };

        scrollToBottom(); // scroll when messages changes/update

        if (responseQueue.length > 0) {
            const timeout = setTimeout(() => {
                const nextLine = responseQueue[0];
                setBotMessage((prev) => (prev ? `${prev} ${nextLine}` : nextLine)); // Append the next line
                setResponseQueue((prev) => prev.slice(1)); // Remove the processed line from the queue
            }, 1000); // Adjust delay for line-by-line rendering
            return () => clearTimeout(timeout);
        } else if (botMessage && responseQueue.length === 0) {
            // Add the completed bot message to messages
            setMessages((prev) => [...prev, { text: botMessage, type: 'bot' }]);
            setBotMessage(''); // Clear temporary bot message
        }

    }, [responseQueue, botMessage])

    return (
        <div className="chatbot-container">
            <div className="chatbot-header">Healthify - Your Health guide</div>
            <div className="chatbot-body" ref={chatBodyRef}>
                {messages.map((msg, idx) => (
                    // <div key={idx} className={`message ${msg.type}`}>{msg.text}</div>
                    <div key={idx} className={`message ${msg.type}`}>
                        {msg.type === 'bot' ? (
                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                        ) : (
                            msg.text
                        )}
                    </div>
                ))}
                {/* Temporary bot message rendered line by line */}
                {botMessage && <div className="message bot">{botMessage}</div>}
            </div>
            <div className="input-field">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Message Healthify"
                />
                <button onClick={handleSend}>
                    <SendIcon />
                </button>
            </div>
        </div>
    );
};

export default Chatbot;
