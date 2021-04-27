const user = require("../models/User")
var jwt = require("jsonwebtoken");

//!Creating a Middleware
const verifyUser = async (req, res, next) => {
    
    try {
      const decoded = jwt.verify(
        req.headers.authorization,
        process.env.JWT_SECRTE_KEY
      );
      let userData = await user.findOne({ _id: decoded.id });
      if (userData) {
        req.body.user_id = decoded.id;
        next();
      }
    } catch {
      res.send("UNAUTHENTICATED");
    }
  };

module.exports=verifyUser