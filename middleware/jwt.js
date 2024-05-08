const jwt = require("jsonwebtoken");
const Admin = require("../model/admin_model")

//  if thr user get out from the page and come back
// if  he as token
// if the token still have time 
// if all true --> /deshboard
// if not  ---> login

const jwtAuth = async (req, res, next) => {
    try {
        // get the token from the cookies
        const token = req.cookies.token;

        // if there is a token
        if (!token) { throw new Error("User don't have token") }

        // if its valid
        const decode = jwt.verify(token, process.env.JWT_SECRET);

        if (!decode) { throw new Error("Token is not valid") }

        req.payload = decode
        next()

    } catch (error) {
        return res.status(401).json({
            message: "invalid token",
            error: error.message
        })

    }
}

module.exports = jwtAuth