const Category = require("../model/category_model")



module.exports = {
addCategory:async (req,res) =>{
     try {
        
        const {category_name } = req.body

        if(!category_name) throw new Error("missing category name");

        const newCategory = new Category(req.body);
        await newCategory.save();

        return res.status(200).json({
            message: "successfully to add category",
            success: true,
        })

     } catch (error) {

        return res.status(500).json({
            message: "error in add category",
            success: false,
            error: error.message,
          });
        
     }

},getAllCategory:async(req,res) => {
    try {
        
        const categories = await Category.find()

        return res.status(200).json({
            message: "successfully to get category",
            success: true,
            categories
          })

    } catch (error) {
        return res.status(500).json({
            message: "error in get category",
            success: false,
            error: error.message,
          });
    }
}

}