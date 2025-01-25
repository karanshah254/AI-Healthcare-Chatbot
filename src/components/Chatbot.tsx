import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css';
import SendIcon from '@mui/icons-material/Send';

const Chatbot: React.FC = () => {
    const defaultContext = [
        "Hello! I’m here to help you with health-related questions. Feel free to ask me anything!",
    ];

    const responses: { [key: string]: string } = {
        hi: "Hello! How can I help you today?",
        hey: "Hello! How can I help you today?",
        hello: "Hello! How can I help you today?",
        headache: "Headaches can arise from various causes, such as tension, dehydration, or lack of sleep. To ease a headache, find a quiet, dark room to rest in, and consider applying a cold or warm compress to your forehead. Stay well-hydrated by drinking water throughout the day, and avoid caffeine or alcohol. Over-the-counter pain relievers like acetaminophen or ibuprofen can be helpful, but avoid them if you experience headaches frequently without consulting a doctor.",
        fever: "A fever is often a sign that your body is fighting an infection. To reduce a fever, make sure to drink plenty of fluids to stay hydrated, as fever can lead to dehydration. Rest is crucial for recovery, and you can take acetaminophen or ibuprofen to help lower your temperature. Dress lightly and avoid excessive blankets. If the fever lasts more than 24 hours or is very high, seek medical attention.",
        cough: "A persistent cough can be caused by factors like a cold, allergies, or dry air. To alleviate a cough, try staying hydrated by drinking warm fluids such as herbal teas or warm water with honey and lemon. Using a humidifier can help keep the air moist, easing throat irritation. Cough lozenges or over-the-counter cough syrups can provide relief. If the cough persists for more than a few days, consult a healthcare provider.",
        "stomach ache": "Stomach aches can result from various causes, including indigestion or stress. Try eating light, non-spicy foods, and avoid caffeine. If it persists, consider consulting a doctor.",
        "back pain": "Back pain is common and can be due to poor posture, heavy lifting, or stress. Try gentle stretches, resting, and using a warm compress. Persistent pain should be assessed by a professional.",
        cancer: "Cancer is a serious disease that can affect any part of the body. Symptoms vary depending on the type of cancer. Early detection and treatment are crucial for better outcomes. If you have concerns about cancer, consult a healthcare provider.",
        diabetes: "Diabetes is a chronic condition that affects how your body processes blood sugar. Symptoms include increased thirst, frequent urination, and unexplained weight loss. Proper management involves diet, exercise, and medication. Consult a healthcare provider for diagnosis and treatment.",
    };

    const [messages, setMessages] = useState<{ text: string; type: 'user' | 'bot' }[]>(defaultContext.map((msg) => ({ text: msg, type: 'bot' })));
    const [input, setInput] = useState<string>('');
    const chatBodyRef = useRef<HTMLDivElement>(null);
    const [responseQueue, setResponseQueue] = useState<string[]>([]);
    const [botMessage, setBotMessage] = useState<string>(''); // Temporary message for line-by-line rendering

    const handleSend = () => {
        if (input.trim()) {
            const userMessage = input.trim();
            let botResponse = "Please ask a health-related question for me to assist you.";

            const lowerCaseInput = userMessage.toLowerCase();
            for (const keyword in responses) {
                if (lowerCaseInput.includes(keyword)) {
                    botResponse = responses[keyword];
                    break;
                }
            }

            setMessages((prev) => [...prev, { text: userMessage, type: 'user' }]);
            setInput('');
            setBotMessage('')
            setResponseQueue(botResponse.split('. ').map((line) => line.trim() + '.')); // Split the response into lines
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSend();
        }
    };

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
                    <div key={idx} className={`message ${msg.type}`}>{msg.text}</div>
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
