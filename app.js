const express = require("express");
const app = express();
const path = require("path");

const cors = require("cors");
const cookieParser = require('cookie-parser')
require("dotenv").config();
require("./database/mongo")();
const port = process.env.PORT

const superUser = require("./routers/superUser_router")
const category_router = require("./routers/categories_router");
const product_router = require("./routers/product_router");

app.use(cors({
    origin: process.env.CLIENT_ADMIN_URL,
    credentials:true,
    optionsSuccessStatus:200
}))

app.use(express.json());
app.use(cookieParser())
app.use(express.static(path.join(__dirname,"public")))

app.use("/user",superUser)
app.use("/categories",category_router)
app.use("/products",product_router)


app.listen(port,() => console.log(`server is running on port ${port}`))
