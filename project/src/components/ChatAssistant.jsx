import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { apiService } from '../lib/api';

export default function ChatAssistant({ user, setUser }) {
  const [messages, setMessages] = useState([
    { text: 'Hi! Need help editing your profile?', from: 'bot' },
  ]);
  const [input, setInput] = useState('');
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const [expectingField, setExpectingField] = useState(null);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) return;

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setTimeout(() => handleSend(transcript), 0);
    };

    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setListening(true);
    }
  };

  const addMessage = (text, from = 'user') => {
    setMessages((prev) => [...prev, { text, from }]);
  };

  const handleSend = async (messageText = input.trim()) => {
    if (!messageText) return;
    addMessage(messageText, 'user');
    setInput('');

    const text = typeof messageText === 'string' ? messageText.toLowerCase() : '';

    if (expectingField) {
      const value = messageText.trim();
      const fieldMap = {
        email: { label: 'email', payload: { email: value } },
        address: { label: 'address', payload: { address: value } },
        firstName: { label: 'first name', payload: { firstName: value } },
        lastName: { label: 'last name', payload: { lastName: value } },
        birthday: { label: 'birthday', payload: { birthday: value } },
      };

      const fieldInfo = fieldMap[expectingField];

      if (expectingField === 'email') {
        const emailMatch = value.match(/\b\S+@\S+\.\S+\b/);
        if (!emailMatch) {
          addMessage("That doesn't look like a valid email. Try again?", 'bot');
          return;
        }
        fieldInfo.payload.email = emailMatch[0];
      }

      if (expectingField === 'birthday') {
        const isValidDate = !isNaN(Date.parse(value));
        if (!isValidDate) {
          addMessage("That doesn't look like a valid date. Use YYYY-MM-DD.", 'bot');
          return;
        }
      }

      try {
        if (!user?.id) {
          console.warn("ChatAssistant: user.id is undefined");
          addMessage("You're not signed in or your session has expired.", 'bot');
          return;
        }

        const updated = await apiService.updateProfileChatAssistant(user.id, fieldInfo.payload);
        console.log("Updated user:", updated);
        setUser((prev) => ({ ...prev, ...updated, id: prev.id }));
        addMessage(`Your ${fieldInfo.label} has been updated to "${value}"!`, 'bot');
      } catch (error) {
        console.error("Update failed:", error);
        addMessage(`Failed to update ${fieldInfo.label}. Try again later.`, 'bot');
      }

      setExpectingField(null);
      return;
    }

    if (text.includes('change') || text.includes('update')) {
      if (text.includes('email')) {
        addMessage('Sure, what is your new email?', 'bot');
        setExpectingField('email');
        return;
      }
      if (text.includes('address')) {
        addMessage('What is your new address?', 'bot');
        setExpectingField('address');
        return;
      }
      if (text.includes('first name')) {
        addMessage('What is your new first name?', 'bot');
        setExpectingField('firstName');
        return;
      }
      if (text.includes('last name')) {
        addMessage('What is your new last name?', 'bot');
        setExpectingField('lastName');
        return;
      }
      if (text.includes('birthday') || text.includes('birth date')) {
        addMessage('Please enter your birth date in YYYY-MM-DD format.', 'bot');
        setExpectingField('birthday');
        return;
      }
    }

    addMessage("I didn't get that. Try saying things like 'change my first name' or 'update my birthday'.", 'bot');
  };

  return (
    <div className="fixed bottom-6 right-6 w-96 max-w-full bg-white shadow-xl rounded-xl border border-gray-200 z-50">
      <div className="bg-blue-700 text-white px-4 py-3 text-base font-semibold rounded-t-xl">
        Assistant
      </div>
      <div className="p-4 h-72 overflow-y-auto space-y-3 text-sm scroll-smooth">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`px-3 py-2 rounded-lg max-w-xs ${
              msg.from === 'bot'
                ? 'bg-gray-100 text-gray-800'
                : 'bg-blue-100 text-blue-900 self-end ml-auto'
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <div className="flex items-center border-t border-gray-200 px-3 py-2 gap-2">
        <input
          type="text"
          className="flex-1 bg-transparent text-sm focus:outline-none px-2 py-1 placeholder-gray-400"
          placeholder="Type or use mic..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button
          onClick={handleSend}
          className="px-3 py-1.5 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition"
        >
          Send
        </button>
        <button
          onClick={startListening}
          disabled={listening}
          className={`px-2.5 py-1.5 rounded-md transition ${
            listening
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          } text-white`}
        >
          {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
