const router = require("express").Router();
const organization = require('../controllers/organizationController');
const passport = require('../middleware/orgAuth');
require("dotenv").config();
const multer = require('multer');
const upload = multer({dest:'uploads/'});

/************* CRUD operation organization **********/
router.post("/register", passport.orgValidate, organization.orgRegister);
router.post("/login",passport.orgLoginValidate, passport.orgPassport.authenticate('local'), organization.loginOrg)
router.get("/detail", passport.authenticate, organization.getTheOrg);
router.get("/allDetail", organization.getAllTheOrg);
router.post("/forgotPass", organization.resetPasswordLink);
router.post("/resetPassword", passport.orgPasswordValidate, organization.resetPassword);
router.put('/updatePassword', passport.orgPasswordValidate, passport.authenticate, organization.updateOrgPassword);
router.put('/updateProfile', passport.authenticate, organization.updateOrgProfile);
router.delete('/delete', passport.authenticate, organization.deleteAccount);

/************* data wise filter and upload image *************/
router.post("/upload",passport.authenticate,upload.single('logo'),organization.uploadImage);
router.get("/filterDate",organization.filterWiseDate);

module.exports = router;