const Categories = require("../models/Categories");

/************** add categories *********************/
const addCategory = (async (req, res) => {
    const { categoryName, taxSlab } = req.body;
    try {
        if (req.body.detail) {
            const data = await Categories.findOne({ categoryName: categoryName });
            if (!data) {
                const data = await Categories(req.body);
                await data.save();
                res.send(data);
            } else {
                const detail = "data already register";
                res.status(409).send({ detail });
            }

        } else {
            const detail = "User not Found";
            res.status(404).send({ detail });
        }
    } catch (error) {
        res.status(400).send(error.message);
    }

})

/************** display all the categories *******************/
const displayCategory = (async (req, res) => {
    const id = req.query._id;
    try {
        if (req.body.detail) {
            const data = await Categories.find({ _id: id }).populate('tax');
            data.map(x => { return delete x.tax._doc._id })
            res.send(data);
        } else {
            const detail = "user not found";
            res.status(404).send({ detail });
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
})

/*********** update the category ****************/
const updateCategory = (async (req, res) => {
    try {
        const id = req.query._id;
        const { categoryName, taxSlab } = req.body;
        if (req.body.detail) {
            const data = await Categories.findOneAndUpdate({ _id: id }, req.body);
            if (data) {
                delete data._doc.tax;
                res.send(data);
            } else {
                const detail = "Category not found";
                res.status(404).send(detail);
            }
        } else {
            const detail = "User not found";
            res.status(404).send({ detail });
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
})


/******************* delete categories ***************/
const deleteCategory = (async (req, res) => {
    try {
        const id = req.query._id;
        if (req.body.detail) {
            const data = await Categories.findOneAndDelete({ _id: id });
            if (data) {
                delete data._doc.tax;
                res.send(data);
            } else {
                const detail = "Category not found";
                res.status(404).send(detail);
            }
        } else {
            const detail = "User not found";
            res.status(404).send({ detail });
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
})


/******************** display all category ************/
const displayAllCategory = (async (req, res) => {
    try {
        if (req.body.detail) {
            const data = await Categories.find({}).populate('tax');
            const category = data.map(x => { return { id: x._id, categoryName: x.categoryName, tax: x.tax.taxSlab } })
            res.send(category);
        } else {
            const detail = "user not found";
            res.status(404).send({ detail });
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
})


module.exports = {
    addCategory,
    displayCategory,
    updateCategory,
    deleteCategory,
    displayAllCategory
};