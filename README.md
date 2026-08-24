# Viovas — site nou

Site static pentru **Școala Auto VIOVAS S.R.L.**, Iași. HTML + CSS + JavaScript, fără build, fără dependențe, fără `node_modules`. Se deschide cu dublu-click pe `index.html` și se urcă prin FTP pe orice hosting.

Tot conținutul (texte, tarife, parc auto, program, recenzii) este preluat de pe viovas.ro. Nu s-a inventat nicio informație.

---

## Ce trebuie făcut înainte de publicare

### 1. Activează formularul de contact (5 minute)

Formularul funcționează prin [Web3Forms](https://web3forms.com) — gratuit, fără server, fără cont.

1. Intră pe **web3forms.com** și scrie `contact@viovas.ro` în câmpul „Create Access Key".
2. Confirmă emailul primit pe adresa aceea. Primești o cheie de forma `a1b2c3d4-...`.
3. Deschide `assets/js/main.js`, prima secțiune, și lipește cheia:

```js
var CONFIG = {
  WEB3FORMS_KEY: 'lipește-cheia-aici'
};
```

Până pui cheia, formularul validează corect, dar la trimitere afișează un mesaj care trimite vizitatorul spre telefon. Nu se pierde nimic.

### 2. Confirmă WhatsApp

Butoanele de WhatsApp duc spre `wa.me/40762692450`. Dacă numărul mobil **nu** are WhatsApp activ, caută `wa.me/40762692450` în toate fișierele `.html` și înlocuiește-l sau șterge butoanele.

### 3. Urcă fișierele

Copiază **tot** conținutul acestui folder în rădăcina hostingului (`public_html/` sau echivalent).

- Pe hosting Apache / cPanel: `.htaccess` face redirecționările 301 de la vechile adrese WordPress.
- Pe Netlify / Cloudflare Pages: fișierul `_redirects` face același lucru. Poți șterge `.htaccess`.

Redirecționările sunt importante — fără ele pierzi poziționarea în Google pentru `/despre-noi/`, `/categorii/` și `/contact/`.

---

## Cum editezi conținutul

| Ce vrei să schimbi | Unde |
|---|---|
| **Data următoarei serii** | Caută `24 august 2026` în `index.html`, `despre.html`, `categorii.html`, `contact.html` |
| **Tarife** | `categorii.html`, secțiunea `price-grid` — plus blocul `hasOfferCatalog` din JSON-LD-ul din `index.html` |
| **Parcul auto** | `despre.html`, secțiunea `#parc` |
| **Telefoane / email / program** | Sunt în subsolul fiecărei pagini și în `contact.html` |
| **Recenzii** | `index.html`, secțiunea `#recenzii` |
| **Culori, spațieri, fonturi** | `assets/css/style.css`, secțiunea **2. Tokeni**, chiar la început |

Antetul și subsolul sunt copiate identic în fiecare pagină. Dacă modifici unul, modifică-l în toate cele 7 fișiere `.html`.

---

## Structura

```
├── index.html                      Acasă
├── despre.html                     Despre Viovas + parcul auto (#parc)
├── categorii.html                  Categorii și tarife
├── contact.html                    Contact, formular, hartă
├── politica-confidentialitate.html
├── politica-de-cookies.html
├── 404.html
├── .htaccess                       Redirecționări + cache + securitate (Apache)
├── _redirects                      Redirecționări (Netlify / Cloudflare Pages)
├── robots.txt · sitemap.xml · site.webmanifest
└── assets/
    ├── css/style.css               Tot stilul, un singur fișier
    ├── js/main.js                  Toată interactivitatea, un singur fișier
    ├── fonts/                      Mulish variabil (400–900), self-hosted
    ├── img/                        Logo, poster, sala de curs, Yaris, favicon, OG
    └── video/                      Video-ul de fundal din hero (webm + mp4)
```

---

## Ce e inclus

**Design** — temă dark, video cinematic în hero, animații la scroll, carduri cu înclinare 3D, meniu mobil pe tot ecranul, bară fixă de acțiuni pe telefon (Sună / WhatsApp / Înscrie-te).

**SEO local** — date structurate `DrivingSchool` cu adresă, coordonate GPS, program, cele 7 tarife ca `Offer`, breadcrumbs pe fiecare pagină, titluri și descrieri unice, sitemap, imagine de partajare.

**Accesibilitate** — toate cele 7 pagini validează fără erori la W3C, contrast AA, navigare completă de la tastatură, `prefers-reduced-motion`, etichete și mesaje de eroare legate corect în formular.

**Performanță** — un singur CSS și un singur JS, fonturi self-hosted (fără Google Fonts), imagini WebP, video amânat, ~340 KB pentru prima încărcare fără video.

---

## Ce lipsește — de la client

Site-ul funcționează complet fără acestea, dar cu ele devine mai puternic:

1. **Poze reale cu parcul auto** — Golf 7 și 8, Seat Ibiza, Toyota Yaris, motocicletele Honda, camioanele MAN și Mercedes Atego, autobuzul. Acum sunt folosite doar imaginile reale existente (logo, sala de curs, randarea Yaris, video-ul cu mașina brandată).
2. **Nota exactă de pe Google.** Site-ul afișează „188 de recenzii", care e confirmat. Nota în stele nu a putut fi confirmată (sursele terțe se contrazic), așa că a fost omisă din pagină și din datele structurate — date structurate greșite atrag penalizare de la Google. Când confirmi nota, se poate adăuga.
3. **Ce include prețul** — ore de conducere, dosar, taxe de examen, tarif pentru ore suplimentare. E prima întrebare a oricărui cursant și nu apare nicăieri pe site-ul actual.
4. **Poze și nume pentru instructori** — o secțiune „Echipa" ar avea impact mare.
5. **Google Analytics 4** — site-ul nu are nicio măsurătoare, nici acum, nici înainte.

---

© Școala Auto VIOVAS S.R.L. · CUI RO18473354 · J22/622/2006
