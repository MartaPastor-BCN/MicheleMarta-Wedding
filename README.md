# Michele & Marta — Wedding Website

Official wedding website for **Michele & Marta**, 19 September 2026, Acireale (Sicily), Italy.

Live static site: `index.html` (+ `app.js`, `i18n.js`, `assets/`). No build step required — it's plain HTML/CSS/JS, mobile-first, with a 4-language switcher (Italiano, English, Español, Català).

## Structure
- `index.html` — all sections (Home, RSVP, Programma, Location, La nostra storia, Sicilia, Viaggio di nozze, FAQ, Contatti)
- `app.js` — countdown, mobile nav, scroll reveal, FAQ accordion, IBAN reveal/copy, RSVP form logic
- `i18n.js` — all translated strings (IT/EN/ES/CA)
- `assets/` — reference/design images (invitation card, palette, hero frame, Acireale view, rings)

## RSVP data flow (to finish before launch)
The RSVP form currently posts to a placeholder in `app.js`:

```js
const RSVP_ENDPOINT = ''; // paste your Power Automate HTTP trigger URL here
```

Recommended Microsoft-native setup:
1. Create `Michele_Marta_Wedding_RSVP_2026.xlsx` in OneDrive, with a table named `RSVP_Responses`, columns matching the form fields.
2. Share the file **only** with `martapastorhernandez@gmail.com` and `michelespina89@gmail.com` (no public link).
3. Build a Power Automate flow: **"When an HTTP request is received"** → **"Add a row into a table"** (Excel Online, OneDrive) → **"Send an email"** to both addresses with the submitted details.
4. Paste the flow's HTTP POST URL into `RSVP_ENDPOINT` in `app.js`.

Until this is wired up, submissions only log to the browser console (no data is lost silently — nothing is sent anywhere insecure).

## Still to fill in (search for `TODO`/placeholders)
- RSVP deadline: currently set to **31 July 2026** — update in `index.html`, `i18n.js`, and FAQ answers if it changes.
- Dress code: currently a general "Mediterranean summer elegant" suggestion — refine if desired.
- Google Maps links for the Basilica and Casa delle Terre Forti (currently generic search links).
- IBAN / account holder / BIC for the honeymoon fund.
- Accommodation suggestions, transfer details, children policy.

## Local preview
Just open `index.html` in a browser, or serve locally:

```powershell
cd Michele-Marta-Wedding-Website
python -m http.server 8080
# then visit http://localhost:8080
```
