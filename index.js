'use strict'

require('dotenv').config()

const express     = require('express'),
      app         = express(),
      server      = require('http').createServer(app),
      bodyParser  = require('body-parser'),
      cors        = require('cors'),
      path        = require('path');

app.use(require('morgan')('dev'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())

app.set('views', path.join(__dirname, "views"));



app.use('/', require('./routes/index'))
app.use('/resources',express.static('./resources'))

const host = process.env.host || '0.0.0.0'
const port = process.env.port || 3000

server.listen(port, host, () => {
  console.log(`Express server available at http://${host}:${port}`)
})
