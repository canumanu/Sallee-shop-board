[README shop.md](https://github.com/user-attachments/files/32684906/README.shop.md)
# Sallee Shop Board

Display-only board for the shop TV. Same pipeline as barn-boards:
**SharePoint Excel table → Power Automate → GitHub (`data/shop.json`) → GitHub Pages.**

## Files
| File | What it is |
|---|---|
| `index.html` | The board. Reads `data/shop.json` every 60 s, auto-scrolls long columns. |
| `data/shop.json` | Written by the flow. Sample data included for testing. |
| `shop.xlsx` | Template for the SharePoint table (`Table1`) with dropdowns. |

## The table (`Table1`)
| Column | Values | Used for |
|---|---|---|
| UNIT | VAN 112, TRL 44, FLEET… | Big title on the card |
| JOB | free text | What's being done |
| TYPE | ROUTINE / ONGOING / SCHEDULED | Picks the column |
| FREQUENCY | DAILY / WEEKLY / MONTHLY… | Routine only |
| STATUS | IN PROGRESS / WAITING ON PARTS / ON HOLD / DONE | Color: blue / amber / amber / green |
| MECHANIC | name | "Tech" |
| LOCATION | blank or `In house` = shop; anything else = outside | Shows "OUT @ Cummins" |
| START | date | In-shop day count; scheduled date |
| DUE | date | Overdue / due today / due tomorrow flags; routine "Next" |
| COMPLETED | date | Done jobs stay on "In the shop" only for that day |
| PRIORITY | HIGH / NORMAL / LOW | Red chip on scheduled jobs when HIGH/URGENT |
| NOTES | free text | Italic line under the card |

Board rules: overdue = red, due today/tomorrow = amber. Scheduled column shows the next 30 days,
grouped by day. DONE routine jobs stay visible (dimmed) until you roll the DUE date forward.
Footer turns red if `updated` is older than 45 min (flow stopped).

## Power Automate flow
1. **Trigger:** Recurrence, every 15 min (or "When a file is modified" on shop.xlsx).
2. **Excel Online (Business) → List rows present in a table** — site: your existing site, file `shop.xlsx`, table `Table1`.
   Advanced options → **DateTime Format: ISO 8601** (so dates come out as `2026-09-28`, not Excel serials).
3. **Select** — From: `value` of List rows. Map (keys lowercase, values via the **fx** panel):
   - `unit` → `item()?['UNIT']`, `job` → `item()?['JOB']`, `type` → `item()?['TYPE']` … same for every column
   - dates, blank-guarded: `if(empty(item()?['DUE']),'',formatDateTime(item()?['DUE'],'yyyy-MM-dd'))` (same for START, COMPLETED)
4. **Compose** (the JSON body):
   ```
   { "updated": "@{utcNow()}", "jobs": @{body('Select')} }
   ```
5. **HTTP GET** `https://api.github.com/repos/canumanu/shop-board/contents/data/shop.json`
   headers `Authorization: Bearer <PAT>`, `Accept: application/vnd.github+json`, `User-Agent: shop-board-flow` → gives you the current `sha`.
6. **HTTP PUT** same URL, same headers, body:
   ```
   {
     "message": "Update shop board",
     "content": "@{base64(outputs('Compose'))}",
     "sha": "@{body('HTTP_GET')?['sha']}"
   }
   ```
7. Repo → Settings → Pages → deploy from `main` / root.

**PAT:** fine-grained, repo `shop-board` only, *Contents: Read and write*. 366-day max —
it's in both HTTP actions, so update both when you regenerate it.
