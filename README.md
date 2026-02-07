# Friendship Quiz - Google Sheets Responses

This project can save quiz answers to a Google Sheet using a free Apps Script web app.

## 1) Create the Google Sheet

1. Create a new Google Sheet.
2. Rename the first tab to `Responses` (optional but recommended).

## 2) Add the Apps Script

1. In the Sheet, go to **Extensions → Apps Script**.
2. Replace the default code with this:

```javascript
function doPost(e) {
  const data = JSON.parse(e.postData.contents || "{}");
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Responses") || ss.getSheets()[0];

  const headers = ["Timestamp", "Name"];
  const questionHeaders = (data.questions || []).map((_, i) => `Q${i + 1}`);
  const expectedHeaders = headers.concat(questionHeaders);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(expectedHeaders);
  }

  const row = [
    new Date(),
    data.name || "",
    ...(data.answers || []),
  ];

  sheet.appendRow(row);

  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok" }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", "*");
}
```

## 3) Deploy as a Web App

1. Click **Deploy → New deployment**.
2. Select **Web app**.
3. Set **Execute as** to *Me*.
4. Set **Who has access** to *Anyone*.
5. Click **Deploy** and copy the **Web app URL**.

## 4) Add the Web App URL

1. Open `script.js`.
2. Replace this line:

```javascript
const SHEET_WEBAPP_URL = "PASTE_YOUR_SCRIPT_URL_HERE";
```

with your copied URL.

## 5) Publish to GitHub Pages

After this, every submission will append a new row in your Sheet.
