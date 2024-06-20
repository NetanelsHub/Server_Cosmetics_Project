const mongoose = require("mongoose");



const product_schema = new mongoose.Schema({
    product_name:{
        type:String,
        required:true,
        unique:true
    },
    product_price_before_discount:{
        type:Number,
        // required:true
    },
    product_price:{
        type:Number,
        // required:true
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
    ],
    sales:{ 
        type: Number,
        default: 0 
    }
})
product_schema.pre("save", function (next) {
    if (this.product_discount > 0) {
        this.product_price = this.product_price_before_discount * (1 - this.product_discount / 100);
        this.product_price = Math.ceil(this.product_price);
    } else {
        this.product_price = this.product_price_before_discount;
    }
    next();
});

product_schema.pre('findOneAndUpdate', function (next) {
    const update = this.getUpdate();
    if (update.product_discount > 0) {
        update.product_price = update.product_price_before_discount * (1 - update.product_discount / 100);
        update.product_price = Math.ceil(update.product_price); // עיגול למעלה למספר השלם הקרוב ביותר
    } else {
        update.product_price = update.product_price_before_discount;
    }
    next();
});

module.exports = mongoose.model("Products",product_schema)