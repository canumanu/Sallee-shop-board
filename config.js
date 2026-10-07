// Sallee Shop Board — settings
// Leave clientId empty to run in DEMO mode (reads data/shop.json from this repo, no sign-in).
window.SHOP_CONFIG = {
  clientId: "",                                          // Application (client) ID of the "Sallee Shop Board" app registration
  tenantId: "428e82a0-5a1b-41e6-a24c-ca8ea70db05a",       // Directory (tenant) ID — Sallee's tenant
  fileUrl:  "https://salleehorsevans.sharepoint.com/sites/Shop/Shared%20Documents/shop%20board/shop.xlsx",   // Shop site → Documents → "shop board" folder → shop.xlsx (update if it moves)
  table:    "Table1",                                    // Name of the Excel table inside shop.xlsx
  refreshSeconds: 60                                     // How often the board re-reads the file
};
