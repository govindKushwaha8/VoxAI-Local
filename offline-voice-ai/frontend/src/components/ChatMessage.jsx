import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Image as ImageIcon, CheckCircle2 } from 'lucide-react';

export function ChatMessage({ message }) {
  const isUser = message.role === 'user';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex max-w-[80%] flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div 
          className={`flex items-start gap-4 p-4 rounded-2xl ${
            isUser 
              ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-50 rounded-tr-sm' 
              : 'glassmorphism text-slate-200 rounded-tl-sm'
          }`}
        >
          <div className="flex-1">
            <p className="leading-relaxed text-[15px] whitespace-pre-wrap">{message.text}</p>
            {message.media && (
              <div className="mt-3 relative rounded-lg overflow-hidden border border-white/10">
                <img src={message.media} alt="Uploaded media" className="max-w-[240px] max-h-[240px] object-cover" />
              </div>
            )}
          </div>
        </div>
        <span className="text-xs text-slate-500 mt-2 px-1 font-medium">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
          {isUser && <CheckCircle2 className="inline w-3 h-3 ml-1 text-emerald-500" />}
        </span>
      </div>
    </motion.div>
  );
}
