import React, { useRef, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { Camera } from 'react-camera-pro';
import { analyzeImage } from './gptVision'; // Import the analyzeImage function

const CameraCapture = ({ open, onClose, onCapture }) => {
  const cameraRef = useRef(null); // Use useRef for the camera reference
  const [capturedImage, setCapturedImage] = useState(null);

  const handleCapture = async () => {
    if (cameraRef.current) {
      try {
        // Capture the image
        const imageSrc = cameraRef.current.takePhoto();
        setCapturedImage(imageSrc);
        
        // Convert image to base64
        const base64Image = await fetch(imageSrc)
          .then(res => res.blob())
          .then(blob => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          }));
        
        // Analyze the image
        const result = await analyzeImage(base64Image);
        onCapture(result); // Pass the result to the parent component
      } catch (error) {
        console.error('Error capturing or analyzing image:', error);
      }
      
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Capture Image</DialogTitle>
      <DialogContent>
        {/* Use ref directly with useRef */}
        <Camera ref={cameraRef} />
        {capturedImage && <img src={capturedImage} alt="Captured preview" style={{ width: '100%' }} />}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleCapture} color="primary">Capture</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CameraCapture;