const Product = require("../model/product_model");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME_CLOUDINARY,
  api_key: process.env.API_KEY_CLOUDINARY,
  api_secret: process.env.SECRET_KEY_CLOUDINARY,
});

module.exports = {
  addProduct: async (req, res) => {
    try {
      if (req.file) {
        console.log(req.file.path);
        const data = await cloudinary.uploader.upload(req.file.path);
        req.body.product_image = data.secure_url;
        console.log(req.body);
      }

      const {
        product_name,
        product_price,
        product_description,
        product_image,
        product_amount,
        product_discount,
        product_category,
      } = req.body;
     
    //   if (
    //     !product_name ||
    //     !product_price ||
    //     !product_description ||
    //     !product_image ||
    //     !product_amount ||
    //     !product_category
    //   ) {
    //     throw new Error("one of the property are missing");
    //   }
      console.log(req.body)
      const product = new Product(req.body)

      await product.save();

      return res.status(200).json({
        message: "successfully to add product",
        success: true,
      })
    } catch (error) {
      return res.status(500).json({
        message: "error in add product",
        success: false,
        error: error.message,
      });
    }
  },
};
