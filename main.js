require("dotenv").config();
const axios = require("axios");
const format = require("date-fns/format");
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_HOST_PORT,
  secure: /true/i.test(process.env.EMAIL_USE_TLS),
  auth: {
    user: process.env.EMAIL_HOST_USER,
    pass: process.env.EMAIL_HOST_PASSWORD,
  },
});
let checkTimeout = null;
const log = (...args) =>
  console.log(`${format(new Date(), "dd/MM/yyyy - HH:mm:ss")} //`, ...args); // console.log with date and time
/**
 * Send email
 * @param {String} subject Subject of email
 * @param {String} text Text of email
 */
const sendMail = (subject, text) => {
  transporter
    .sendMail({
      to: process.env.EMAIL_ALERT_RECIPIENT, // Your email address
      from: process.env.EMAIL_ALERT_SENDER, // Your email address or other address you want to appear on the email
      subject, // Subject of the email
      text, // Content of the email
      html: `<p>${text.replace(/(\n|\r|\t)/g, "<br />")}</p>`, // Content of the email in HTML
    })
    .then((response) => {
      if (response.accepted.length)
        return log(`Email "${subject}" was sent successfully.`);
    })
    .catch(log);
};
sendMail("Starting server 🖥️✔️", "Server started successfully!"); // Send email to you when server starts
(function usernameChecker() {
  axios(`https://passport.twitch.tv/usernames/${process.env.USERNAME_TO_CHECK}`) // Check if username is available
    .then((chk) => {
      if (chk.status === 204) {
        // If username is available
        clearTimeout(checkTimeout);
        log("Available");
        sendMail(
          "Available ✔️",
          `The name you are looking for is now available.\nRun before it's too late.`
        );
      } else if (chk.status === 200) {
        // If username is not available
        log("Not available yet");
      } else {
        // If something went wrong
        log("Please try again later");
      }
    })
    .catch((err) => {
      log(err);
      sendMail(
        "Server error 🖥️❌",
        `An error prevented the username check from working.\nCheck the logs on the server.`
      );
    });
  checkTimeout = setTimeout(usernameChecker, 30 * 6e4); // 30 minutes
})();
