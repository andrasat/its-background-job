const express = require('express')
const CronJob = require('cron').CronJob
const cors = require('cors')
const kue = require('kue')
const port = 3000 || process.env.PORT
const gmailAuth = require('./helpers/gettoken')
const sendMail = require('./helpers/sendmail').sendMail
const fs = require('fs')

const app = express()
const queue = kue.createQueue()

/* App config */
app.use(cors())

/* Gmail API Get Authorization Url */
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

let emails = [
  {email: 'anthonyjuan95@gmail.com'},
  {email: 'andra.satria1@gmail.com'},
  {email: 'laksono.suryadi@gmail.com'}
]

/* Cron Job */
app.get('/g/mail/cron', (req, res)=> {

  new CronJob('*/10 * * 11 3 *', ()=> {

    let job = queue.create('sender', emails).save((err)=> {
      !err ? console.log('Job created: '+job.id) : console.log('Job failed')
    })
    queue.process('sender', (job, done)=> {
      sender(job.data, done)
      console.log('CronJob working on background')
    })

  }, null, true, 'Asia/Jakarta')
})


function sender(mailist, done) {
  if(!mailist) {
    return done(new Error('No email address provided'))
  } else {
    gmailAuth.getAuth((err, auth)=> {
      fs.readFile('gmail-credentials.json', (err, token)=> {
        if(err) {
          console.log('Error reading gmail-credentials')
        } else {
          auth.credentials = JSON.parse(token)

          mailist.forEach((data)=> {
            sendMail(auth, data.email, (err, result)=> {
              if(err) {
                console.log('Error sending mail : ', err)
              } else {
                console.log('Email sent to :'+data.email)
              }
            })
          })
        }
      })
    })
    done()
  }
}


/* Port Listen */
app.listen(port)
console.log(`* Listening to port : ${port} *`)