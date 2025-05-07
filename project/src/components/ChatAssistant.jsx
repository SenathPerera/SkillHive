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

  // Setup speech recognition
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

    recognition.onend = () => {
      setListening(false);
    };

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
  
    // Handle expected fields
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
        const updated = await apiService.updateProfile(user.id, fieldInfo.payload);
        setUser({ ...user, ...updated });
        addMessage(`Your ${fieldInfo.label} has been updated to "${value}"!`, 'bot');
      } catch (err) {
        addMessage(`Failed to update ${fieldInfo.label}. Try again later.`, 'bot');
      }
  
      setExpectingField(null);
      return;
    }
  
    // Detect intent and set field
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
    <div className="fixed bottom-4 right-4 w-80 bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200 z-50">
      <div className="bg-blue-600 text-white p-3 text-sm font-semibold">
        Assistant
      </div>
      <div className="p-3 h-64 overflow-y-auto space-y-2 text-sm">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-2 rounded-md ${
              msg.from === 'bot'
                ? 'bg-gray-100 text-gray-800'
                : 'bg-blue-100 text-blue-900 text-right ml-auto'
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <div className="flex border-t">
        <input
          type="text"
          className="flex-1 px-3 py-2 text-sm border-r outline-none"
          placeholder="Type or use mic..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend} className="px-3 bg-blue-600 text-white text-sm">
          Send
        </button>
        <button
          onClick={startListening}
          disabled={listening}
          className={`px-3 ${listening ? 'bg-gray-400' : 'bg-green-600'} text-white`}
        >
          {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
