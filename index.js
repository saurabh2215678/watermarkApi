const express = require('express');
const multer = require('multer');
const Jimp = require('jimp');
require('dotenv').config();;

const app = express();
const port = process.env.PORT || 3000;

// Set up Multer for handling file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Define a route to handle image uploads
app.post('/upload', upload.fields([{ name: 'mainImage', maxCount: 1 }, { name: 'markImage', maxCount: 1 }]), async (req, res) => {
    try {
      const files = req.files;
      if (!files || !files['mainImage'] || !files['markImage']) {
        const missingFields = [];
        if (!files) missingFields.push('files');
        if (!files['mainImage']) missingFields.push('mainImage');
        if (!files['markImage']) missingFields.push('markImage');
  
        return res.status(400).json({ error: `Missing or unexpected fields: ${missingFields.join(', ')}` });
      }

        // Process the mainImage and markImage
        const mainImage = files['mainImage'][0];
        const markImage = files['markImage'][0];

        // Add watermark to the mainImage using the markImage
        const watermarkedBuffer = await addWatermark(mainImage.path, markImage.path);

        // Convert the watermarked image to base64
        const watermarkedBase64 = `data:${mainImage.mimetype};base64,${watermarkedBuffer.toString('base64')}`;

        // Send the result as a JSON response
        res.json({ watermarkedImage: watermarkedBase64 });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });


// Function to add a watermark to the main image using the mark image
async function addWatermark(mainImagePath, markImagePath) {
    const mainImage = await Jimp.read(mainImagePath);
    const markImage = await Jimp.read(markImagePath);

    // Resize the mark image to match the dimensions of the main image
    markImage.resize(mainImage.bitmap.width, mainImage.bitmap.height);

    // Composite the mark image onto the main image
    mainImage.composite(markImage, 0, 0);

    // Save the result to a buffer
    return await mainImage.getBufferAsync(Jimp.MIME_PNG);
    // try {
    // } catch (error) {
    //   throw new Error(`Error adding watermark: ${error.message}`);
    // }
  }
  
  
// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
