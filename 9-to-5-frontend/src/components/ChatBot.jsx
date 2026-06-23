import { useEffect, useRef, useState } from 'react';
import { chatApi } from '../api/client';

const SESSION_KEY = 'chatSessionId';

function BotIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="6" width="16" height="12" rx="3" fill="currentColor" opacity="0.15" />
      <rect x="5" y="7" width="14" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="9" cy="12" r="1.2" fill="currentColor" />
      <circle cx="15" cy="12" r="1.2" fill="currentColor" />
      <path d="M12 3v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="2.5" r="1" fill="currentColor" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 12l16-7-7 16-2-5-7-4z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PaperclipIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66L9.41 17.41a2 2 0 01-2.83-2.83l8.49-8.48"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [sessionId, setSessionId] = useState(() => localStorage.getItem(SESSION_KEY));
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (open && sessionId) {
      chatApi
        .history(sessionId)
        .then((data) => setMessages(data.messages || []))
        .catch(() => {});
    }
  }, [open, sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, uploading]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  const sendMessage = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setLoading(true);

    try {
      const data = await chatApi.send(text, sessionId);
      if (data.sessionId) {
        localStorage.setItem(SESSION_KEY, data.sessionId);
        setSessionId(data.sessionId);
      }
      setMessages(data.messages || []);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: err.message || 'Something went wrong. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    setUploading(true);
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: '\uD83D\uDCCE Uploading: ' + file.name + '\u2026' },
    ]);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (sessionId) formData.append('sessionId', sessionId);

      const data = await chatApi.upload(formData);

      if (data.sessionId) {
        localStorage.setItem(SESSION_KEY, data.sessionId);
        setSessionId(data.sessionId);
      }

      setUploadedFile(file.name);
      setMessages(data.messages || []);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '\u274C Could not upload file: ' + (err.message || 'Please try again.'),
        },
      ]);
    } finally {
      setUploading(false);
    }
  };

  const clearChat = async () => {
    if (!sessionId) {
      setMessages([]);
      setUploadedFile(null);
      return;
    }

    try {
      const data = await chatApi.clear(sessionId);
      setMessages(data.messages || []);
      setUploadedFile(null);
    } catch {
      setMessages([]);
      setUploadedFile(null);
    }
  };

  const isBusy = loading || uploading;

  return (
    <div className="chatbot-root">
      {open && (
        <div className="chatbot-panel" role="dialog" aria-label="9-to-5 career assistant">
          <header className="chatbot-header">
            <div className="chatbot-header-info">
              <span className="chatbot-avatar" aria-hidden="true">
                <BotIcon />
              </span>
              <div>
                <strong>9-to-5 Assistant</strong>
                <span className="chatbot-subtitle">Powered by Ollama + MCP</span>
              </div>
            </div>
            <div className="chatbot-header-actions">
              <button type="button" className="chatbot-icon-btn" onClick={clearChat} title="Clear chat">
                &#8635;
              </button>
              <button
                type="button"
                className="chatbot-icon-btn"
                onClick={() => setOpen(false)}
                title="Close chat"
              >
                &#x2715;
              </button>
            </div>
          </header>

          {uploadedFile && (
            <div className="chatbot-file-banner">
              <span className="chatbot-file-icon">&#128196;</span>
              <span className="chatbot-file-name">{uploadedFile}</span>
              <button
                type="button"
                className="chatbot-file-clear"
                onClick={() => setUploadedFile(null)}
                title="Remove file context"
              >
                &#x2715;
              </button>
            </div>
          )}

          <div className="chatbot-messages">
            {messages.length === 0 && (
              <div className="chatbot-welcome">
                <p>Ask about jobs, companies, or career tips. I use live data from MongoDB.</p>
                <p className="chatbot-welcome-hint">&#128206; You can also upload your resume for personalized advice!</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={'chatbot-bubble chatbot-bubble-' + msg.role}>
                {msg.content}
              </div>
            ))}
            {isBusy && (
              <div className="chatbot-bubble chatbot-bubble-assistant chatbot-typing">
                <span />
                <span />
                <span />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chatbot-input-row" onSubmit={sendMessage}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt,.md,.json,.csv"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
              aria-label="Upload file"
            />
            <button
              type="button"
              className={'chatbot-attach-btn' + (uploading ? ' chatbot-attach-btn--busy' : '')}
              onClick={() => fileInputRef.current?.click()}
              disabled={isBusy}
              title="Upload a file (PDF, TXT, DOC...)"
              aria-label="Attach file"
            >
              <PaperclipIcon />
            </button>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={uploading ? 'Uploading file\u2026' : 'Ask about jobs, companies...'}
              disabled={isBusy}
              aria-label="Chat message"
            />
            <button type="submit" disabled={isBusy || !input.trim()} aria-label="Send message">
              <SendIcon />
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        className={'chatbot-fab' + (open ? ' chatbot-fab-open' : '')}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close chat assistant' : 'Open chat assistant'}
        aria-expanded={open}
      >
        {open ? '\u2715' : <BotIcon />}
      </button>
    </div>
  );
}
