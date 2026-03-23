import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Loader2, Volume2 } from 'lucide-react';

export function VoiceButton({ state, onStart, onStop }) {
  // states: 'idle', 'listening', 'processing', 'speaking'
  
  const isRecording = state === 'listening';
  
  return (
    <div className="relative flex justify-center items-center w-32 h-32 mx-auto">
      {/* Pulse rings for listening state */}
      <AnimatePresence>
        {isRecording && (
          <>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
              className="absolute inset-0 rounded-full bg-emerald-500/30"
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut", delay: 0.4 }}
              className="absolute inset-0 rounded-full bg-emerald-400/40"
            />
          </>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={isRecording ? onStop : onStart}
        className={`relative z-10 flex items-center justify-center w-20 h-20 rounded-full shadow-2xl transition-all duration-300 ${
          state === 'idle' ? 'bg-gradient-to-br from-emerald-400 to-teal-600 shadow-emerald-500/20' :
          state === 'listening' ? 'bg-gradient-to-br from-rose-400 to-red-600 shadow-rose-500/30 ring-4 ring-rose-500/30' :
          state === 'processing' ? 'bg-gradient-to-br from-amber-400 to-orange-500' :
          'bg-gradient-to-br from-cyan-400 to-blue-600'
        }`}
      >
        {state === 'idle' && <Mic className="w-8 h-8 text-white drop-shadow-md" />}
        {state === 'listening' && <Square className="w-8 h-8 text-white drop-shadow-md fill-white" />}
        {state === 'processing' && <Loader2 className="w-8 h-8 text-white animate-spin" />}
        {state === 'speaking' && (
           <div className="flex gap-1 h-8 items-center">
             {[1,2,3,4].map(i => (
               <div key={i} className="w-1.5 bg-white rounded-full wave-bar" style={{ animationDelay: `${i * 0.1}s` }} />
             ))}
           </div>
        )}
      </motion.button>
    </div>
  );
}
