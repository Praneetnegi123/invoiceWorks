const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/myInvoice",{
    useNewUrlParser: true,
}).then(()=>console.log("Invoice DataBase is Connected"))
.catch((err)=> console.log(err.message))

module.exports = mongoose;