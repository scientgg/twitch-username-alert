require("dotenv").config()
const axios = require("axios");
const format = require("date-fns/format");
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: /true/i.test(process.env.MAIL_SECURE),
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});
/**
 * Console.log com data e hora
 * @param  {...any} args 
 * @returns 
 */
const log = (...args) => console.log(`${format(new Date(), "dd/MM/yyyy - HH:mm:ss")} //`, ...args);
/**
 * Envia um e-mail para o administrador
 * @param {String} subject Assunto do e-mail
 * @param {String} text Conteúdo do e-mail
 */
const mailAdmin = (subject, text) => {
    transporter.sendMail({
        to: process.env.MAIL_ADMIN,
        from: process.env.MAIL_SENDER,
        subject,
        text,
        html: `<p>${text.replace(/(\n|\r|\t)/, "<br />")}</p>`,
    })
        .then(response => {
            if (response.accepted.length) return log(`E-mail "${subject}" enviado com sucesso!`);
        })
        .catch(log);
}
mailAdmin("Iniciando servidor 🖥️✔️", "Servidor iniciado com sucesso!");
let checkTimeout;
(function usrChk() {
    axios(`https://passport.twitch.tv/usernames/${process.env.USERNAME_CHECK}`)
        .then(chk => {
            if (chk.status === 204) {
                log("Disponivel");
                clearTimeout(checkTimeout);
                mailAdmin("Nome disponível ✔️", "O nome que busca já encontra-se disponível. Corra antes que seja tarde.");
            } else if (chk.status === 200) {
                log("Não disponivel");
            } else {
                log("Tente novamente mais tarde");
            }
        })
        .catch((err) => {
            log(err);
            mailAdmin("Erro no servidor ❌", "Um erro foi encontrado, confira os logs no servidor.");
        });
    checkTimeout = setTimeout(usrChk, 60000 * 30);
})();