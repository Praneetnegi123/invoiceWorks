const Tax = require("../models/taxes");

/********** create the tax slab *************/
const addTax = (async (req, res) => {
    const { taxSlab } = req.body;
    try {
        if (req.body.detail) {
            const tax = await Tax.findOne({ taxSlab: taxSlab });
            if (!tax) {
                const data = await Tax(req.body);
                await data.save();
                res.send(data);
            } else {
                const detail = "tax slab already register";
                res.status(400).send({ detail });
            }
        } else {
            const detail = "user not found";
            res.status(404).send({ detail })
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
})

/**************** get all the tax slab *************/
const getTax = (async (req, res) => {
    try {
        if (req.body.detail) {
            const data = await Tax.find();
            if (data) {
                res.send(data);
            } else {
                const detail = "data not found";
                res.status(404).send({ detail });
            }
        } else {
            const detail = "User not found";
            res.status(404).send({ detail });
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
})


/************* update tax ************/
const updateTax = (async (req, res) => {
    const id = req.query._id;
    try {
        if (req.body.detail) {
            const data = await Tax.findOneAndUpdate({ _id: id }, req.body);
            if (data) {
                res.send(data);
            } else {
                const detail = "data not found";
                res.status(404).send({ detail });
            }
        } else {
            const detail = "user not found";
            res.status(404).send({ detail });
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
})

/***************** delete tax ***********/
const deleteTax = (async (req, res) => {
    const id = req.query._id;
    try {
        if (req.body.detail) {
            const data = await Tax.findOneAndDelete({ _id: id });
            if (data) {
                res.send(data);
            } else {
                const detail = "data not found";
                res.status(404).send({ detail });
            }
        } else {
            const detail = "user not found";
            res.status(404).send({ detail });
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
})

module.exports = {
    addTax,
    getTax,
    updateTax,
    deleteTax
};