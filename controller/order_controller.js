const Order = require('../model/order_model');

module.exports = {

    addOrder: async (req, res) => {
        try {
            // const {} = req.body;
            const order = new Order(req.body);
            await order.save();

            return res.status(200).json({
                message: "Order successfully",
                success: true,
                order
              });
        } catch (error) {
            return res.status(500).json({
                message: "Order faild",
                success: false,
                error: error.message,
            })
        }
    },
    getOrder: async (req, res) => {
        try {
            const orders = await Order.find().populate('clientId', 'client_fName').populate('products.productId','product_name');
            res.status(200).json(orders);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}