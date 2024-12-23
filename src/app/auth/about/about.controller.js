const User = require("./model"); // Şemanızın bulunduğu dosyayı doğru şekilde içe aktarın.

const getAbout = async (req, res) => {
    try {
        const users = await User.find(); // Tüm kullanıcıları getir
        res.status(200).json({
            data: users
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

const createAbout = async (req, res) => {
    try {
        const { about, experience, education, skills, socialmedia } = req.body;
        // Veritabanında bir kayıt olup olmadığını kontrol et
        const existingAbout = await User.findOne();
        if (existingAbout) {
            return res.status(400).json({ message: "Hakkında bilgisi zaten mevcut, yeniden oluşturulamaz." });
        }

        const About = new User({
            about,
            experience: {
                items: experience?.items || []
            },
            education: {
                items: education?.items || []
            },
            skills: {
                items: skills?.items || []
            },
            socialmedia: {
                items: socialmedia?.items || []
            }
        });

        await About.save();
        res.status(201).json({
            About
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

const editAbout = async (req, res) => {
    try {
        // Parametre olarak gelen ID'yi al
        const { id } = req.params;
        console.log(`Güncellenmek istenen about kaydının ID'si: ${id}`);

        // Veritabanında ID'ye sahip bir "about" kaydını bul
        const existingAbout = await User.findById(id);
        if (!existingAbout) {
            console.log(`ID ${id} ile eşleşen "about" kaydı bulunamadı.`);
            return res.status(404).json({ message: "Hakkında bilgisi bulunamadı." });
        }
        console.log(`ID ${id} ile bulunan "about" kaydı:`, existingAbout);

        // Güncellenmek istenen veriyi al
        const { about, experience, education, skills, socialmedia } = req.body;

        // Veriyi güncelle
        existingAbout.about = about || existingAbout.about;
        existingAbout.experience.items = experience?.items || existingAbout.experience.items;
        existingAbout.education.items = education?.items || existingAbout.education.items;
        existingAbout.skills.items = skills?.items || existingAbout.skills.items;
        existingAbout.socialmedia.items = socialmedia?.items || existingAbout.socialmedia.items;

        // Güncellenen veriyi kaydet
        await existingAbout.save();
        console.log(`ID ${id} ile güncellenmiş "about" kaydı:`, existingAbout);

        res.status(200).json({
            message: "Hakkında bilgisi başarıyla güncellendi.",
            data: existingAbout
        });
    } catch (error) {
        console.error("Sunucu hatası:", error.message);
        res.status(500).json({
            message: "Sunucu hatası",
            error: error.message
        });
    }
};





module.exports = { createAbout, getAbout,editAbout };
