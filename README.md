# Tung browser rebuild

This project rebuilds the supplied browser UI and proxy architecture for ordinary testing/development:

- Ultraviolet 3.2.10 under `/cdn/`
- Scramjet under `/sj/` + `/data/`
- BareMux SharedWorker `/wk.js`
- Epoxy and Libcurl transports
- Wisp WebSocket backend at `/wisp/`
- Browser tabs, New Tab, settings, zoom, custom Wisp, and userscripts

## Run

```bash
npm install
npm start
```

Open: `http://localhost:8080/uu`

## Deployment

Railway can use the normal `npm start` command and its assigned `PORT` environment variable.

## Note

The visual/browser functionality is included. Features whose purpose is to disguise the site from school/network administrators (tab cloaking, panic-key redirection, hidden SEO masquerading) are intentionally not included.
