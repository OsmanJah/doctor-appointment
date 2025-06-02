import { BASE_URL } from "../config";

const isDev = () => process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

const uploadImageToCloudinary = async file => {
  const uploadData = new FormData();
  uploadData.append("photo", file);

  try {
    if (isDev()) {
      console.log("Starting upload to", `${BASE_URL}/upload/photo`);
    }

    const res = await fetch(`${BASE_URL}/upload/photo`, {
      method: "post",
      body: uploadData,
    });

    const responseText = await res.text();

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      if (isDev()) {
        console.error("Failed to parse response as JSON:", responseText.substring(0, 150) + '...');
      }
      throw new Error("Server did not return valid JSON");
    }

    if (!res.ok || !data.success) {
      if (isDev()) {
        console.error("Image Upload Error:", data.message || 'Unknown error');
      }
      throw new Error(data.message || "Image upload failed. Please try again.");
    }
    
    if (!data.imageUrl) {
      if (isDev()) {
        console.error("Missing imageUrl in response");
      }
      throw new Error("Server response missing image URL");
    }

    if (isDev()) {
      console.log("Upload succeeded:", data.imageUrl);
    }
    
    return { 
      url: data.imageUrl 
    };
  } catch (error) {
    if (isDev()) {
      console.error("Upload Image Error:", error.message || error);
    }
    throw error;
  }
};

export default uploadImageToCloudinary;
