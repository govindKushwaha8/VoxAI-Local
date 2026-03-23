/**
 * RunAnywhere Mock SDK
 * Simulates local offline AI models for Speech-to-Text, LLM, Text-to-Speech, and Vision.
 */

export const RunAnywhere = {
  // 1. Speech-to-Text
  // In a real scenario, this would transcode audio to text using a local Whisper model.
  STT: {
    transcribe: async (audioBlob) => {
      console.log('[RunAnywhere STT] Processing audio blob...', audioBlob.size, 'bytes');
      return new Promise((resolve) => {
        setTimeout(() => {
          // Mock generic transcriptions
          const transcripts = [
             "What is this plant?",
             "Can you help me identify this?",
             "Tell me more about what I am looking at.",
             "Hello, what can you do?",
             "Is this offline working correctly?"
          ];
          const text = transcripts[Math.floor(Math.random() * transcripts.length)];
          resolve(text);
        }, 1200); // simulate some latency
      });
    }
  },

  // 2. Large Language Model
  LLM: {
    generateResponse: async (prompt, image = null) => {
      console.log('[RunAnywhere LLM] Generating response for prompt:', prompt, 'with image?', !!image);
      return new Promise((resolve) => {
        setTimeout(() => {
           let response = "";
           const lowerPrompt = prompt.toLowerCase();
           
           if (image) {
             if (lowerPrompt.includes('plant')) {
               response = "Based on the image, this appears to be a Monstera Deliciosa, often called a Swiss Cheese Plant. It's safe to keep indoors.";
             } else {
               response = "I see the image you uploaded. It looks quite interesting! How can I help you with it?";
             }
           } else {
             if (lowerPrompt.includes('hello') || lowerPrompt.includes('hi')) {
               response = "Hello there! I am your offline voice AI assistant. How can I help you today?";
             } else if (lowerPrompt.includes('offline')) {
               response = "Yes, I am running completely locally without any cloud dependency! Fast and private.";
             } else {
               response = "I'm a fast, helpful offline AI assistant. I heard you, but my local knowledge on that specific topic is currently limited in this mock version.";
             }
           }
           resolve(response);
        }, 1500); // simulate LLM thinking time
      });
    }
  },

  // 3. Text-to-Speech
  TTS: {
    speak: async (text) => {
      console.log('[RunAnywhere TTS] Synthesizing speech for:', text);
      return new Promise((resolve, reject) => {
         if (!('speechSynthesis' in window)) {
             console.warn('SpeechSynthesis not supported in this browser.');
             resolve(false);
             return;
         }
         
         const utterance = new SpeechSynthesisUtterance(text);
         utterance.rate = 1.0;
         utterance.pitch = 1.0;
         
         utterance.onend = () => {
             resolve(true);
         };
         utterance.onerror = (e) => {
             console.error('[RunAnywhere TTS] Error:', e);
             resolve(false);
         };
         
         window.speechSynthesis.speak(utterance);
      });
    }
  },

  // 4. Vision
  Vision: {
    analyzeImage: async (imageBlob) => {
       console.log('[RunAnywhere Vision] Analyzing image...');
       return new Promise((resolve) => {
         setTimeout(() => {
            resolve("Image analyzed successfully. Detected objects: [mock_plant, mock_background]");
         }, 1000);
       });
    }
  }
};
