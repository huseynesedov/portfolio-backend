const mongoose = require("mongoose");

// Şema tanımı
const userSchema = new mongoose.Schema({
    about: {
        type: String,
        required: true,
        trim: true
    },
    experience: {
        items: [
            {
                link: {
                    type: String, // Şirketin veya pozisyonun bağlantısı
                    required: true,
                    trim: true
                },
                company: {
                    type: String, // Çalışılan şirketin adı
                    required: true,
                    trim: true
                },
                position: {
                    type: String, // Şirketteki pozisyon
                    required: true,
                    trim: true
                }
            }
        ]
    },
    education: {
        items: [
            {
                link: {
                    type: String, // Şirketin veya pozisyonun bağlantısı
                    required: true,
                    trim: true
                },
                company: {
                    type: String, // Çalışılan şirketin adı
                    required: true,
                    trim: true
                },
                position: {
                    type: String, // Şirketteki pozisyon
                    required: true,
                    trim: true
                }
            }
        ]
    },
    skills: {
        items: [
            {
                type: String, // Şirketin veya pozisyonun bağlantısı
                required: true,
                trim: true
            }
        ]
    },
    socialmedia: {
        items: [
            {
                link: {
                    type: String, // Şirketin veya pozisyonun bağlantısı
                    required: true,
                    trim: true
                },
                companyIcon: {
                    type: String, // Çalışılan şirketin adı
                    required: true,
                    trim: true
                }
            }
        ]
    },
  
}, {
    collection: "about", // Koleksiyon adı
    timestamps: true, // createdAt ve updatedAt alanlarını ekler
    versionKey: false // __v alanını devre dışı bırakır
});

// Model oluşturma
const About = mongoose.model("about", userSchema);

module.exports = About;
