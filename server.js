const express = require('express')
const CronJob = require('cron').CronJob
const cors = require('cors')
const kue = require('kue')
const port = 3000 || process.env.PORT
const gmailAuth = require('./helpers/gettoken')
const sendMail = require('./helpers/sendmail')
const fs = require('fs')

const app = express()

/* App config */
app.use(cors())

/* App Routes */
app.get('/g/mail/auth', (req, res)=> {

  gmailAuth.getAuth((err, auth)=> {
    let authUrl = auth.generateAuthUrl({
      access_type: 'offline',
      scope: 'https://www.googleapis.com/auth/gmail.send'
    })
    if(err) {
      console.log('error : ', err)
    } else {
      res.redirect(authUrl)
    }
  })
})

/* Gmail API callback */
app.get('/g/mail', (req,res)=> {

  gmailAuth.getAuth((err, auth)=> {
    if(err) {
      console.log('error at getAuth : ', err)
    } else {
      auth.getToken(req.query.code, (error, token)=> {
        if(error) {
          console.log('error at getToken : ', error)
          res.send(error)
        } else {
          let file = 'gmail-credentials.json'
          fs.writeFile(file, JSON.stringify(token))
          console.log('Created credential file in : ', file)
          res.send('Get token completed')
        }
      })
    }
  })
})

let queue = kue.createQueue()

new CronJob('*/5 * 11 11 3 *', ()=> {

}, ()=> {

}, true, 'Asia/Jakarta')


/* Port Listen */
app.listen(port)
console.log(`* Listening to port : ${port} *`)