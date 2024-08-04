import React from 'react';
import { convertToBase64 } from './utils'; // Adjust the path based on your file structure
import { analyzeImage } from './gptVision';

const ImageUploader = () => {
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const base64Image = await convertToBase64(file);
        const result = await analyzeImage(base64Image);
        console.log(result); // Process the result here
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  return (
    <input type="file" accept="image/*" onChange={handleFileChange} />
  );
};

export default ImageUploader;
