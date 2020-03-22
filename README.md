# covid-19-api
Simple API for retrieving number of infected people in Finland

Fetches number from: https://thl.fi/fi/web/infektiotaudit-ja-rokotukset/ajankohtaista/ajankohtaista-koronaviruksesta-covid-19/tilannekatsaus-koronaviruksesta

External libraries used:
 - express as web framework
 - pdfkit for PDF creation
 - moment for date formatting
 - cheerio to extract data from retrieved html file

## API Calls: 
### GET /infections
```
localhost:3000/infections
```
Response:
```
{
  infected: <NUMBER>
}
```
* Return number of infected people in Finland
### GET /infections/report
```
localhost:3000/infections/report
```
* Generates pdf report with number of infected people
