import React, { useState } from 'react';
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

    const [messages, setMessages] = useState<string[]>(defaultContext);
    const [input, setInput] = useState<string>('');

    const handleSend = () => {
        if (input.trim()) {
            const userMessage = input.trim();
            let botResponse = "I'm sorry, I don't have information on that right now.";

            const lowerCaseInput = userMessage.toLowerCase();
            for (const keyword in responses) {
                if (lowerCaseInput.includes(keyword)) {
                    botResponse = responses[keyword];
                    break;
                }
            }

            setMessages([...messages, `You: ${userMessage}`, `Healthify: ${botResponse}`]);
            setInput('');
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSend();
        }
    };

    return (
        <div className="chatbot-container">
            <div className="chatbot-header">Healthify - Your Health guide</div>
            <div className="chatbot-body">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`message ${idx % 2 === 0 ? 'bot' : 'user'}`}>{msg}</div>
                ))}
            </div>
            <div className="input-field">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask me a health question..."
                />
                <button onClick={handleSend}>
                    <SendIcon />
                </button>
            </div>
        </div>
    );
};

export default Chatbot;
