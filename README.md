# Sivagiri Ashram — Sree Narayana Guru Website

A comprehensive, multi-page static website dedicated to **Sree Narayana Guru** (1856–1928), the great Kerala saint, philosopher, and social reformer.

🌐 **Live Site:** [sivagiriashram.com](https://sivagiriashram.com)

---

## Pages

| Page | Description |
|------|-------------|
| `index.html` | Homepage — hero, navigation grid, featured works, daily quote |
| `pages/biography.html` | Full biography with timeline (1856–1928) |
| `pages/teachings.html` | Core teachings in English, Malayalam, Tamil, Hindi |
| `pages/philosophy.html` | Advaita Vedanta philosophy & Ten Darsanas overview |
| `pages/atmopadesa-satakam.html` | 100 Verses of Self-Instruction with translations |
| `pages/darsanamala.html` | All 10 Darsanas with Sanskrit verses & translations |
| `pages/kritis.html` | Complete works — devotional, philosophical, social |
| `pages/poojas.html` | Daily worship, Guru Pooja, mantras in 4 languages |
| `pages/temples.html` | Sivagiri Mutt, Aruvippuram, and major temples |
| `pages/festivals.html` | Sivagiri Pilgrimage, Guru Jayanti, observances |
| `pages/quotes.html` | Filterable quotes by category and language |
| `pages/gallery.html` | Visual tribute — photos and pilgrimage |
| `pages/languages.html` | Teachings in Malayalam, Tamil, Sanskrit, Hindi, Kannada |

---

## Deployment — GitHub Pages

### Step 1: Create a GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click **New repository**
3. Name it exactly: `sivagiriashram.com` (or any name you prefer)
4. Set visibility to **Public**
5. Click **Create repository**

### Step 2: Upload Files

**Option A — GitHub Web Interface (simplest):**
1. Open your repository
2. Click **Add file → Upload files**
3. Drag and drop ALL files and folders from this project
4. Click **Commit changes**

**Option B — Git command line:**
```bash
cd sivagiriashram
git init
git add .
git commit -m "Initial commit — Sree Narayana Guru website"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. In your repository, go to **Settings → Pages**
2. Under **Source**, select **Deploy from a branch**
3. Choose branch: `main`, folder: `/ (root)`
4. Click **Save**
5. GitHub will show your site URL (e.g., `https://yourusername.github.io/repo-name`)

### Step 4: Connect Custom Domain (sivagiriashram.com)

The `CNAME` file in this project already contains `sivagiriashram.com`.

In **GitHub Pages Settings**, under **Custom domain**, enter:
```
sivagiriashram.com
```
Click Save. GitHub will verify the domain.

---

## GoDaddy DNS Configuration

Log into your GoDaddy account → DNS Management for `sivagiriashram.com`

### Add these A Records (IPv4):

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | 185.199.108.153 | 600 |
| A | @ | 185.199.109.153 | 600 |
| A | @ | 185.199.110.153 | 600 |
| A | @ | 185.199.111.153 | 600 |

### Add CNAME Record (for www):

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | www | YOUR_USERNAME.github.io | 3600 |

> **Note:** DNS changes can take up to 24–48 hours to propagate worldwide. After propagation, enable **Enforce HTTPS** in GitHub Pages settings for a secure connection.

---

## Adding Real Content

### Audio Files
Place MP3 files in an `/audio/` folder. The site is wired to play:
- Verses from Atmopadesa Satakam
- Darsanamala chants
- Pooja mantras

### Images
Place images in an `/images/` folder and update `gallery.html` with real `<img>` tags.

### Fonts
The site uses Google Fonts (loaded via CDN):
- **Cinzel** — display headings
- **Cormorant Garamond** — body text
- **Noto Sans Malayalam / Tamil / Devanagari** — regional scripts

---

## Languages Supported

🇮🇳 Malayalam · Tamil · Hindi · Kannada · Sanskrit · English

---

## Core Message

> **"ഒരു ജാതി ഒരു മതം ഒരു ദൈവം മനുഷ്യന്"**
> *One Caste, One Religion, One God for Humanity*
> — Sree Narayana Guru

---

## License

This website is created for spiritual and educational purposes in devotion to Sree Narayana Guru. Content may be freely shared for non-commercial use with attribution.

*Sree Narayana Guru Deva Thiruvadigal Saranam*
