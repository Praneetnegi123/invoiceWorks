require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Organization = require("../models/Organization");
const User = require("../models/User");
const SendMail = require('../SendMail');
const fs = require("fs");

/***********  generate token   **********/
const generateAccessToken = (id) => {
    return jwt.sign({ id }, `${process.env.JWT_SECRET_KEY}`);
};

/*********** hashing using bcrypt  **********/
const hashing = async (password, salt) => {
    const hash = await bcrypt.hash(password, salt);
    return hash;
}

/************* register user   ****************/
const orgRegister = async (req, res) => {
    try {
        const { email, password, confirmPassword } = req.body;
        const user = await Organization.findOne({ email: email });
        if (password !== confirmPassword) {
            const detail = "password and confirm password must be same";
            res.status(400).send({ detail });
        } else {
            const salt = 10;
            let hash = await hashing(password, salt);
            hash = String(hash);
            if (!user) {
                const data = await Organization({ ...req.body, password: hash });
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


/************* get the detail of the org user  **********/
const getTheOrg = (async (req, res) => {
    const id = req.body.detail._id;
    try {
        if (req.body.detail) {
            delete req.body.detail._doc.password;
            res.send(req.body.detail);
        } else {
            const detail = "not found";
            res.status(400).send({ detail });
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
})

/***************** all the organization detail  *********/
const getAllTheOrg = (async (req, res) => {
    const id = req.body.id;
    const data = await Organization.find();
    try {
        if (data) {
            const detail = data.map(x => { return { "id": x._id, "name": x.companyName } })
            // delete data._doc.password;
            res.send(detail);
        } else {
            const detail = "not found";
            res.status(400).send({ detail });
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
})

/****************** login organization  ************/
const loginOrg = (async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!req.user.Detail) {
            if (req.user.email) {
                let token = generateAccessToken(req.user._id);
                delete req.user._doc.password;
                res.json({ ...req.user._doc, token });
            } else {
                const detail = "unauthenticated user";
                res.status(401).send({ detail });
            }
        } else {
            res.send(req.user);
        }
    } catch (error) {
        res.status(400).send(error.message);
    }

})


/************ forgot password link generate to reset password  ****************/
const resetPasswordLink = (async (req, res) => {
    let { email } = req.body;
    let data = await Organization.findOne({ email });
    try {
        if (data) {

            let code = `<a href=${process.env.ORG_RESET_PATH}${data.email}">Click to reset password</a>`
            SendMail.sendMail(email, code, data.companyName);
            const detail = 'reset link is generated please check your mail';
            res.status(200).send({ detail });
        } else {
            const detail = 'user not found';
            res.status(404).send({ detail });
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
})



/**************** request for the reset password ***********/
const resetPassword = (async (req, res) => {
    let email = req.query.email;
    let { password, rePassword } = req.body;
    let data = await Organization.findOne({ email });
    try {
        if (data) {
            if (password === rePassword) {
                let salt = 10;
                rePassword = String(rePassword)
                let hash = await hashing(rePassword, salt);
                password = String(hash);
                let data = await Organization.findOneAndUpdate({ email: email }, { $set: { password: password } })
                if (data) {
                    let code = "Successfully updated your password";
                    await SendMail.sendMail(email, code, data.firstName);
                    let token = generateAccessToken(data._id);
                    delete data._doc.password;
                    res.status(200).send({ ...data._doc, token })
                }
                else {
                    const detail = 'user not found';
                    res.status(404).send({ detail })
                }
            } else {
                const detail = 'password and repeat password must be equal';
                res.status(409).send({ detail });
            }
        } else {
            const detail = 'user not find';
            res.status(404).send({ detail })
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
})


/**************** update orgPassword  *****************/
const updateOrgPassword = (async (req, res) => {
    const { password, newPassword } = req.body;
    const id = req.body.detail.id;
    const userPassword = req.body.detail.password;
    try {
        if (id) {
            const salt = 10;
            let hash = await hashing(newPassword, salt);
            const passwordValidate = await bcrypt.compare(password, userPassword);
            if (passwordValidate) {
                const data = await Organization.findOneAndUpdate({ _id: id }, { $set: { password: hash } });
                delete data._doc.password;
                res.status(200).json(data);
            } else {
                const detail = "user name and password does not match";
                res.status(400).send({ detail })
            }
        } else {
            const detail = "user not found";
            res.status(404).send({ detail })
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
})

/******************* update user profile  **************/
const updateOrgProfile = (async (req, res) => {
    const id = req.body.detail._id;
    try {
        if (id) {
            const updateData = req.body;
            const user = await Organization.findByIdAndUpdate({ _id: id }, updateData);
            delete user._doc.password;
            res.status(200).json(user);

        } else {
            const detail = "user not found";
            res.status(404).send({ detail })
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
})


/**************** delete account *************/
const deleteAccount = (async (req, res) => {
    const { password } = req.body;
    const id = req.body.detail._id;
    const userPassword = req.body.detail.password
    try {
        if (id) {
            if (req.body.detail) {
                const passwordValidate = await bcrypt.compare(password, userPassword);
                if (!passwordValidate) {
                    const detail = "password does not match";
                    res.status(400).send({ detail })
                } else {
                    const user = await Organization.findOneAndDelete({ _id: id });
                    delete user._doc.password;
                    res.status(200).json(user);
                }
            } else {
                const detail = "user not found";
                res.status(404).send({ detail })
            }
        } else {
            const detail = "unauthenticated user";
            res.status(401).send({ detail })
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
})

/************************** image upload   ****************/
const uploadImage = (async (req, res) => {
    try {
        let x = base64_encode(`${process.env.PATHS}${req.file.path}`);
        res.status(200).send(x);
    } catch (error) {
        res.status(400).send(error.message);
    }
})

/****************** image upload  **************/
function base64_encode(file) {
    var bitmap = fs.readFileSync(file);
    return new Buffer.from(bitmap).toString('base64');
}


/****************** filter wise date  ********************/
const filterWiseDate = (async (req, res) => {
    try {
        const { dateOne, dateTwo } = req.body;
        if (dateOne !== "", dateTwo !== "") {
            const data = await User.find({ createdAt: { $gte: new Date(dateOne), $lte: new Date(dateTwo) } });
            data.map(x => delete x._doc.password);
            res.status(200).send(data);
        } else {
            const detail = "range between the date are required";
            res.status(400).send({ detail });
        }
    } catch (error) {
        res.status(400).send(error.message);
    }

})

module.exports = {
    orgRegister,
    getTheOrg,
    getAllTheOrg,
    loginOrg,
    resetPassword,
    resetPasswordLink,
    updateOrgPassword,
    updateOrgProfile,
    deleteAccount,
    uploadImage,
    filterWiseDate
};