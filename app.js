const express = require('express')
const app = express()

// -----------  routes --------------
const routes = require('./routes/routes')

// ----------- ejs view engine -----------
app.set('view engine', 'ejs')

app.use(express.urlencoded({ extended: false }))
app.use(express.static('./static'))
app.use(routes)

app.listen(8008)