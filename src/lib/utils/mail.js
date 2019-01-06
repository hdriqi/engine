import nodemailer from 'nodemailer'

/**
 * 
 * @param {*} mailOptions 
 */
const send = (mailOptions) => {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
			host: 'smtp.zoho.com',
			port: 465,
			secure: true,
			auth: {
				user: process.env.EMAIL_USERNAME,
				pass: process.env.EMAIL_PASSWORD
			}
    })

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        reject(error)
      }
      else{
        resolve(true)
      }
    })
  })
}

export default {
	send
}