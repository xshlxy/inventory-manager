// gptVision.js
export const analyzeImage = async (base64Image) => {
    const apiEndpoint = 'https://vision.googleapis.com/v1/images:annotate'; // Google Cloud Vision API endpoint
    const apiKey = process.env.GOOGLE_CLOUD_API_KEY; // Make sure to set this environment variable
  
    const requestPayload = {
      requests: [
        {
          image: {
            content: base64Image,
          },
          features: [
            {
              type: 'LABEL_DETECTION', // Change this to your desired feature type
              maxResults: 10,
            },
          ],
        },
      ],
    };
  
    try {
      const response = await fetch(`${apiEndpoint}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error analyzing image:', error);
      throw error;
    }
  };