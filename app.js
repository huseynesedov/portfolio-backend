require("express-async-errors")
const express = require("express")
const app = express()
require("dotenv").config()
require("./src/db/dbConnection")

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const port = process.env.PORT || 5002
const router = require("./src/routers")
const errorHandlerMiddleware = require("./src/middlewares/errorHandler")
const cors = require("cors")
const corsOptions = require("./src/helpers/corsOptions")
const mongoSanitize = require('express-mongo-sanitize');
const path = require("path")

const apiLimiter = require("./src/middlewares/rateLimit")
const moment = require("moment-timezone")

moment.tz.setDefault("Europe/Baku")

// Middlewares
app.use(express.json())
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }))

app.use(cors(corsOptions))

app.use("/api", apiLimiter)
app.use('/api', express.static(path.join(__dirname, 'uploads')));

app.use(
    mongoSanitize({
        replaceWith: '_',
    }),
);



const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            version: '1.0.0',
            title: 'TestV1',
            description: 'salam',
        },
        servers: [
            {
                url: `http://localhost:${port}/`,
                description: 'Local server',
            },
        ],
    },
    apis: [
        "./src/app/auth/categories/*js",
        "./src/app/auth/product/*js",
        "./src/app/auth/user/*js",
        "./src/middlewares/auth/*js",
    ],
};


const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocs));




app.use("/api", router)



app.get("/", (req, res) => {
    res.json({
        message: "Hoş Geldiniz"
    })
})


// hata yakalama
app.use(errorHandlerMiddleware)

app.listen(port, () => {
    console.log(`Server ${port} portundan çalışıyor ...`);
})