const mongoose = require("mongoose")

const client_schema = new mongoose.Schema({
    client_email:{
        type:String,
        required:true,
        match:/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
        unique:true
    },
    client_password:{
        type:String,
        required:true,
        // match:/^(?=.\d)(?=.[a-z])(?=.*[A-Z]).{5,}$/
        match: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{5,}$/,
    },
    client_fName:{
        type:String,
        required:true
    },
    client_lName:{
        type:String,
        required:true
    },
    tokens:[{type:Object}]
},
 {timestamps:true}
)



module.exports = mongoose.model("Clients",client_schema)