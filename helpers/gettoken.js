const google = require('googleapis')
const googleAuth = require('google-auth-library')
const fs = require('fs')

/* GMAIL API */
module.exports = {

  getAuth: function(cb) {
    fs.readFile('./client_secret.json', (err, data)=> {
      if(err) {
        return cb(err)
      } else {
        let credentials = JSON.parse(data),
            clientSecret = credentials.web.client_secret,
            clientId = credentials.web.client_id,
            redirectUrl = credentials.web.redirect_uris[0],
            auth = new googleAuth(),
            oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl)
        return cb(null, oauth2Client)
      }
    })
  }
}
