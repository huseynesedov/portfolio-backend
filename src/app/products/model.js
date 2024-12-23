const mongoose = require("mongoose");

// Şema tanımı
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        descriptionMain: {
            type: String,
            required: true,
            trim: true
        },
        items: {
            type: [String],
            required: true,
            trim: true
        }
    },
    photos: {
        photoMain: {
            type: String,
            required: true,
            trim: true
        },
        items: {
            type: [String],
            required: true,
            trim: true
        }
    },
    webUrl: {
        type: String,
        required: false,
        default: null
    },
    githubUrl: {
        type: String,
        required: false,
        default: null
    },
}, { collection: "works", timestamps: true, versionKey: false });

// Model oluşturma
const Product = mongoose.model("works", userSchema);

module.exports = Product;
