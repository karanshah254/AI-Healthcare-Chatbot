import React from 'react';
import './Navbar.css';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import { useTranslation } from 'react-i18next';

interface NavbarProps {
    messages: { text: string; type: 'user' | 'bot' }[];
}

const Navbar: React.FC<NavbarProps> = ({ messages }) => {

    const { t } = useTranslation();

    const exportChatAsTxt = () => {
        const content = messages.map(msg =>
            `${msg.type === 'user' ? 'You' : 'Healthify'}: ${msg.text}`
        ).join('\n\n');
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, 'chat_history.txt');
    };

    const exportChatAsPdf = () => {
        const doc = new jsPDF();
        const lineHeight = 10;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 10;
        let y = margin;

        const content = messages.map(
            (msg) => `${msg.type === 'user' ? 'You' : 'Healthify'}: ${msg.text}`
        ).join('\n\n');

        const lines = doc.splitTextToSize(content, 180);

        lines.forEach((line: string) => {
            if (y + lineHeight > pageHeight - margin) {
                doc.addPage();
                y = margin; // reset for new page
            }
            doc.text(line, margin, y);
            y += lineHeight;
        });

        doc.save('chat_history.pdf');
    };
    

    // const { i18n } = useTranslation();

    // const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    //     i18n.changeLanguage(e.target.value);
    // };

    return (
        <div className="navbar">
            {/* <select className="language-select"
                onChange={handleLanguageChange} defaultValue={i18n.language}>
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="gu">Gujarati</option>
            </select> */}
            <div className="navbar-actions">
                <button onClick={exportChatAsTxt}>
                    {t('exportTXT')}
                </button>
                <button id='pdf-button' onClick={exportChatAsPdf}>
                    {t('exportPDF')}
                </button>
            </div>
        </div>
    );
};

export default Navbar;
