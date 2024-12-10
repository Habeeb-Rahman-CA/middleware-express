const express = require("express")
const path = require("path")
const logger = require("morgan")
const multer = require("multer")
const router = express.Router()
const upload = multer({ dest: "./public/uploads" })

const app = express()

const PORT = 5001

//Built-in Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use("/static", express.static(path.join(__dirname, "public")))

//Application Middleware
const loggerMiddleware = (req, res, next) => {
    console.log(`${new Date()} --- request [${req.method}] [${req.url}]`)
    next()
}
app.use(loggerMiddleware)

//Third party Middleware
app.use(logger("combined"))

//Router-Level Middleware
app.use("/api/users", router)

const fakeAuth = (req, res, next) => {
    const authStatus = true
    if (authStatus) {
        console.log("user auth: ", authStatus)
        next()
    } else {
        res.status(401)
        throw new Error("user is not authorized")
    }
}

const getUsers = (req, res) => {
    res.json({ message: "Get All Users" })
}

const createUser = (req, res) => {
    console.log("this is the request body recieved from the client: ", req.body)
    res.json({ message: "Created New User" })
}

router.use(fakeAuth)
router.route("/").get(getUsers).post(createUser)

//Error-handling Middleware
const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode ? res.statusCode : 500
    res.status(statusCode)
    switch (statusCode) {
        case 401:
            res.json({
                title: "Unauthorized",
                message: err.message
            })
            break;
        case 404:
            res.json({
                title: "Not Found",
                message: err.message
            })
            break;
        case 500:
            res.json({
                title: "Server Error",
                message: err.message
            })
            break;

        default:
            break;
    }
}

//multer file uploader
app.post("/upload", upload.single("image"), (req, res, next) => {
    console.log(req.file, req.body)
    res.send(req.file)
}, (err, req, res, next) => {
    res.status(400).send({ err: err.message })
})

app.all("*", (req, res) => {
    res.status(404)
    throw new Error("Route not found")
})
app.use(errorHandler)

//listening the port
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`)
})

