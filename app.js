const express = require('express')
const fetch = require('node-fetch')
const $ = require('cheerio')
const moment = require('moment')
const PDFDocument = require('pdfkit')
const fs = require('fs')

const app = express()

app.get('/infections', (req, res, next) => {
  fetch(
    'https://thl.fi/fi/web/infektiotaudit-ja-rokotukset/ajankohtaista/ajankohtaista-koronaviruksesta-covid-19/tilannekatsaus-koronaviruksesta'
  ).then(response => {
    response.text().then(body => {
      res.json({
        infected: $('b', body)
          .text()
          .split(' ')[2]
      })
    })
  })
})

app.get('/infections/report', (req, res, next) => {
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

app.listen(3000, () => {
  console.log('Server running on port 3000')
})
