import nodemailer from "nodemailer";
import dotenv from "dotenv"
dotenv.config();

const sendmail = async(userEmail,token)=>{

    const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_HOST,
        port: process.env.MAILTRAP_PORT,
        secure: false, // true for port 465, false for other ports
        auth: {
          user: process.env.MAILTRAP_USERNAME,
          pass: process.env.MAILTRAP_PASSWORD,
        },
      });

const mailOptions = {
    from: process.env.MAILTRAP_SENDEREMAIL, // sender address
    to:userEmail, // list of receivers
    subject: "verify your email", // Subject line
    text: `Please click on the following link: 
    ${process.env.BASE_URL}/api/v1/users/verify ${token}`, // plain text body


    // html: "<b>Hello world?</b>", // html body
  };
     
  await transporter.sendMail(mailOptions);

  console.log("email send successfully")

}

export default (sendmail);

