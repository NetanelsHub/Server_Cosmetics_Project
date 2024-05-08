const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require('cookie-parser')
require("dotenv").config();
require("./database/mongo")();
const port = process.env.PORT

const superUser = require("./routers/superUser_router")

app.use(cors({
    origin: process.env.CLIENT_ADMIN_URL,
    credentials:true,
    optionsSuccessStatus:200
}))

app.use(express.json());
app.use(cookieParser())

app.use("/user",superUser)

app.listen(port,() => console.log(`server is running on port ${port}`))
