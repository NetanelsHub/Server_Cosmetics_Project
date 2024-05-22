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
},deleteCategory: async (req, res) => {
    try {
      const id = req.params.id;
    
      await Category.findByIdAndDelete(id);

      return res.status(200).json({
        message: "successfully to delete Category",
        success: true,
      });
    } catch (error) {
      return res.status(500).json({
        message: "error in delete Category",
        success: false,
        error: error.message,
      });
    }
  },updateCategory: async (req, res) => {
    try {
      const id = req.params.id;
     console.log(req.body)
     console.log(id)
     const edit = await Category.findByIdAndUpdate(id,req.body);
     console.log(edit)
      return res.status(200).json({
        message: "successfully to update Category",
        success: true,
        edit
      });
    } catch (error) {
      return res.status(500).json({
        message: "error in update Category",
        success: false,
        error: error.message,
      });
    }
  }

}