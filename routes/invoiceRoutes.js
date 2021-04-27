const router = require("express").Router();
const passport = require("../middleware/auth");
const invoiceController = require("../controllers/invoice");


router.get("/:id", invoiceController.getInvoice)//get invoice with there id
router.get("/pdf/:id", invoiceController.getPdf)//Download the pdf of invoice
router.post("/", passport.authenticate, invoiceController.addInvoice)//Add invoice data
router.get("/", passport.authenticate, invoiceController.showInvoice)//Show invoices for logged user
router.put("/:id", passport.authenticate, invoiceController.updateInvoice)//you have to give status key and value in body
router.delete("/:id", passport.authenticate, invoiceController.deleteInvoice)
router.get("/filterByDate/date", invoiceController.getAllInvoiceData)
router.get("/mail/:id", invoiceController.mail)// mail

module.exports = router;