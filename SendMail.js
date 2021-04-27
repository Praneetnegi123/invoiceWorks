const nodemailer = require('nodemailer');
var smtpTransport = require("nodemailer-smtp-transport");
// const user = require("../modal/userDB");


/********* send the reset password link to mail *********/
const sendMail = (email, code, name) => {
  console.log('Credentials obtained, sending message...');
  // Create a SMTP transporter object
  let transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.email",
    port: 587,
    secure: false,
    auth: {
      user: "keymouseitashwini@gmail.com",
      pass: "keymouseit@225"
    }
  });

  // Message object
  let message = {
    from: 'Sender Name <keymouseitashwini@gmail.com>',
    to: email,
    subject: 'verification of email',
    text: code,
    html: '<p><b>Hello </b>' + name + ' ' + code + '</p>'
  };

  transporter.sendMail(message, (err, info) => {
    if (err) {
      console.log('Error occurred. ' + err.message);
      return process.exit(1);
    }

    console.log('Message sent: %s', info.messageId);
    // Preview only available when sending through an Ethereal account
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  });
}




let eMail = (email, filename, b) => {
  var transporter = nodemailer.createTransport(
    smtpTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      auth: {
        user: "praneetn47@gmail.com",
        pass: "prateek@123Praneet",
      },
    })
  );

  var mailOptions = {
    from: "praneetn47@gmail.com",
    to: `${email}`,
    subject: "verify",
    text: `invoice pdf`,
    attachments: [{
      filename: filename,
      content: b,
      contentType: 'application/pdf'
    }]
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};
//! nodemailer end`

// eMail("praneetnegi01@gmail.com", "check")


module.exports = { sendMail, eMail };
