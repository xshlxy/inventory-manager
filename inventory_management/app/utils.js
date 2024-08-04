// Converts a file to a Base64 string
export const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]); // Extract Base64 part
      reader.onerror = (error) => reject(error);
    });
  };
  