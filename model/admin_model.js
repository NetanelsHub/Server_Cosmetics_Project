const mongoose = require("mongoose")

const admin_schema = new mongoose.Schema({
    admin_email:{
        type:String,
        required:true,
        match:/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
        unique:true
    },
    admin_password:{
        type:String,
        required:true,
        // match:/^(?=.\d)(?=.[a-z])(?=.*[A-Z]).{5,}$/
        match: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{5,}$/,
    },
    admin_role:{
        type:String,
        enum:["Admin","Editor Manager"],
        default:"Admin",
        required:false
    },
    
    admin_fName:{
        type:String,
        required:false
    },
    admin_lName:{
        type:String,
        required:false
    },
    token:{type:Object}
},
 {timestamps:true}
)



module.exports = mongoose.model("Admin",admin_schema)