# Sivagiri Ashram Website

This is a static website for `sivagiriashram.com`, focused on Sivagiri Mutt, Varkala, the life and teachings of Sree Narayana Guru, a simple online catalog for books and t-shirts, and a searchable krithis library with YouTube links.

## Files

- `index.html` - page structure and content
- `styles.css` - visual design and responsive layout
- `app.js` - teachings, store catalog, and krithis data

## Run locally

You can open `index.html` directly in a browser, or serve the folder with a lightweight static server:

```powershell
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Publish on GoDaddy hosting

If you have GoDaddy Web Hosting or cPanel hosting attached to the domain:

1. Sign in to GoDaddy and open the hosting dashboard for `sivagiriashram.com`.
2. Open File Manager or connect with FTP/SFTP.
3. Upload `index.html`, `styles.css`, and `app.js` into `public_html`.
4. If there is an old `index.html`, back it up first.
5. Visit `https://sivagiriashram.com` and confirm the site is loading.

## Important follow-up items

- Replace the placeholder store email addresses with real domain email accounts.
- Add real product images for books and t-shirts.
- If you want online payment, connect a checkout provider such as Razorpay, Shopify, or WooCommerce.
- If you want exact curated performance videos instead of YouTube search links, replace the generated links in `app.js` with chosen video URLs.

## Content references used for this build

- Sivagiri mission and public information: `https://www.sivagiri.com/sreenarayanadharmam`
- Works list: `https://www.keralatourism.org/varkala/sree-narayana-guru--works.php`
- General background on the Guru and selected works: `https://en.wikipedia.org/wiki/Narayana_Guru`