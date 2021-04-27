const invoice = require("../models/Invoice")
var fs = require('fs');
require("dotenv").config();

var html_to_pdf = require('html-pdf-node');
const { sendMail } = require("../SendMail");
const { eMail } = require("../SendMail");

let options = { format: 'A4' };



//add invoice 
exports.addInvoice = async (req, res) => {
    try {
        const createdBy = req.body.detail.id;
        // return res.send(req.body)
        const body = { ...req.body, createdBy };
        delete body.id
        const invoiceData = invoice(body)
        const data = await invoiceData.save()
        res.status(200).json(`invoice id is:${data._id}`)
    } catch (err) {
        res.status(400).send(err.message)
    }
}

//show invoices for logged  user
exports.showInvoice = async (req, res) => {
    try {
        const { limit, skip } = req.query
        const userId = req.body.detail.id
        let data = await invoice.find({ createdBy: userId }).limit(parseInt(limit)).skip(parseInt(skip)).populate("from").populate("to")
        const totalDoc = await invoice.find({ createdBy: userId }).countDocuments()
        data.map(x => { delete x.from._doc.password, delete x.to._doc.password })

        res.json({ count: totalDoc, results: data })
    } catch (err) {
        res.status(400).json(err)
    }

}

//update the invoice
exports.updateInvoice = async (req, res) => {
    try {
        const invoiceId = req.params.id
        const { status, from, items, dueDate } = req.body
        const invoiceData = await invoice.find({ _id: invoiceId })
        if (invoiceData) {
            await invoice.updateMany({ "_id": invoiceId }, { $set: { "status": status, "from": from, "items": items, "dueDate": dueDate } })
            return res.json("Successfully updated ")

        }
    } catch (err) {
        res.status(400).json(err)
    }


}

//delete the invoice
exports.deleteInvoice = async (req, res) => {
    const invoiceId = req.params.id
    await invoice.deleteOne({ _id: invoiceId })
    res.json("Successfully deleted!")
}


exports.getInvoice = async (req, res) => {

    const id = req.params.id
    const data = await invoice.findOne({ _id: id }).populate("from").populate("to")
    res.render("../views/invoice/index", { data })
}

let email = require("../SendMail")
const stream = require("stream")
const { Readable } = require('stream');
exports.getPdf = async (req, res) => {

    const id = req.params.id
    const data = await invoice.findOne({ _id: id }).populate("from").populate("to")
    // res.send(data.companyName)
    let file = { url: `${process.env.port}/invoice/${id}` };
    // res.writeHead(200, {"Content-Type": "application/pdf"});
    res.set('Content-Type', 'application/pdf');
    res.set("Content-Disposition", `attachment;filename=${data.to.companyName}.pdf`);
    html_to_pdf.generatePdf(file, options).then(output => {
        // email("praneetnegi01@gmail.com","hello this is email",output)
        let stream = Readable.from(output);
        stream.pipe(res);
        // fs.writeFile(`${data.to.companyName}_invoice.pdf`, output, function (err) {
        //     if (err) throw err;
        //     return res.send("Pdf downloaded Successfully Please Check your file System!")

        // });
        //     // console.log("PDF Buffer:-", output
    })

}



//send mail
exports.mail = async (req, res) => {

    const id = req.params.id
    const data = await invoice.findOne({ _id: id }).populate("from").populate("to")
    // res.send(data.companyName)
    let file = { url: `${process.env.port}/invoice/${id}` };
    // res.writeHead(200, {"Content-Type": "application/pdf"});
    // res.set('Content-Type', 'application/pdf');
    // res.set("Content-Disposition", `attachment;filename=${data.to.companyName}.pdf`);
    html_to_pdf.generatePdf(file, options).then(output => {
        email("praneetnegi01@gmail.com", `${data.to.companyName}.pdf`, output)
        res.json("Mail sent successfully")

        // fs.writeFile(`${data.to.companyName}_invoice.pdf`, output, function (err) {
        //     if (err) throw err;
        //     return res.send("Pdf downloaded Successfully Please Check your file System!")

        // });
        //     // console.log("PDF Buffer:-", output
    })

}




//2021-04-06 06:26:33.174Z date format . You have to give from and to field
exports.getAllInvoiceData = async (req, res) => {
    // res.send("HEllo")
    const { from, to } = req.body
    try {
        const allData = await invoice.find({
            createdAt: {
                $gte: new Date(from),
                $lte: new Date(to)
            }
        })
        res.json(allData)
    } catch (err) {
        res.send(err.message)
    }


}


