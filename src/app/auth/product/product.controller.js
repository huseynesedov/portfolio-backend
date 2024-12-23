const Product = require("../../products/model");
const Response = require("../../../utils/response");
const APIError = require("../../../utils/errors");
const path = require('path');
const fs = require('fs').promises; // fs.promises kullanarak asenkron dosya işlemleri
const multer = require('multer');

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



/**
 * @swagger
 * /api/works:
 *   get:
 *     tags: [Works]
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 */

const works = async (req, res, next) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (err) {
        next(err);
    }
};

/**
 * @swagger
 * /api/works/create:
 *   post:
 *     security:
 *       - BearerAuth: []
 *     tags: [Works]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               descriptionMain:
 *                 type: string
 *               descriptionItems:
 *                 type: array
 *                 items:
 *                   type: string
 *               webUrl:
 *                 type: string
 *               githubUrl:
 *                 type: string
 *               photoMain:
 *                 type: string
 *                 format: binary
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
const create = async (req, res, next) => {
    try {
        upload(req, res, async (err) => {
            if (err) {
                console.error("Fotoğraf yüklenirken hata oluştu:", err);
                // Dosya silme işlemi
                if (req.files?.photoMain) {
                    await Promise.all(req.files.photoMain.map(file => {
                        const path = `public/uploads/images/works/${file.filename}`;
                        return fs.unlink(path);
                    }));
                }
                if (req.files?.photos) {
                    await Promise.all(req.files.photos.map(file => {
                        const path = `public/uploads/images/works/${file.filename}`;
                        return fs.unlink(path);
                    }));
                }
                return next(err);
            }

            const { name, descriptionMain, descriptionItems, webUrl, githubUrl } = req.body;

            // URL'leri oluşturma
            const photoMainUrl = req.files.photoMain
                ? `http://${req.get('host')}/uploads/images/works/${req.files.photoMain[0].filename}`
                : null;

            const photosUrls = req.files.photos
                ? req.files.photos.map(file => `http://${req.get('host')}/uploads/images/works/${file.filename}`)
                : [];

            const finalWebUrl = webUrl.trim() === "" ? null : webUrl;
            const finalGithubUrl = githubUrl.trim() === "" ? null : githubUrl;

            const existingProduct = await Product.findOne({ name });
            if (existingProduct) {
                throw new APIError("Bu isim zaten var!", 409);
            }

            const newProduct = new Product({
                name,
                description: {
                    descriptionMain,
                    items: descriptionItems.split(",") // Virgülle ayırarak liste oluşturuyoruz
                },
                photos: {
                    photoMain: photoMainUrl,
                    items: photosUrls
                },
                webUrl: finalWebUrl,
                githubUrl: finalGithubUrl
            });

            const savedProduct = await newProduct.save();
            return new Response(savedProduct, "Ürün başarıyla eklendi!").created(res);
        });
    } catch (err) {
        next(err);
    }
};


/**
 * @swagger
 * /api/works/{worksID}:
 *   get:
 *     tags: [Works]
 *     parameters:
 *       - in: path
 *         name: worksID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A specific product
 *         content:
 *           application/json:
 */

const worksID = async (req, res, next) => {
    try {
        const { worksID } = req.params;
        const selectedProduct = await Product.findById(worksID);

        if (!selectedProduct) {
            throw new APIError("Mehsul yoxdur!", 404);
        }

        res.status(200).json(selectedProduct);
    } catch (err) {
        next(err);
    }
};



/**
 * @swagger
 * /api/works/{worksID}:
 *   put:
 *     parameters:
 *       - in: path
 *         name: worksID
 *         required: true
 *   
 *     tags: [Works]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               descriptionMain:
 *                 type: string
 *               descriptionItems:
 *                 type: array
 *                 items:
 *                   type: string
 *               webUrl:
 *                 type: string
 *               githubUrl:
 *                 type: string
 *               photoMain:
 *                 type: string
 *                 format: binary
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: works created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */


const editWorksID = async (req, res, next) => {
    try {
        upload(req, res, async (err) => {
            if (err) {
                // Fotoğrafları temizleme işlemi
                if (req.files?.photoMain) {
                    await Promise.all(req.files.photoMain.map(file => {
                        const path = `public/uploads/images/works/${file.filename}`;
                        return fs.unlink(path);
                    }));
                }
                if (req.files?.photos) {
                    await Promise.all(req.files.photos.map(file => {
                        const path = `public/uploads/images/works/${file.filename}`;
                        return fs.unlink(path);
                    }));
                }
                return next(err);
            }

            const { worksID } = req.params;
            const { name, descriptionMain, descriptionItems, webUrl, githubUrl } = req.body;

            // URL'leri oluşturma
            const photoMainUrl = req.files.photoMain ? `http://${req.get('host')}/uploads/images/works/${req.files.photoMain[0].filename}` : null;
            const photosUrls = req.files.photos ? req.files.photos.map(file => `http://${req.get('host')}/uploads/images/works/${file.filename}`) : [];

            const finalWebUrl = webUrl && webUrl.trim() === "" ? null : webUrl;
            const finalGithubUrl = githubUrl && githubUrl.trim() === "" ? null : githubUrl;

            const updateData = {
                ...(name && { name }),
                ...(descriptionMain && {
                    description: {
                        descriptionMain,
                        items: descriptionItems ? descriptionItems.split(",") : [],
                    },
                }),
                ...(req.files.photoMain && {
                    "photos.photoMain": photoMainUrl,
                }),
                ...(req.files.photos && {
                    "photos.items": photosUrls,
                }),
                ...(webUrl !== undefined && { webUrl: finalWebUrl }),
                ...(githubUrl !== undefined && { githubUrl: finalGithubUrl }),
            };

            const updatedProduct = await Product.findByIdAndUpdate(worksID, updateData, { new: true });

            if (!updatedProduct) {
                throw new APIError("Ürün bulunamadı!", 404);
            }

            return res.status(200).json({
                message: "Ürün başarıyla güncellendi!",
                product: updatedProduct,
            });
        });
    } catch (err) {
        next(err);
    }
};





/**
 * @swagger
 * /api/works/{worksID}:
 *   delete:
 *     tags: [Works]
 *     parameters:
 *       - in: path
 *         name: worksID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: works deleted successfully
 *       content:
 *           application/json:
 */
const deleteWorksID = async (req, res, next) => {
    try {
        const { worksID } = req.params;

        const deletedProduct = await Product.findByIdAndDelete(worksID);

        if (!deletedProduct) {
            throw new APIError("Product not found!", 404);
        }

        // Fotoğraf dosyalarını sil
        if (deletedProduct.photos.photoMain) {
            const photoMainPath = path.join(__dirname, `../../../public/uploads/images/works/${path.basename(deletedProduct.photos.photoMain)}`);
            try {
                await fs.access(photoMainPath);  // Asenkron dosya kontrolü
                await fs.unlink(photoMainPath);  // Dosya silme
                console.log(`Ana fotoğraf silindi: ${photoMainPath}`);
            } catch (err) {
                console.error("Ana fotoğraf silinemedi:", err);
            }
        }

        if (deletedProduct.photos.items && deletedProduct.photos.items.length > 0) {
            for (const photo of deletedProduct.photos.items) {
                const photoPath = path.join(__dirname, `../../../public/uploads/images/works/${path.basename(photo)}`);
                try {
                    await fs.access(photoPath);
                    await fs.unlink(photoPath);
                    console.log(`Ek fotoğraf silindi: ${photoPath}`);
                } catch (err) {
                    console.error("Ek fotoğraf silinemedi:", err);
                }
            }
        }

        res.status(200).json({ message: "Product and associated photos successfully deleted!" });
    } catch (err) {
        next(err);
    }
};




module.exports = {
    works,
    create,
    worksID,
    editWorksID,
    deleteWorksID,
};

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: id
 *         name:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
