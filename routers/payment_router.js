const { createOrder, capturePayment } = require("../service/paypal");
const router = require("express").Router();


router.post("/create-order", async (req, res) => {
    try {
        const { total_price } = req.body;
        console.log(total_price)
        const orderId = await createOrder(total_price);
        res.json({ orderId })
    } catch (error) {
        res.status(500).json({ message: false })
    }
});

router.post("/complete-order", async (req, res) => {
    try {
        const { orderId } = req.body;
        // console.log(JSON.stringify(purchaseOrderInfo));
        const captureData = await capturePayment(orderId);
        res.json(captureData)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: false })

    }
})


module.exports = router