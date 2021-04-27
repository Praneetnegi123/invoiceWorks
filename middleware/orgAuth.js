const jwt = require("jsonwebtoken");
require("dotenv").config();
const Organization = require("../models/Organization");
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require("bcrypt");
const phone = require('phone');
// const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
// const SendMail = require("../SendMail");

/************* middleware to authenticate the user **************/
passport.serializeUser(function (user, done) {
    done(null, user);
})
passport.deserializeUser(function (id, done) {
    done(null, '');
});

/************* passport validation **************/
const orgPassport = passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
},
    async (done, user_name, password, next) => {
        const salt = 10;
        // const pass = await hashing(password, salt);
        try {
            Organization.findOne({ email: user_name }, async (err, user) => {
                if (user) {
                    const passwordValidate = await bcrypt.compare(password, user.password);
                    if (err) { return console.log(err) }
                    if (!user) {
                        const detail = { "Detail": "Unauthorized User" };
                        return next(null, detail);
                    }
                    if (!passwordValidate) {
                        const detail = { "Detail": "password not matched" };
                        return next(null, detail);
                    }
                    return next(null, user);
                } else {
                    const detail = { "Detail": "user not found" };
                    return next(null, detail);
                }

            });
        } catch (error) {
            console.log(error.message)
        }
    }
));

/************* jwt authentication ************/
const authenticate = (async (req, res, next) => {
    try {
        const decoded = await jwt.verify(
            // requesting the token from the header to authenticate
            req.headers.authorization,
            process.env.JWT_SECRET_KEY
        );
        if (decoded) {
            const data = await Organization.findOne({ _id: decoded.id });
            if (data) {
                req.body.detail = data;
                return next(null, data);
            } else {
                const detail = "invalid signature or token";
                res.status(401).send({ detail });
            }
        } else {
            const detail = "Unauthenticated User";
            res.status(401).send({ detail });
        }

    } catch (err) {
        return res.status(400).send(err.message);
    }
}
)

/************* validate email ************/
function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

/************* register user validate  ******************/
const orgValidate = ((req, res, next) => {
    try {
        let counter = 0, detail = "", name, password, mobile;

        const mobilePhone = req.body.mobile;
        if (phone(mobilePhone) != "") {
            counter++;
        } else {
            mobile = "mobile number is not valid";
            detail = ({ mobile });
        }
        if (req.body.companyName.length >= 3) {
            counter++;

        } else {
            name = "your organization name should be greater then or equal to 3 characters";
            detail = ({ mobile, name });
        }
        if (/^(?=.*?[A-Z])(?=.*?[#?!@$%^&*-]).{8,}$/.test(req.body.password)) {
            counter++;
        } else {
            password = "password must contain 8 character,one special character and one upperCase character";
            detail = ({ mobile, name, password });
        }
        let validEmail = validateEmail(req.body.email);
        if (validEmail) {
            counter++;
        } else {
            email = "please enter correct email formate";
            detail = ({ mobile, name, password, email });
        }
        if (detail === "") {
            next();
        } else {
            res.status(400).send(detail);
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
})


/************* User login validation *****************/
const orgLoginValidate = ((req, res, next) => {
    try {
        let counter = 0;
        let detail = "", email, password;
        let validEmail = validateEmail(req.body.email);
        if (validEmail) {
            counter++;
        } else {
            email = "please enter correct email password";
            detail = ({ email });
        }

        if (/^(?=.*?[A-Z])(?=.*?[#?!@$%^&*-]).{8,}$/.test(req.body.password)) {
            counter++;
        } else {
            password = "password must contain 8 character,one special character and one upperCase character";
            detail = ({ password, email });
        }
        if (!detail) {
            next();
        } else {
            res.status(400).send(detail);
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
})

/************* org password validation **************/
const orgPasswordValidate = ((req, res, next) => {
    try {
        if (/^(?=.*?[A-Z])(?=.*?[#?!@$%^&*-]).{8,}$/.test(req.body.password)) {
            next();
        } else {
            const detail = "password must contain 8 character,one special character and one upperCase character";
            res.status(400).send({ detail });
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
})


module.exports = {
    orgPassport,
    authenticate,
    orgValidate,
    orgPasswordValidate,
    orgLoginValidate
};