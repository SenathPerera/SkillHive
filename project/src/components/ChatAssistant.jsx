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
      handleSend(transcript);
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

    const text = messageText.toLowerCase();

    // Example logic
    if (text.includes('change') && text.includes('email')) {
      addMessage('Sure, what is your new email?', 'bot');
      return;
    }

    if (/\S+@\S+\.\S+/.test(text)) {
      try {
        const updated = await apiService.updateProfile(user.id, { email: text });
        setUser({ ...user, ...updated });
        addMessage('Your email has been updated!', 'bot');
      } catch (err) {
        addMessage("Failed to update email. Please try again.", 'bot');
      }
      return;
    }

    if (text.includes('address')) {
      addMessage('Please enter your new address.', 'bot');
      return;
    }

    if (text.length > 10 && text.includes('street')) {
      try {
        const updated = await apiService.updateProfile(user.id, { address: text });
        setUser({ ...user, ...updated });
        addMessage('Your address has been updated!', 'bot');
      } catch (err) {
        addMessage("Couldn't update address. Try again later.", 'bot');
      }
      return;
    }

    addMessage("Sorry, I didn't understand. Try saying 'change email to john@example.com'.", 'bot');
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
