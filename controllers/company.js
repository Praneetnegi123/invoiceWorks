const company = require("../models/Companies")

exports.addCompany = async (req, res) => {
    try {
        const companyData = company(req.body)
        await companyData.save()
        res.send("Added company")
    } catch (err) {
        res.send(err.message)
    }

}