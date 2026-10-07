[README 8.md](https://github.com/user-attachments/files/33160354/README.8.md)
# Sallee Shop Board

Display board for the shop TV: **Safety Inspections · In the Shop · Scheduled**.

**How it works:** opens with a short wrench intro → Microsoft 365 sign-in → the board reads
`shop.xlsx` (table `Table1`) straight from SharePoint every 60 seconds. Only people who can open
the file in SharePoint can see the board. No Power Automate flow or GitHub token needed.
If `config.js` has no `clientId`, it runs in **demo mode** from `data/shop.json` (no sign-in).

Live at: https://canumanu.github.io/Sallee-shop-board/

## Files in the repo
| File | What it is |
|---|---|
| `index.html` | The board, intro screen and sign-in screen |
| `config.js` | Settings: app ID, tenant, link to shop.xlsx, table name |
| `msal-browser.min.js` + `msal-LICENSE.txt` | Microsoft's sign-in library (same version as the event calendar) |
| `manifest.webmanifest` + `icon-*.png`, `apple-touch-icon.png`, `favicon-32.png` | Makes it installable as an app with the wrench icon |
| `data/shop.json` | Demo-mode data (old flow output). Can stay. |

## Go-live steps
1. **Upload** all the files above to the repo root (replace `index.html`; keep `data/shop.json`).
   The board keeps working in demo mode until step 4.
2. **App registration** at entra.microsoft.com → App registrations → **New registration**
   - Name: `Sallee Shop Board` · Accounts in this organizational directory only
   - Redirect URI: platform **Single-page application (SPA)** → `https://canumanu.github.io/Sallee-shop-board/`
   - After creating: **Authentication** → add a second SPA URI `https://canumanu.github.io/Sallee-shop-board/index.html`
   - **API permissions** → Add → Microsoft Graph → **Delegated** → `Files.Read.All` (User.Read is already there)
     → **Grant admin consent for Sallee Horse Vans**
   - Copy the **Application (client) ID** from Overview.
3. **Link to shop.xlsx**: in SharePoint, select the file → **ⓘ Details** → copy **Path**
   (or open the file's menu → Copy link, set to *People in Sallee Horse Vans*).
4. **Edit `config.js`** in the repo: paste the client ID into `clientId` and the link into `fileUrl`.
   `tenantId` is already filled in. Commit.
5. **Test**: open the board → intro → Sign in → board shows "Live from SharePoint" in the footer.
6. **Shop TV**: sign in once with an account that can open shop.xlsx. Using Edge signed in with that
   Sallee account keeps it signed in. If the sign-in ever lapses, the board shows the sign-in screen.
7. **Turn off "shop flow"** in Power Automate once step 5 works. It's no longer needed, and neither is its GitHub token.

## Install as an app (taskbar icon)
- **Edge:** open the board → **⋯** menu → **Apps** → **Install this site as an app** → then right-click its taskbar icon → **Pin to taskbar**.
- **Chrome:** click the install icon at the right of the address bar (or **⋮** → **Cast, save and share** → **Install page as app**).
- The installed app opens in its own window with the wrench icon. Press **F11** for full screen on the TV.

## Who can see it
Anyone in Sallee who can open `shop.xlsx` in SharePoint. To give or remove access, change who has access to
the file (or the site it's in). If someone signs in without access, the board says so.
If you **move shop.xlsx**, update `fileUrl` in `config.js` with the new link.

## The table (`Table1`)
| Column | Values | Used for |
|---|---|---|
| UNIT | VAN 112, TRL 44, FLEET… | Big title on the card |
| JOB | free text | What's being done |
| TYPE | SAFETY (also accepts ROUTINE, SAFETY INSPECTION, INSPECTION) / ONGOING / SCHEDULED | Picks the column. Anything unrecognised goes to Scheduled |
| FREQUENCY | DAILY / WEEKLY / MONTHLY / QUARTERLY / YEARLY | Safety inspections only |
| STATUS | IN PROGRESS / WAITING ON PARTS / ON HOLD / DONE | Color: blue / amber / amber / green |
| MECHANIC | name | "Tech" |
| LOCATION | blank or `In house` = shop; anything else = outside | Shows "OUT @ Cummins" |
| START | date | In-shop day count; scheduled date |
| DUE | date | Overdue / due today / due tomorrow flags; inspection "Next" |
| COMPLETED | date | Done jobs stay on "In the shop" only for that day |
| PRIORITY | HIGH / NORMAL / LOW | Red chip on scheduled jobs when HIGH/URGENT |
| NOTES | free text | Italic line under the card |

DONE safety inspections stay visible (dimmed) until you roll the DUE date forward to the next inspection.
Dates can be typed as 2026-10-09 or 10/9/2026; both work. Column names can be any capitalisation.


## Board behaviour
- Overdue = red, due today/tomorrow = amber. Scheduled shows the next 30 days, grouped by day.
- Long columns scroll continuously; speed is `SPEED_VH_PER_SEC` in index.html (default 2.5). Columns that fit stay still.
- The intro plays each time the board opens (tap to skip). It's skipped right after returning from the Microsoft sign-in.
- The page reloads itself at 3 AM so the TV picks up any board updates.

## Troubleshooting
- **Sign-in screen keeps coming back:** the account's sign-in expired. Sign in again; on the TV use Edge signed in with that Sallee account.
- **"this account doesn't have access to the shop file":** give that account access to shop.xlsx (or its site).
- **"shop file or table not found":** `fileUrl` is wrong or the file moved, or the table isn't named `Table1`.
- **Error mentioning redirect URI (AADSTS50011):** the board's address isn't in the app registration's SPA redirect URIs (step 2).
- **Error mentioning consent (AADSTS65001):** admin consent wasn't granted for Files.Read.All (step 2).
- **Board URL 404:** the page must be named exactly `index.html` at the repo root. Pages takes 1–2 minutes after a commit; Ctrl+F5.
