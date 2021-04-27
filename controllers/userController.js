require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const SendMail = require('../SendMail');
// const passport = require("passport");


/*********** generate token **********/
const generateAccessToken = (id) => {
    return jwt.sign({ id }, `${process.env.JWT_SECRET_KEY}`);
};

/**************** hashing using bcrypt *****************/
const hashing = async (password, salt) => {
    const hash = await bcrypt.hash(password, salt);
    return hash;
}

/*************** register user ******************/
const userRegister = async (req, res) => {
    const { email, password, confirmPassword } = req.body;
    const user = await User.findOne({ email: email });
    try {
        if (password !== confirmPassword) {
            const detail = "password and confirm password must be same";
            res.status(400).send({ detail });
        } else {
            const salt = 10;
            let hash = await hashing(password, salt);
            hash = String(hash);
            if (!user) {
                // const set data = req.body;
                const data = User({ ...req.body, password: hash });
                await data.save();
                delete data._doc.password;
                res.status(200).send(data);
            } else {
                const detail = "user already register";
                res.status(409).send({ detail });
            }
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

/******************* login user **********************/
const loginUser = (async (req, res) => {
    const { email } = req.body;
    try {
        if (req.user) {
            const id = req.user._id;
            let token = generateAccessToken(req.user._id);
            const companies = req.user.organizations.map(x => { return { "id": x.id, "companyName": x.companyName } });
            delete req.user._doc.password;
            delete req.user._doc.organizations;
            res.json({ ...req.user._doc, companies, token });
        } else {
            const detail = "data not found";
            res.status(404).send({ detail });
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
});

/*********************** forgot password link generate to reset password    ********************/
const resetPasswordLink = (async (req, res) => {
    let { email } = req.body;
    let data = await User.findOne({ email });
    try {
        if (data) {
            let code = `<a href=${process.env.RESET_PATH}${data.email}">Click to reset password</a>`
            SendMail.sendMail(email, code, data.firstName);
            const detail = 'reset link is generated please check your e-mail';
            res.status(200).send({ detail });
        } else {
            const detail = 'unauthenticated user or user not found';
            res.status(400).send({ detail });
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
})


/******************** request for the reset password  ***************************/
const resetPassword = (async (req, res) => {
    const email = req.query.email;
    const { password, rePassword } = req.body;
    const data = await User.findOne({ email });
    try {
        if (data) {
            if (password === rePassword) {
                let salt = 10;
                rePassword = String(rePassword)
                let hash = await hashing(rePassword, salt);
                password = String(hash);
                let data = await User.findOneAndUpdate({ email: email }, { $set: { password: password } })
                if (data) {
                    let code = "Successfully updated your password";
                    await SendMail.sendMail(email, code, data.firstName);
                    let token = generateAccessToken(data._id);
                    delete data._doc.password;
                    res.status(200).send({ ...data._doc, token });
                }
                else {
                    const detail = 'unauthenticated user or user not found';
                    res.status(404).send({ detail });
                }
            } else {
                const detail = 'password and repeat password must be equal';
                res.status(400).send({ detail });
            }
        } else {
            const detail = 'user not found';
            res.status(404).send({ detail });
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
})


/*********************  getAll the user detail    ******************************/
const getTheUser = (async (req, res) => {
    const id = req.body.detail._id;
    try {
        if (id) {
            const data = await User.findOne({ _id: id }).populate('organizations');
            if (data) {
                data.organizations.map(i => (delete i._doc.password));
                delete data._doc.password;
                res.send(data);
            } else {
                const detail = "User not found";
                res.status(404).send({ detail });
            }
        } else {
            const detail = "unauthenticated user";
            res.status(401).send({ detail });
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
})

/*************************** update userPassword  ******************/
const updateUserPassword = (async (req, res) => {
    const { password, newPassword } = req.body;
    const id = req.body.detail._id;
    const userPassword = req.body.detail.password
    try {
        if (id) {
            const salt = 10;
            let hash = await hashing(newPassword, salt);
            const passwordValidate = await bcrypt.compare(password, userPassword);
            if (passwordValidate) {
                const data = await User.findOneAndUpdate({ _id: id }, { $set: { password: hash } });
                delete data._doc.password;
                res.json(data);
            } else {
                const detail = "user name and password does not match";
                res.status(400).send({ detail });
            }
        } else {
            const detail = "unauthenticated user";
            res.status(401).send({ detail });
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
})


/*********************** delete account *****************/
const deleteUser = (async (req, res) => {
    const { password } = req.body;
    const id = req.body.detail._id;
    const userPassword = req.body.detail.password;
    console.log("id", userPassword, " password", password)
    try {
        if (id) {
            const passwordValidate = await bcrypt.compare(password, userPassword);
            if (!passwordValidate) {
                const detail = "password does not match";
                res.status(400).send({ detail });
            } else {
                const user = await User.findOneAndDelete({ _id: id });
                delete user._doc.password;
                res.json(user);
            }
        } else {
            const detail = "user not found";
            res.status(404).send({ detail });
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
})


/***********************  update user profile  **********************/
const updateProfile = (async (req, res) => {
    try {
        const id = req.body.detail._id;
        if (id) {
            const updateData = req.body;
            const user = await User.findByIdAndUpdate({ _id: id }, updateData);
            delete user._doc.password;
            res.json(user);
        } else {
            const detail = "user not found";
            res.status(404).send({ detail });
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
})


/**********************  add organization into employee profile   ***********************/
const addOrgToProfile = (async (req, res) => {
    const { org_id } = req.body;
    const data = req.body.detail;
    const id = req.body.detail._id;
    try {
        if (id) {
            data.organizations.push(org_id);
            data.save();
            delete data._doc.password;
            res.send(data);
        } else {
            const detail = "unauthenticated user";
            res.status(401).send({ detail });
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
})


// send pdf through mail
// const sendPdf = (async (req, res, fileName) => {
//     let email = req.body.to;
//     let cc = req.body.cc;
//     // let data = req.file
//     // console.log(email, "&&&&&", from, "****8", cc, "%%%%%%", data, "{{{{{{", fileName)
//     // res.send({fileName,from,email,cc,data})
//     try {
//         if (email) {
//             let path = `${process.env.UPLOAD_PATHS}${fileName}`;
//             let file = `${fileName}`;
//             SendMail.sendPdf(email, cc, path, file);
//             let detail = { 'detail': 'your invoice pdf is successfully send' };
//             res.json(detail);
//         } else {
//             let detail = { 'detail': 'user not found' };
//             res.status(400).send(detail);
//         }
//     } catch (error) {
//         res.status(400).send(error.message);
//     }
// })

// const sendPdf = (async (req, res) => {
//     // const { email } = req.body.detail.email;
//     // console.log("****************@@",req.body.detail)
//     // console.log("usere klwfh*********",req.body.detail)
//     res.send(req.file);
//     // let data = await User.findOne({ email });
//     // try {
//     //     if (data) {
//     //         let code = `<a href=${process.env.RESET_PATH}${data.email}">Click to reset password</a>`
//     //         SendMail.sendMail(email, code, data.firstName);
//     //         let detail = { 'detail': 'reset link is generated please check your e-mail' };
//     //         res.status(200).send(detail);
//     //     } else {
//     //         let detail = { 'detail': 'unauthenticated user or user not found' };
//     //         res.status(400).send(detail);
//     //     }
//     // } catch (error) {
//     //     res.send(error.message);
//     // }
// })


module.exports = {
    userRegister,
    loginUser,
    resetPasswordLink,
    resetPassword,
    getTheUser,
    updateUserPassword,
    deleteUser,
    updateProfile,
    addOrgToProfile,
    // file
};