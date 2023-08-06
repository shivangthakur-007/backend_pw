import nodemailer from 'nodemailer'

// async await is not allowed in global scope, must be a wrapper
const sendemail = async function (email, subject, message){
    // create reusable transporter object using the default smtp transport
    let transporter= nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false, //true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USERNAME,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    // send email with defined transport object
    await transporter.sendMail({
        from: process.env.SMTP_FROM_MAIL,
        to: email, // user email
        subject: subject,  // Subject the
        html: message,  // html body
    })
    
};

export default sendemail