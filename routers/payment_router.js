const { createOrder, capturePayment } = require("../service/paypal");
const router = require("express").Router();


router.post("/create-order",async (req,res) => {
    try {
      const orderId = await createOrder();
      res.json({orderId})
    } catch (error) {
        res.status(500).json({message:false})
    }
});

router.post("/complete-order",async(req,res) => {
try {
    const {orderId} = req.body;

   const captureData = await capturePayment(orderId);
   res.json(captureData)
} catch (error) {
    console.log(error)
    res.status(500).json({message:false})

}
})


module.exports = router