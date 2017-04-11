const google = require('googleapis')
const googleAuth = require('google-auth-library')

module.exports = {

  sendMail : function(auth, data, cb) {
    let gmailClass = google.gmail('v1')

    let mails = []

    mails.push('From: "Thank you for buying" <andra.satria1@gmail.com>')
    mails.push(`To: ${data}`)
    mails.push('Content-type: text/html;charset=iso-8859-1')
    mails.push('MIME-Version: 1.0')
    mails.push('Subject: Your checkout list')
    mails.push('')
    mails.push('Get Discount up to 50% to our exclusive item !')

    let email = mails.join('\r\n').trim(),
        base64 = new Buffer(email).toString('base64')
    base64 = base64.replace(/\+/g, '-').replace(/\//g, '_')

    gmailClass.users.messages.send({
      auth: auth,
      userId: 'me',
      resource: {
        raw: base64
      }
    }, cb())
  }
}