const express = require('express')
const fetch = require('node-fetch')
const $ = require('cheerio')
const moment = require('moment')
const PDFDocument = require('pdfkit')
const fs = require('fs')

const app = express()

const port = process.env.PORT || 8080
app.use(express.static(__dirname + '/public'))

app.get('/', (req, res) => {
  res.sendFile('public/index.html', { root: __dirname })
})

app.get('/infections', (req, res) => {
  fetch(
    'https://thl.fi/fi/web/infektiotaudit-ja-rokotukset/ajankohtaista/ajankohtaista-koronaviruksesta-covid-19/tilannekatsaus-koronaviruksesta'
  ).then(response => {
    const regex = /yhteensä\s(\d*)\slaboratoriovarmistettua/i
    response
      .text()
      .then(body => {
        res.json({
          infected: $('[data-analytics-asset-id="5700416"]', body)
            .text()
            .match(regex)[1]
        })
      })
      .catch(e => console.log('Unable to retrieve infected amount', e))
  })
})

app.get('/infections/report', (req, res) => {
  fetch(
    'https://thl.fi/fi/web/infektiotaudit-ja-rokotukset/ajankohtaista/ajankohtaista-koronaviruksesta-covid-19/tilannekatsaus-koronaviruksesta'
  )
    .then(response => {
      response.text().then(body => {
        const infected = $('b', body)
          .text()
          .split(' ')[2]
        res.contentType('application/pdf')
        try {
          const doc = new PDFDocument()
          doc.info['Title'] = `Infections: ${moment().format('DD MMM YYYY')}`
          doc.info['Author'] = 'Samuli Kakonen'
          doc.info['Subject'] = 'COVID-19 Infections in Finland'
          doc.pipe(res)
          doc.fontSize(35).text('COVID-19')
          doc
            .fontSize(30)
            .text('Confirmed cases in Finland')
            .moveDown(3)
          doc.fontSize(70).text(`${infected}`)
          doc.end()
        } catch (e) {
          console.log('Unable to create pdf', e)
        }
      })
    })
    .catch(() => console.log('Unable to retrieve data from thl.fi'))
})

app.get('*', (req, res) => {
  res.redirect('/')
})

app.listen(port, () => {
  console.log('Server running on port ' + port)
})
