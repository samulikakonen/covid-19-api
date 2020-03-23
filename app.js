const express = require('express')
const fetch = require('node-fetch')
const $ = require('cheerio')
const moment = require('moment')
const PDFDocument = require('pdfkit')

const fetchInfections = async () => {
  const regex = /yhteensä\s(\d*)\slaboratoriovarmistettua/i
  const htmlContent = await fetch(
    'https://thl.fi/fi/web/infektiotaudit-ja-rokotukset/ajankohtaista/ajankohtaista-koronaviruksesta-covid-19/tilannekatsaus-koronaviruksesta'
  )

  return $('[data-analytics-asset-id="5700416"]', await htmlContent.text())
    .text()
    .match(regex)[1]
}

const app = express()
app.set('view engine', 'ejs')

const port = process.env.PORT || 8080
app.use(express.static(__dirname + '/public'))

app.get('/', async (req, res) => {
  res.render('index', { root: __dirname, infected: await fetchInfections() })
})

app.get('/api', (req, res) => {
  res.render('api', { root: __dirname })
})

app.get('/api/infections', async (req, res) => {
  res.json({
    infected: await fetchInfections()
  })
})

app.get('/api/infections/report', async (req, res) => {
  const infected = await fetchInfections()
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

app.get('*', (req, res) => {
  res.redirect('/')
})

app.listen(port, () => {
  console.log('Server running on port ' + port)
})
