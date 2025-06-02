export const uploadPhoto = async (req, res) => {
  try {
    // Log the incoming request details
    console.log('Upload request received:', {
      fileExists: !!req.file,
      contentType: req.get('content-type'),
      bodyKeys: Object.keys(req.body || {})
    });

    if (!req.file) {
      console.error('No file in upload request');
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }
    
    // Log the file details received from Cloudinary
    console.log('File received from Cloudinary:', {
      path: req.file.path,
      secure_url: req.file.secure_url,
      filename: req.file.filename,
      public_id: req.file.public_id,
      url: req.file.url
    });

    // Get image URL from Cloudinary response
    const imageUrl = req.file.path || req.file.secure_url || req.file.url;
    
    if (!imageUrl) {
      console.error('No image URL returned from Cloudinary');
      return res.status(500).json({ 
        success: false, 
        message: 'Image uploaded but no URL returned' 
      });
    }
    
    console.log('Upload succeeded, returning URL:', imageUrl);
    
    // Return success response with image URL
    return res.status(200).json({ 
      success: true, 
      imageUrl 
    });
  } catch (err) {
    console.error('Upload error details:', {
      message: err.message || 'Unknown error',
      stack: err.stack,
      name: err.name
    });
    
    // Always return valid JSON response
    return res.status(500).json({ 
      success: false, 
      message: 'Image upload failed: ' + (err.message || 'Unknown error')
    });
  }
};
