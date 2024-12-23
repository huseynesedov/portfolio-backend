const whiteList = [
    "http://localhost:3000","http://localhost:3001","http://localhost:3002","http://localhost:3003","http://localhost:3004","http://localhost:3005",
    "http://localhost:4000","http://localhost:4001","http://localhost:4002","http://localhost:4003","http://localhost:4004","http://localhost:4005",
    "http://localhost:5000","http://localhost:5001","http://localhost:5002","http://localhost:5003","http://localhost:5004","http://localhost:5005",
    ]

const corsOptions = (req, callback) => {
    let corsOptions;
    if (whiteList.indexOf(req.header("Origin")) !== -1) {
        corsOptions = {origin: true}
    } else {
        corsOptions = {origin: false}
    }

    callback(null, corsOptions)
}

module.exports = corsOptions