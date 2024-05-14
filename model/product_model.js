const mongoose = require("mongoose");



const product_schema = new mongoose.Schema({
    product_name:{
        type:String,
        required:true,
        unique:true
    },
    product_price:{
        type:Number,
        required:true
    },
    product_description:{
        type:String,
        required:true
    },
    product_image:{
        type:String,
        default:""
    },
    product_amount:{
        type:Number,
        default:""
    },
    product_discount:{
        type:Number,
        default:""
    },

    product_category:[
        {
            ref:"Categories",
            type:mongoose.Types.ObjectId
        }
    ]

})


module.exports = mongoose.model("Products",product_schema)