const router = require("express").Router();
const tax = require("../controllers/taxController");
const user = require("../middleware/auth");

/*********** tax CRUD *************/
router.post("/addTax",user.authenticate,tax.addTax);
router.get("/getTax",user.authenticate,tax.getTax);
router.put("/updateTax",user.authenticate,tax.updateTax);
router.delete("/deleteTax",user.authenticate,tax.deleteTax);

module.exports= router;