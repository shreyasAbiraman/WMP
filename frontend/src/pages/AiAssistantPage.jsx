import React, { useState } from 'react';
import { api } from '../services/api';
import { Badge } from '../components/common/Badge';
import {
  BotMessageSquare,
  Send,
  User,
  Sparkles,
  ShieldAlert,
  PhoneCall,
  HelpCircle,
} from 'lucide-react';
import { toast } from 'sonner';

const SAMPLE_PROMPTS = [
  'What should I do if someone is following me?',
  'What are the emergency helpline numbers in India?',
  'How do I activate SOS?',
  'What happens if I miss my safe-journey check-in?',
  'Cab safety tips for late-night travel',
];

export const AiAssistantPage = () => {
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: `Hello! I am your Women Safety Shield Assistant. 

I provide actionable personal safety guidance, helpline references, and instructions on how to use our emergency features.

*Reminder*: If you are in immediate physical danger right now, tap the red SOS button or dial **112** immediately.`,
      source: 'safety_knowledge_engine',
      suggestedActions: [
        'What should I do if someone is following me?',
        'Emergency helpline numbers',
        'How do I activate SOS?',
      ],
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMessage = { sender: 'user', text: query };
    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputText('');

    setSending(true);
    try {
      const res = await api.post('/assistant/chat', { prompt: query });
      if (res?.success && res.data) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'assistant',
            text: res.data.answer,
            source: res.data.source,
            suggestedActions: res.data.suggestedActions || [],
          },
        ]);
      }
    } catch (err) {
      toast.error('Failed to get safety guidance');
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Unable to reach the assistant at this moment. If you are in danger, please call 112 immediately.',
          source: 'system',
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <BotMessageSquare className="w-7 h-7 text-purple-600 dark:text-purple-400" />
            <span>AI Safety Assistant</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Practical safety guidance, emergency protocols, and preventative tactics.
          </p>
        </div>

        <a
          href="tel:112"
          className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300 font-bold text-xs rounded-xl"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Call 112</span>
        </a>
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-md overflow-y-auto space-y-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
                <BotMessageSquare className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-purple-700 text-white rounded-br-none shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800/70 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200 dark:border-slate-700/60'
              }`}
            >
              <div className="whitespace-pre-line">{m.text}</div>

              {m.source && (
                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="capitalize">Source: {m.source.replace('_', ' ')}</span>
                  <span>Verified Safety Engine</span>
                </div>
              )}

              {m.suggestedActions && m.suggestedActions.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {m.suggestedActions.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(action)}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[11px] font-semibold hover:bg-purple-50 transition"
                    >
                      {action} →
                    </button>
                  ))}
                </div>
              )}
            </div>

            {m.sender === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-purple-700 text-white flex items-center justify-center flex-shrink-0 mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Suggested Quick Prompt Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 text-[11px] flex items-center gap-1 flex-shrink-0">
          <HelpCircle className="w-3.5 h-3.5" /> Suggestions:
        </span>
        {SAMPLE_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-slate-600 dark:text-slate-300 text-xs flex-shrink-0 transition border border-slate-200 dark:border-slate-700"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask a safety question (e.g. 'What if someone is following me?')"
          className="flex-1 px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
        />
        <button
          type="submit"
          disabled={sending || !inputText.trim()}
          className="px-5 py-3 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-sm shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
};
