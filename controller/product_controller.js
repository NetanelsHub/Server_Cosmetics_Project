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
        product_price_before_discount,
        product_description,
        product_image,
        product_amount,
        product_discount,
        product_category,
      } = req.body;
     
      if (
        !product_name ||
        !product_price_before_discount ||
        !product_description ||
        !product_image ||
        !product_amount ||
        !product_category
      ) {
        throw new Error("one of the property are missing");
      }

      const newProduct = new Product({
        product_name:product_name,
        product_price_before_discount:product_price_before_discount,
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
  }
  ,getAllProduct: async (req, res) => {
    try {
      // קבלת הפרמטרים מהבקשה
      const { page = 1, limit = 5, search, price } = req.query;
  
      // יצירת שאילתה ריקה
      const query = {};
  
      // הוספת סינון לפי שם מוצר אם קיים
      if (search) {
        query.product_name = { $regex: search, $options: "i" }; // מתעלם מגודל האותיות
      }
  
      // הוספת סינון לפי מחיר אם קיים
      if (price) {
        query.product_price_before_discount = { $lte: price };
      }
  
      // ספירת מספר המסמכים העונים על השאילתה
      const count = await Product.countDocuments(query);
      const pages = Math.ceil(count / limit);
  
      // מציאת המוצרים העונים על השאילתה עם הגבלה ודילוג לפי הדפדוף
      const products = await Product.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("product_category");
  
      // שליחת המידע ללקוח
      return res.status(200).json({
        message: "successfully to get products",
        success: true,
        products,
        pages
      });
    } catch (error) {
      // טיפול בשגיאות
      return res.status(500).json({
        message: "error in get products",
        success: false,
        error: error.message,
      });
    }
  }
  ,deleteProduct: async (req, res) => {
    try {
      const id = req.params.id;
     
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
      console.log(req.body)
      const product = await Product.findByIdAndUpdate(id,req.body, { new: true });

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
  ,getDiscountedProducts: async (req, res) => {
    try {
        const discountedProducts = await Product.find({ product_discount: { $gt: 0 } });
         console.log(discountedProducts)
        return res.status(200).json({
            message: "Successfully retrieved discounted products",
            success: true,
            products: discountedProducts
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error in retrieving discounted products",
            success: false,
            error: error.message,
        });
    }
  }
  ,getTopSellingProducts: async (req, res) => {
    try {
        const topSellingProducts = await Product.find().sort({ sales: -1 }).limit(5);

        return res.status(200).json({
            message: "Successfully retrieved top selling products",
            success: true,
            products: topSellingProducts
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error in retrieving top selling products",
            success: false,
            error: error.message,
        });
    }

 },

}