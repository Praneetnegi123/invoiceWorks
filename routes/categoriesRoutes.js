const router = require("express").Router();
const category = require("../controllers/categoriesController");
const user = require("../middleware/auth")

/*************** category CRUD **************/
router.post("/addCategories", user.authenticate, category.addCategory);
router.get("/getCat", user.authenticate, category.displayCategory);
router.put("/updateCategory", user.authenticate, category.updateCategory)
router.delete("/deleteCategory", user.authenticate, category.deleteCategory);
router.get("/allCat", user.authenticate, category.displayAllCategory);

module.exports = router;