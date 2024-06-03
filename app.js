const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const cookieParser = require('cookie-parser')

require("dotenv").config();
require("./database/mongo")();
require("./service/paypal");

app.use(cors(
    {
    origin:[ process.env.CLIENT_ADMIN_URL],
    credentials:true,
    optionsSuccessStatus:200 
}
))
app.use(express.json());
app.use(cookieParser())
app.use(express.static(path.join(__dirname,"public")))


const superUser = require("./routers/superUser_router")
const category_router = require("./routers/categories_router");
const product_router = require("./routers/product_router");
const client_router = require("./routers/client_router");
const order_router = require('./routers/order_router')
const payment_router = require("./routers/payment_router");





app.use("/user",superUser)
app.use("/categories",category_router)
app.use("/products",product_router)
app.use("/client",client_router)
app.use("/orders",order_router)
app.use("/payment",payment_router)


const port = process.env.PORT
app.listen(port,() => console.log(`server is running on port ${port}`))
