import { useState, useRef, useCallback } from 'react';

export function useCamera() {
  const videoRef = useRef(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [error, setError] = useState(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraOpen(true);
      }
      setError(null);
    } catch (err) {
      setError(err.message || 'Error accessing camera');
      console.error(err);
    }
  }, []);

  const stopCamera = useCallback(() => {
     if (videoRef.current && videoRef.current.srcObject) {
         videoRef.current.srcObject.getTracks().forEach(t => t.stop());
         videoRef.current.srcObject = null;
     }
     setIsCameraOpen(false);
  }, []);

  const takePhoto = useCallback(() => {
     if (!videoRef.current) return null;
     
     const canvas = document.createElement('canvas');
     canvas.width = videoRef.current.videoWidth;
     canvas.height = videoRef.current.videoHeight;
     const ctx = canvas.getContext('2d');
     ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
     
     // Stop camera after taking photo
     stopCamera();
     
     // Ensure we output a blob
     return new Promise(resolve => {
        canvas.toBlob(blob => {
            resolve(blob);
        }, 'image/jpeg', 0.85);
     });
  }, [stopCamera]);

  return { videoRef, isCameraOpen, startCamera, stopCamera, takePhoto, error };
}
