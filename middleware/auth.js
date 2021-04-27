const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");
const Organization = require("../models/Organization");
const passport = require('passport');
// const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require("bcrypt");
// const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
const phone = require('phone');

// middleware to authenticate the user
passport.serializeUser(function (user, done) {
    done(null, user);
})
passport.deserializeUser(function (id, done) {
    done(null, '');

});

/************* passport validation ***********/
const userPassport = (async (req, res, next) => {
    const { email, password } = req.body;
    const salt = 10;
    try {
        const user = await User.findOne({ email: email }).populate('organizations');
        if (user) {
            const passwordValidate = await bcrypt.compare(password, user.password);
            if (!passwordValidate) {
                const detail = "incorrect password";
                res.status(400).send({ detail });
            } else {
                req.user = user;
                return next(null, req.user);
            }
        } else {
            const detail = "user not found";
            res.status(404).send({ detail });
        }
    } catch (error) {
        res.status(400).send(error.message)
    }
})

/************* passport validation ***************/
// const userPassport = passport.use(new LocalStrategy({
//     usernameField: 'email',
//     passwordField: 'password',
//     passReqToCallback: true
// },
//     async (done, user_name, password, next) => {
//         const salt = 10;
//         // const pass = await hashing(password, salt);
//         try {
//             User.findOne({ email: user_name }, async (err, user) => {
//                 if (user) {
//                     const passwordValidate = await bcrypt.compare(password, user.password);
//                     if (err) { return console.log(err) }
//                     if (!user) {
//                         const detail = "Unauthorized User" ;
//                         return next(null, {detail});
//                     }
//                     if (!passwordValidate) {
//                         const detail = "password not matched" ;
//                         return next(null, {detail});
//                     }
//                     return next(null, user);
//                 } else {
//                     const detail = "user not found" ;
//                     return next(null, {detail});
//                 }

//             });
//         } catch (error) {
//             console.log(error.message)
//         }
//     }
// ));

/************* jwt authentication ***************/
const authenticate = (async (req, res, next) => {
    try {
        const decoded = jwt.verify(
            // requesting the token from the header to authenticate
            req.headers.authorization,
            process.env.JWT_SECRET_KEY
        );
        if (decoded) {
            const data = await User.findOne({ _id: decoded.id });
            if (data) {
                req.body.detail = data;
                return next(null, data);
            } else {
                const detail = "user not found";
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

/************* validate email *************/
function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

/************* register user validate  ***********/
const userValidate = ((req, res, next) => {
    const num = Number(req.body.mobile)
    try {

        let counter = 0, detail = "", name, password, email, mobile;

        const mobilePhone = req.body.mobile;
        if (phone(mobilePhone) != "") {
            counter++;
        } else {
            mobile = "mobile number is not valid";
            detail = ({ mobile });
        }

        if (req.body.firstName.length >= 3) {
            counter++;

        } else {
            name = "your name should be greater then or equal to 3 characters";
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
            email = "please enter correct email format";
            detail = ({ mobile, name, password, email });
        }
        if (!detail) {
            next();
        } else {
            res.status(400).json(detail);
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
})


/************* login validation *********/
const userLoginValidate = ((req, res, next) => {
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


/************* user password validation **********/
const userPasswordValidate = ((req, res, next) => {
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


/************* user present or not  ************/
const uniqueOrgInProfile = (async (req, res, next) => {
    try {
        const detail = req.body.detail;
        const id = req.body.detail._id;
        const { org_id } = req.body;
        if (org_id !== "") {
            const data = await Organization.findOne({ _id: org_id });
            if (data) {
                // const detail = await User.findOne({ _id: id });
                let emp = detail.organizations.find((x) => {
                    return x == org_id;
                })
                if (emp) {
                    const detail = "user already in a this organization";
                    res.status(409).send({ detail });
                } else {
                    next();
                }
            } else {
                const detail = "organization not found";
                res.status(404).send({ detail });
            }
        } else {
            const detail = "organization id can't be empty";
            res.status(404).send({ detail });
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
})


module.exports = {
    userPassport,
    authenticate,
    userValidate,
    userLoginValidate,
    userPasswordValidate,
    uniqueOrgInProfile
};