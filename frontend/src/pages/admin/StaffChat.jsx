import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { selectAuth } from '../../redux/slices/authSlice';
import { motion, AnimatePresence } from 'framer-motion';
import socket from '../../services/socket';
import { Send, ChefHat, Truck, ShieldCheck, MessageSquare } from 'lucide-react';

const ROLE_CONFIG = {
  ADMIN:    { label: 'Admin',    icon: ShieldCheck, color: 'text-purple-400', bg: 'bg-purple-400/10', bubble: 'bg-purple-400/10 border-purple-400/20' },
  KITCHEN:  { label: 'Kitchen',  icon: ChefHat,     color: 'text-orange-400', bg: 'bg-orange-400/10', bubble: 'bg-orange-400/10 border-orange-400/20' },
  DELIVERY: { label: 'Delivery', icon: Truck,        color: 'text-blue-400',   bg: 'bg-blue-400/10',   bubble: 'bg-blue-400/10  border-blue-400/20'   },
};

const timeStr = (iso) => new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

const MessageBubble = ({ msg, isMine }) => {
  const cfg = ROLE_CONFIG[msg.senderRole] || ROLE_CONFIG.ADMIN;
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0 mb-1`}>
        <Icon size={14} className={cfg.color} />
      </div>

      <div className={`max-w-[70%] space-y-1 ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
        {/* Name + role */}
        <span className={`text-[10px] font-black uppercase tracking-widest ${cfg.color} ${isMine ? 'text-right' : 'text-left'}`}>
          {isMine ? 'You' : `${msg.senderName} · ${cfg.label}`}
        </span>

        {/* Bubble */}
        <div className={`px-4 py-2.5 rounded-2xl border text-sm leading-relaxed ${
          isMine
            ? 'bg-primary/15 border-primary/30 text-white rounded-br-sm'
            : `${cfg.bubble} text-white rounded-bl-sm`
        }`}>
          {msg.text}
        </div>

        <span className="text-[10px] text-text-muted">{timeStr(msg.createdAt)}</span>
      </div>
    </motion.div>
  );
};

const StaffChat = () => {
  const { user, token } = useSelector(selectAuth);
  const [messages, setMessages]     = useState([]);
  const [input, setInput]           = useState('');
  const [joined, setJoined]         = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [systemMsgs, setSystemMsgs] = useState([]);
  const bottomRef = useRef(null);
  const typingTimer = useRef(null);

  // Join chat room on mount
  useEffect(() => {
    if (!token) return;

    socket.emit('chat:join', { token });

    socket.on('chat:history', (history) => {
      setMessages(history);
      setJoined(true);
    });

    socket.on('chat:message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on('chat:typing', ({ name, role, isTyping }) => {
      setTypingUsers(prev => {
        if (isTyping) {
          return prev.includes(name) ? prev : [...prev, name];
        }
        return prev.filter(n => n !== name);
      });
    });

    socket.on('chat:user_joined', ({ name, role }) => {
      if (name !== user?.name) {
        setSystemMsgs(prev => [...prev, `${name} joined`]);
        setTimeout(() => setSystemMsgs(prev => prev.slice(1)), 3000);
      }
    });

    socket.on('chat:user_left', ({ name }) => {
      setSystemMsgs(prev => [...prev, `${name} left`]);
      setTimeout(() => setSystemMsgs(prev => prev.slice(1)), 3000);
    });

    socket.on('chat:error', ({ message }) => {
      console.error('[Chat]', message);
    });

    return () => {
      socket.off('chat:history');
      socket.off('chat:message');
      socket.off('chat:typing');
      socket.off('chat:user_joined');
      socket.off('chat:user_left');
      socket.off('chat:error');
    };
  }, [token]);

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    socket.emit('chat:message', { text });
    socket.emit('chat:typing', { isTyping: false });
    setInput('');
  }, [input]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    socket.emit('chat:typing', { isTyping: true });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit('chat:typing', { isTyping: false });
    }, 1500);
  };

  const myCfg = ROLE_CONFIG[user?.role] || ROLE_CONFIG.ADMIN;

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-h-[700px]">

      {/* Header */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/5">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          <MessageSquare size={20} />
        </div>
        <div>
          <h2 className="font-bold text-white">Staff Chat</h2>
          <p className="text-[10px] text-text-muted uppercase tracking-widest">
            Admin · Kitchen · Delivery
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] text-green-400 font-black uppercase tracking-widest">Live</span>
        </div>
      </div>

      {/* System toasts */}
      <AnimatePresence>
        {systemMsgs.map((msg, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="text-center text-[10px] text-text-muted bg-white/5 rounded-full px-4 py-1 mb-2 mx-auto">
            {msg}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 no-scrollbar">
        {!joined ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3 text-text-muted">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-xs">Connecting to chat...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-text-muted">
            <MessageSquare size={36} className="opacity-30" />
            <p className="text-sm">No messages yet. Say hello!</p>
          </div>
        ) : (
          messages.map(msg => (
            <MessageBubble
              key={msg._id}
              msg={msg}
              isMine={msg.senderId?.toString() === user?._id?.toString()}
            />
          ))
        )}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 text-[11px] text-text-muted italic">
            <div className="flex gap-1">
              {[0,1,2].map(i => (
                <span key={i} className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
            {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="mt-4 pt-4 border-t border-white/5">
        <div className={`flex items-end gap-3 glass rounded-2xl border ${myCfg.bubble} p-3`}>
          <textarea
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Enter to send)"
            rows={1}
            className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-text-muted resize-none max-h-24 no-scrollbar"
            style={{ fieldSizing: 'content' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-black flex-shrink-0 disabled:opacity-30 hover:bg-yellow-400 transition-all disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-[10px] text-text-muted mt-1.5 text-center">
          Shift+Enter for new line · Enter to send
        </p>
      </div>
    </div>
  );
};

export default StaffChat;
