const Order = require('../model/order_model');

module.exports = {

    addOrder: async (req, res) => {
        try {
            // const {} = req.body;
            console.log("i am in order")
            const order = new Order(req.body);
            console.log("order:",  order)
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
            const orders = await Order.find().populate('clientId').populate('products');
            res.status(200).json(orders);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },updateStatus:async (req, res) => {
        try {
    
          const status = req.params.status;
          const id = req.body.id;
          console.log(id)
    
          await Order.findByIdAndUpdate(id,{status})
    
          return res.status(200).json({
            message: "successfully updated Status",
            success: true,
          });
        } catch (error) {
          return res.status(500).json({
            message: "error in update Status",
            success: false,
            error: error.message,
          });
        }
      },
}