/**
 * Safelyhomesf.com — Lead Capture (Google Apps Script)
 *
 * Receives POST JSON from est-ui.js and appends a row to the sheet.
 *
 * HOW TO DEPLOY:
 *   1. Open your Google Sheet (ID: 1-7Qusp6_CJCHL3BynpVwKKpbJz1-fJGdjJk6EwFmETY)
 *   2. Extensions → Apps Script
 *   3. Paste this file, save.
 *   4. Deploy → New deployment → type "Web app"
 *      - Execute as:  Me
 *      - Who has access:  Anyone
 *   5. Copy the /exec URL and paste it back in chat (I'll wire it into est-ui.js).
 *
 * Expected POST body (JSON):
 *   { name, phone, zip, serviceId, answers, est:{low,high}, leadId }
 */

const SHEET_NAME = 'Leads';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.getActiveSheet();

    // header row if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', 'Name', 'Phone', 'ZIP', 'Service', 'Answers', 'Est Low', 'Est High', 'Lead ID']);
    }

    sheet.appendRow([
      new Date(),
      data.name || '',
      data.phone || '',
      data.zip || '',
      data.serviceId || '',
      JSON.stringify(data.answers || {}),
      data.est ? data.est.low : '',
      data.est ? data.est.high : '',
      data.leadId || '',
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
