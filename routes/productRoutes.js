const router = require("express").Router();
const product = require("../controllers/productController");
const user = require("../middleware/auth");

/**************** Product CRUD **************/
router.post("/addProduct", user.authenticate, product.addProduct);
router.get("/getProduct", user.authenticate, product.displayProduct);
router.put("/updateProduct", user.authenticate, product.updateProduct);
router.delete("/deleteProduct", user.authenticate, product.deleteProduct);
router.get("/allProduct", user.authenticate, product.displayAllProduct);

module.exports = router;