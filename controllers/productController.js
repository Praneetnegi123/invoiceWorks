const Product = require("../models/Products");


/****************** add product according to the categories ****************/
const addProduct = (async (req, res) => {
    const { productName, category } = req.body;
    if (req.body.detail) {
        const pro = await Product.findOne({ productName: productName })
        if (!pro) {
            const data = await Product(req.body);
            await data.save();
            res.send(data);
        } else {
            if (pro.category != category) {
                const data = await Product(req.body);
                await data.save();
                res.send(data);
            } else {
                const detail = "product is already register in this category";
                res.status(400).send({ detail })
            }
        }
    } else {
        const detail = "User not found";
        res.status(404).send({ detail });
    }
})

/******************** display product ***************/
const displayProduct = (async (req, res) => {
    const id = req.query._id;
    try {
        if (req.body.detail) {
            const data = await Product.findOne({ _id: id }).populate({ path: 'category', populate: { path: 'tax', model: 'tax' } });
            const category = data.category.categoryName;
            const tax = data.category.tax.taxSlab;
            delete data._doc.category;
            res.send({ data, category, tax });
        } else {
            const detail = "User not found";
            res.status(404).send({ detail });
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
})

/**************** update the product ************/
const updateProduct = (async (req, res) => {
    try {
        const id = req.query._id;
        const { productName, category } = req.body;
        if (req.body.detail) {
            const data = await Product.findOneAndUpdate({ _id: id }, req.body);
            if (data) {
                res.send(data);
            } else {
                const detail = "product not found";
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


/************ delete product **************/
const deleteProduct = (async (req, res) => {
    try {
        const id = req.query._id;
        if (req.body.detail) {
            const data = await Product.findOneAndDelete({ _id: id });
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


/**********display all product ***********/
const displayAllProduct = (async (req, res) => {
    const { categoryName, tax } = req.body;
    try {
        if (req.body.detail) {
            const data = await Product.find().populate({ path: 'category', populate: { path: 'tax', model: 'tax' } });
            const product = data.map(x => { return { id: x._id, productName: x.productName, category: x.category.categoryName, tax: x.category.tax.taxSlab } })
            res.send(product);
        } else {
            const detail = "User not found";
            res.status(404).send({ detail });
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
})

module.exports = {
    addProduct,
    displayProduct,
    updateProduct,
    deleteProduct,
    displayAllProduct
}