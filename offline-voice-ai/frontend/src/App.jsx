import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Camera, X } from 'lucide-react';

import { RunAnywhere } from './lib/RunAnywhere';
import { useAudioRecorder } from './hooks/useAudioRecorder';
import { useCamera } from './hooks/useCamera';
import { VoiceButton } from './components/VoiceButton';
import { ChatMessage } from './components/ChatMessage';

const API_BASE = 'http://localhost:3001/api';

function App() {
  const [messages, setMessages] = useState([]);
  const [appState, setAppState] = useState('idle'); // idle, listening, processing, speaking
  const [selectedImage, setSelectedImage] = useState(null);
  
  const { startRecording, stopRecording, error: audioErr } = useAudioRecorder();
  const { videoRef, isCameraOpen, startCamera, stopCamera, takePhoto, error: camErr } = useCamera();
  const chatEndRef = useRef(null);

  // Load history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, appState]);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE}/history`);
      setMessages(res.data);
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  const saveMessage = async (role, text, media = null) => {
    try {
      const res = await axios.post(`${API_BASE}/save-message`, { role, text, media });
      setMessages(prev => [...prev, res.data]);
    } catch (err) {
      console.error('Error saving message:', err);
      // Fallback local UI update if backend is unreachable 
      setMessages(prev => [...prev, { id: Date.now(), role, text, media, timestamp: new Date().toISOString() }]);
    }
  };

  const handleStartVoice = async () => {
    try {
      await startRecording();
      setAppState('listening');
    } catch (err) {
      console.error(err);
    }
  };

  const handleStopVoice = async () => {
    setAppState('processing');
    const audioBlob = await stopRecording();
    
    if (audioBlob) {
      await processInteraction(audioBlob);
    } else {
      setAppState('idle');
    }
  };

  const processInteraction = async (audioBlob) => {
    try {
      // 1. STT (Speech to Text)
      const transcript = await RunAnywhere.STT.transcribe(audioBlob);
      
      // If we took a photo or uploaded one, save it with the user's message
      const currentImage = selectedImage;
      await saveMessage('user', transcript, currentImage);
      
      // We clear the image preview so UI resets for the next interaction
      setSelectedImage(null);
      if (isCameraOpen) stopCamera();

      // 2. Vision (Optional, if image present)
      let visionContext = "";
      if (currentImage) {
        // Assume currentImage is a base64 string for this mock
        visionContext = await RunAnywhere.Vision.analyzeImage(currentImage);
      }

      // 3. LLM (Generate Response)
      const prompt = transcript + (visionContext ? `\n[Image Context: ${visionContext}]` : "");
      const responseText = await RunAnywhere.LLM.generateResponse(prompt, !!currentImage);

      await saveMessage('assistant', responseText);

      // 4. TTS (Text to Speech)
      setAppState('speaking');
      await RunAnywhere.TTS.speak(responseText);
      
    } catch (error) {
      console.error("Pipeline error:", error);
    } finally {
      setAppState('idle');
    }
  };

  const handleCapturePhoto = async () => {
    const blob = await takePhoto();
    if (blob) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(blob);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 max-w-4xl mx-auto border-x border-white/5 relative shadow-2xl overflow-hidden">
      
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 glassmorphism z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex justify-center items-center shadow-lg shadow-emerald-500/20">
            <span className="font-bold text-white tracking-widest">AI</span>
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">RunAnywhere Assistant</h1>
            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full w-fit">
              <WifiOff className="w-3 h-3" />
              Running Locally – No Internet Required
            </div>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto p-6 scroll-smooth pb-40">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4 opacity-50 space-y-4">
            <WifiOff className="w-16 h-16" />
            <p className="max-w-xs text-center">Your private offline assistant is ready.<br/>Tap the mic to start speaking.</p>
          </div>
        ) : (
          messages.map((msg, index) => (
             <ChatMessage key={msg.id || index} message={msg} />
          ))
        )}
        
        {/* Loading Indicator */}
        <AnimatePresence>
          {appState === 'processing' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex justify-start mb-6"
            >
              <div className="glassmorphism text-slate-400 rounded-2xl rounded-tl-sm p-4 flex gap-2 items-center">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div ref={chatEndRef} />
      </main>

      {/* Controls Container (Fixed at Bottom) */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent pt-12">
        <div className="flex flex-col items-center gap-6">

          {/* Camera / Image Section */}
          <div className="flex flex-col items-center w-full max-w-md">
            
            <AnimatePresence>
              {isCameraOpen && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, mb: 0 }}
                  animate={{ opacity: 1, height: 'auto', mb: 16 }}
                  exit={{ opacity: 0, height: 0, mb: 0 }}
                  className="w-full relative rounded-2xl overflow-hidden glassmorphism shadow-2xl"
                >
                  <video ref={videoRef} autoPlay playsInline className="w-full h-48 object-cover bg-black" />
                  <button 
                    onClick={handleCapturePhoto}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 w-14 h-14 bg-white rounded-full border-4 border-slate-300 shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                  />
                  <button onClick={stopCamera} className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white backdrop-blur">
                    <X className="w-5 h-5" />
                  </button>
                </motion.div>
              )}

              {selectedImage && !isCameraOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="relative group mb-4"
                >
                  <img src={selectedImage} alt="Preview" className="w-24 h-24 object-cover rounded-2xl border-2 border-emerald-500/50 shadow-lg shadow-emerald-500/20" />
                  <button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 p-1.5 bg-rose-500 hover:bg-rose-600 rounded-full text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between w-full relative">
              <div className="w-12 h-12 flex justify-center items-center">
                {!isCameraOpen && appState === 'idle' && (
                  <button onClick={startCamera} className="p-3 rounded-full glass-button text-slate-300 hover:text-white" title="Use Camera">
                    <Camera className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="absolute left-1/2 -translate-x-1/2 -translate-y-8">
                <VoiceButton 
                  state={appState} 
                  onStart={handleStartVoice} 
                  onStop={handleStopVoice} 
                />
                
                {appState === 'listening' && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-4 text-rose-400 font-medium tracking-wide text-sm whitespace-nowrap drop-shadow"
                  >
                    Tap to stop recording
                  </motion.div>
                )}
              </div>

              <div className="w-12 h-12" /> {/* Spacer */}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;
