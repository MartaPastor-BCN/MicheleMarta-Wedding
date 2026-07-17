/**
 * Michele & Marta — RSVP receiver
 * Deploy as a Web App (Execute as: Me, Who has access: Anyone).
 * Writes each website RSVP submission as a new row in this spreadsheet,
 * and emails both of you on every submission.
 */

// >>> EDIT THESE TWO EMAILS IF NEEDED <<<
var NOTIFY = ["martapastorhernandez@gmail.com", "michelespina89@gmail.com"];

// Columns saved (order matters). Keep in sync with the header row.
var FIELDS = [
  "submittedAt", "language", "fullName", "email", "phone", "attending",
  "guestCount", "guestNames", "arriveDate", "localGuest", "allergyFlag",
  "allergyDetail", "diet", "speech", "speechDetail", "accom", "infoNeeded",
  "carRental", "song", "comments", "consent"
];

var HEADERS = [
  "Timestamp", "Lingua", "Nome e cognome", "Email", "Telefono", "Presenza",
  "N. persone", "Nomi invitati", "Data arrivo", "Di Acireale?", "Allergie?",
  "Dettaglio allergie", "Preferenze alimentari", "Discorso", "Dettaglio discorso",
  "Alloggio >1 notte", "Info Acireale/Sicilia", "Auto a noleggio", "Canzone", "Commenti", "Consenso privacy"
];

function doPost(e) {
  try {
    var data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    // Ensure header row exists
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
      sheet.setFrozenRows(1);
    }

    var row = FIELDS.map(function (f) {
      var v = data[f];
      if (Array.isArray(v)) v = v.join(", ");
      return v == null ? "" : v;
    });
    sheet.appendRow(row);

    // Email notification
    try {
      var subject = "Nuovo RSVP: " + (data.fullName || "(senza nome)");
      var body = "Nuova conferma dal sito Michele & Marta\n\n" +
        "Nome: " + (data.fullName || "") + "\n" +
        "Presenza: " + (data.attending || "") + "\n" +
        "N. persone: " + (data.guestCount || "") + "\n" +
        "Nomi: " + (data.guestNames || "") + "\n" +
        "Email: " + (data.email || "") + "\n" +
        "Telefono: " + (data.phone || "") + "\n" +
        "Arrivo: " + (data.arriveDate || "") + (data.localGuest ? " (di Acireale)" : "") + "\n" +
        "Allergie: " + (data.allergyFlag || "") + " " + (data.allergyDetail || "") + "\n" +
        "Preferenze: " + (data.diet || "") + "\n" +
        "Discorso: " + (data.speech || "") + " " + (data.speechDetail || "") + "\n" +
        "Alloggio >1 notte: " + (data.accom || "") + "\n" +
        "Info Acireale/Sicilia: " + (data.infoNeeded || "") + "\n" +
        "Auto a noleggio: " + (data.carRental || "") + "\n" +
        "Canzone: " + (data.song || "") + "\n" +
        "Commenti: " + (data.comments || "") + "\n" +
        "Lingua: " + (data.language || "") + "\n" +
        "Data invio: " + (data.submittedAt || "");
      MailApp.sendEmail(NOTIFY.join(","), subject, body);
    } catch (mailErr) {
      // Ignore email errors so the row is still saved
    }

    return ContentService
      .createTextOutput(JSON.stringify({ result: "ok" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", message: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput("Michele & Marta RSVP endpoint is running.");
}
