const mongoose = require("mongoose");

const order_schema = new mongoose.Schema({
    clientId: {
        ref: "Clients",
        type: mongoose.Types.ObjectId
    },
    client_details: {
        client_phone: {
            type: String,
            // required: true,
        },
        client_address: {
            city: {
                type: String,
                trim: true,
                // required: true
            },
            street: {
                type: String,
                trim: true,
                // required: true
            },
            building: {
                type: String,
                trim: true,
                // required: true
            },
            apartment: {
                type: String,
                trim: true,
                // required: true
            },
        }
    },
    total_price: {
        type: Number,
        min: 1
    },
    products: [
        {
            productId: {
                type: mongoose.Types.ObjectId,
                ref: "Products"
            },
            RTP: {
                type: Number,
                // required: true,
                min: 1
            },
            quantity: {
                type: Number,
                // required: true,
                min: 1
            }
        }
    ],
    status: {
        type: Number,
        default: 1,
        min: [1, "minimom 1"],
        max: [4, "max 4"],
    }
}, { timestamps: true });

// order_schema.pre("save", function (next) {
//     this.total_price = this.products.reduce((total, product) => {
//         return total + (product.RTP * product.quantity);
//     }, 0)

    // next();
// })

module.exports = mongoose.model("Orders", order_schema)