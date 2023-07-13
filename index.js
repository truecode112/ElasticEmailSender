const express = require('express')
const cors = require('cors')
const bodyParser = require("body-parser");
require('dotenv').config()
const ElasticEmail = require('@elasticemail/elasticemail-client');

let defaultClient = ElasticEmail.ApiClient.instance;

let apikey = defaultClient.authentications['apikey'];
apikey.apiKey = process.env.ELASTIC_EMAIL_API_KEY;

let api = new ElasticEmail.EmailsApi()

const port = 8456;

const app = express(); // create an instance of express

app.use(express.json())
app.use(bodyParser.json());
app.use(cors())
app.use(express.urlencoded({ extended: true }))

const router = express.Router()

router.post('/sendmail', (req, res) => {
  console.log('sendmail >>>', req.body);
  const from = req.body.from;
  const to = req.body.to;
  const subject = req.body.subject;
  const message = req.body.message;
  const name = req.body.name;

  let email = ElasticEmail.EmailMessageData.constructFromObject({
    Recipients: [
      new ElasticEmail.EmailRecipient(to)
    ],
    Content: {
      Body: [
        ElasticEmail.BodyPart.constructFromObject({
          ContentType: "HTML",
          Content: message
        })
      ],
      Subject: subject,
      From: "Sender Email",
      Name: name,
    }
  });
  var callback = function(error, data, response) {
    if (error) {
      console.error(error);
      res.status(200).json({
        status: "fail",
        message: error
      })
    } else {
      res.status(200).json({
        status: "success"
      })
      console.log('API called successfully.');
    }
  };
  api.emailsPost(email, callback);
});

router.get('/healthcheck', (req, res, next) => {
  res.status(200).json({
    status: "success"
  });
})

app.use('/', router)
app.listen(port, () => {
  console.log(`connected on port ${port}`)
})
module.exports = app
