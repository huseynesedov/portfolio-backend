const rateLimit = require("express-rate-limit");

const allowList = ["::1"];

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // ip adresine 15 dq ban 
    max: (req, res) => {
        if (req.url === "/login" || req.url === "/register")
        return 10 // max 10 requeste qeder icaze verilir daha sonraki isteklerde problemli ip olaraq bilinir .
        else return 100 // diger api routerlara 100 request atila biler
    },
    message: {
        success: false,
        message: "2 saatdan sonra yeniden yoxlayin  !"
    },
    skip: (req, res) => allowList.includes(req.ip),
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = apiLimiter;