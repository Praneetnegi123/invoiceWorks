
const express = require("express")
const app = express()
const invoiceController = require("./controllers/invoice")
// const passport2 = require("./middleware/auth")
const bodyParser = require('body-parser')
// const mongoose = require('mongoose');
// const verifyUser = require("./utils/middleware")
// let pdf = require("html-pdf");

const mongoose = require('./config/db');
const user = require("./routes/userRoutes");
const organization = require("./routes/organizationRoutes");
// const invoice = require("./routes/invoiceRoutes");
const passport = require('passport');
const invoice = require("./routes/invoiceRoutes");
const tax = require("./routes/taxRoutes");
const category = require("./routes/categoriesRoutes");
const product = require("./routes/productRoutes");
const cors = require('cors');


/************* cors **************/
const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200 // For legacy browser support
}

app.set('view engine', 'ejs');
/************* middleware ***********/
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
app.use(passport.initialize());
app.use(passport.session());

app.use("/user", user);
app.use("/org", organization);
app.use("/invoice", invoice);
app.use(category);
app.use(product);
app.use(tax);





app.listen(9000, () => {
    console.log("App is running at http://localhost:9000 (✓ )"),
        console.log("  Press CTRL-C to stop\n")
})

