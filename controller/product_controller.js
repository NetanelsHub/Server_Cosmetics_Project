const Product = require("../model/product_model");
const cloudinary = require("cloudinary").v2;
const Category  =require("../model/category_model")

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME_CLOUDINARY,
  api_key: process.env.API_KEY_CLOUDINARY,
  api_secret: process.env.SECRET_KEY_CLOUDINARY,
});

module.exports = {
  addProduct: async (req, res) => {
    try {
      console.log(req.file)
      console.log(req.body)
      if (req.file) {
        const data = await cloudinary.uploader.upload(req.file.path);
        req.body.product_image = data.secure_url;
        console.log(req.body.product_image);
      }
      console.log(req.body.product_category)
      const category = await Category.findOne({category_name: req.body.product_category})
      if (!category) {throw new Error("Category not found")}
      const {_id} = category

      const {
        product_name,
        product_price,
        product_description,
        product_image,
        product_amount,
        product_discount,
        product_category,
      } = req.body;
     
      if (
        !product_name ||
        !product_price ||
        !product_description ||
        !product_image ||
        !product_amount ||
        !product_category
      ) {
        throw new Error("one of the property are missing");
      }

      const newProduct = new Product({
        product_name:product_name,
        product_price:product_price,
        product_description:product_description,
        product_image : product_image,
        product_amount: product_amount,
        product_discount :product_discount,
        product_category: _id,

      })
     
      await newProduct.save();

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
  },getAllProduct:async (req, res) =>{
      try {
       const products = await Product.find().populate("product_category");

        return res.status(200).json({
          message: "successfully to get products",
          success: true,
          products,
        })
      } catch (error) {
        return res.status(500).json({
            message: "error in get products",
            success: false,
            error: error.message,
          });
      }

  },deleteProduct: async (req, res) => {
    try {
      const id = req.params.id;
      // console.log("zdsajfb",id)
      await Product.findByIdAndDelete(id);

      return res.status(200).json({
        message: "successfully to delete product",
        success: true,
      });
    } catch (error) {
      return res.status(500).json({
        message: "error in delete product",
        success: false,
        error: error.message,
      });
    }
  },  
  updateProduct: async (req, res) => {
    try {
      const id = req.params.id;

         
      if (req.file) {
        const data = await cloudinary.uploader.upload(req.file.path);
        req.body.product_image =data.secure_url;
      }
      console.log(req.body.product_category)

      const category = await Category.findOne({category_name: req.body.product_category})
      if (!category) {throw new Error("Category not found")}
      const {_id} = category
      req.body.product_category = _id

      const product = await Product.findByIdAndUpdate(id,req.body);

      return res.status(200).json({
        message: "successfully to update product",
        success: true,
        product
      });
    } catch (error) {
      return res.status(500).json({
        message: "error in update product",
        success: false,
        error: error.message,
      });
    }
  },
  getProductsByCategory: async (req, res) => {
    try {
      const name = req.query.Search;

        
      console.log(name)

      const category = await Category.findOne({category_name:name})
      if (!category) {throw new Error("Category not found")}
      const {_id} = category

      const productsByCategory = await Product.find({product_category:_id});

      return res.status(200).json({
        message: "successfully to get Products By Category",
        success: true,
        productsByCategory
      });
    } catch (error) {
      return res.status(500).json({
        message: "error in get Products By Category",
        success: false,
        error: error.message,
      });
    }
  }
};