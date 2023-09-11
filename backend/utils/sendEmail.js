const nodemailer = require("nodemailer");

function generateOTP() {
  // Declare a digits variable
  // which stores all digits
  const digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < 4; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
}

module.exports = async (email, subject, text) => {
  const otp = generateOTP(); // Generate the OTP when sending the email

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "mohdmustafa17061@gmail.com",
        pass: "liamdzpnxsfecyrf",
      },
    });

    const mailOptions = {
      from: "mohdmustafa17061@gmail.com",
      to: email,
      subject: "OTP(OneTimePassword)",
      text: `To verify your account, please enter "${otp}" as your OneTimePassword in our site`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    return otp; // Return the OTP value so it can be used in other parts of the application if needed
  } catch (error) {
    console.log("Email sending error: " + error);
    throw error; // Rethrow the error to handle it in the calling function if needed
  }
};
