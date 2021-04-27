const router = require("express").Router();
const user = require('../controllers/userController');
const passport = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
require("dotenv").config();

/************* CRUD operation on User ************/
router.post("/register", passport.userValidate, user.userRegister);
router.post('/login', passport.userLoginValidate, passport.userPassport, user.loginUser);
router.post('/forgotPassword', user.resetPasswordLink);
router.post('/resetPassword', passport.userPasswordValidate, user.resetPassword);
router.get('/detail', passport.authenticate, user.getTheUser);
router.put('/updatePassword', passport.userPasswordValidate, passport.authenticate, user.updateUserPassword);
router.delete('/delete', passport.authenticate, user.deleteUser);
router.put('/updateProfile', passport.authenticate, user.updateProfile);

/************* organization add to user profile  ************/
router.post("/addToProfile", passport.authenticate, passport.uniqueOrgInProfile, user.addOrgToProfile);

// organization add to user profile
router.post("/addToProfile", passport.authenticate, passport.uniqueOrgInProfile, user.addOrgToProfile);
// router.post("/sendPdf", passport.authenticate, upload.single('pdf'), user.sendPdf);

module.exports = router;