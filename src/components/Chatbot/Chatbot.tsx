import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css';
import SendIcon from '@mui/icons-material/Send';
import ReactMarkdown from 'react-markdown';
import Navbar from '../NavBar/NavBar';
import { useTranslation } from 'react-i18next';

const Chatbot: React.FC = () => {
    const { t, i18n } = useTranslation();

    const defaultContext = [
        // "Hello! I’m here to help you with health-related questions. Feel free to ask me anything!",
        t('defaultBotMsg')
    ];

    const [messages, setMessages] = useState<{ text: string; type: 'user' | 'bot' }[]>(defaultContext.map((msg) => ({ text: msg, type: 'bot' })));
    const [input, setInput] = useState<string>('');
    const chatBodyRef = useRef<HTMLDivElement>(null);
    const [responseQueue, setResponseQueue] = useState<string[]>([]);
    const [botMessage, setBotMessage] = useState<string>('');

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
                // setResponseQueue(["Sorry, something went wrong while getting a response."]);
                setResponseQueue([t("error")]);
            }
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSend();
        }
    };

    useEffect(() => {
        const fetchChatHistory = async () => {
            try {
                const response = await fetch('http://localhost:8000/chat/history');
                const history = await response.json();
                if (history.length === 0) {
                    // setMessages([{ text: "Hey, how can I assist you with medical and healthcare related queries?", type: 'bot' }]);
                    setMessages([{ text: t('defaultBotMsg'), type: 'bot' }]);
                } else {
                    type ChatHistoryItem = { user: string; bot: string };
                    const historyMessages = history.flatMap((msg: ChatHistoryItem) => [
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
    }, [i18n.language, t]);

    useEffect(() => {
        const scrollToBottom = () => {
            if (chatBodyRef.current) {
                chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
            }
        };

        scrollToBottom();

        if (responseQueue.length > 0) {
            const timeout = setTimeout(() => {
                const nextLine = responseQueue[0];
                setBotMessage((prev) => (prev ? `${prev} ${nextLine}` : nextLine));
                setResponseQueue((prev) => prev.slice(1));
            }, 1000);
            return () => clearTimeout(timeout);
        } else if (botMessage && responseQueue.length === 0) {
            setMessages((prev) => [...prev, { text: botMessage, type: 'bot' }]);
            setBotMessage('');
        }

    }, [responseQueue, botMessage])

    return (
        <>
            <Navbar messages={messages} />
            <div className="chatbot-container">
                <div className="chatbot-header">{t('title')}</div>
                <div className="chatbot-body" ref={chatBodyRef}>
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`message ${msg.type}`}>
                            {msg.type === 'bot' ? (
                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                            ) : (
                                msg.text
                            )}
                        </div>
                    ))}
                    {botMessage && <div className="message bot">{botMessage}</div>}
                </div>
                <div className="input-field">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={t('placeholder')}
                    />
                    <button onClick={handleSend}>
                        <SendIcon />
                    </button>
                </div>
            </div>
        </>
    );
};

export default Chatbot;
