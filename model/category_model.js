const mongoose = require("mongoose")


const category_schema = new mongoose.Schema({
    category_name:{
        type:String,
        required:true,
        unique:true   
    }
})

module.exports = mongoose.model("Categories",category_schema)