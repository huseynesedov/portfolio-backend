const multer = require('multer');
const path = require('path');
const fs = require('fs').promises; // Using fs.promises for async file operations

// Multer Storage Configuration
const storage = multer.diskStorage({
    // Set the destination for uploaded files
    destination: async (req, file, cb) => {
        const rootDir = path.dirname(require.main.filename); // Get the main directory of the project
        const uploadDir = path.join(rootDir, "/public/uploads/images/works");

        // Check if the directory exists, if not, create it
        try {
            await fs.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir); // If successful, set the destination
        } catch (err) {
            console.error('Error creating directory:', err); // Log errors if directory creation fails
            cb(new Error('Error creating directory'), false); // Pass error to callback
        }
    },

    // Set the filename for uploaded files
    filename: (req, file, cb) => {
        const extension = file.mimetype.split("/")[1]; // Extract the file extension (e.g., jpeg, png)
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9); // Generate a unique suffix
        const filename = `image_${uniqueSuffix}.${extension}`; // Create a unique filename

        // Store the file path in req.savedImages (if not already initialized)
        if (!req.savedImages) req.savedImages = [];
        req.savedImages.push(path.join("uploads/images/works", filename));

        cb(null, filename); // Pass the generated filename to the callback
    }
});

// File filter to allow only specific file types (jpeg, jpg, png, gif)
const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase()); // Check file extension
    const mimetype = filetypes.test(file.mimetype); // Check file MIME type

    // If file is valid, pass true to callback, otherwise pass an error
    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Please upload a file in jpeg, jpg, png, or gif format!'), false); // Error for invalid file types
    }
};

// Multer middleware configuration
const upload = multer({
    storage: storage, // Use the defined storage
    fileFilter: fileFilter, // Apply the file filter
    limits: { fileSize: 10 * 1024 * 1024 }  // Set maximum file size limit (10 MB)
}).fields([
    { name: 'photoMain', maxCount: 1 },  // Main photo (single file)
    { name: 'photos', maxCount: 10 }      // Additional photos (up to 10 files)
]);

module.exports = upload; // Export the multer middleware
