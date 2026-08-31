# Viovas — site nou

Site static pentru **Școala Auto VIOVAS S.R.L.**, Iași. HTML + CSS + JavaScript, fără build, fără dependențe, fără `node_modules`. Se deschide cu dublu-click pe `index.html` și se urcă prin FTP pe orice hosting.

Conținutul despre școală (texte, tarife, parc auto, program, recenzii) este preluat de pe viovas.ro. Informațiile adăugate ulterior — vârste minime, durate, acte necesare — sunt cerințe legale, cu sursele notate mai jos. **Nu s-a inventat nicio informație.**

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

Butoanele de WhatsApp folosesc deep link-ul oficial `api.whatsapp.com/send?phone=40762692450` (varianta `wa.me` face un redirect 302 pe care unele instrumente de audit îl raportează ca link rupt). Dacă numărul mobil **nu** are WhatsApp activ, caută `api.whatsapp.com/send` în toate fișierele `.html` și înlocuiește numărul sau șterge butoanele.

### 3. Urcă fișierele

Copiază **tot** conținutul acestui folder în rădăcina hostingului (`public_html/` sau echivalent).

- Pe hosting Apache / cPanel: `.htaccess` face redirecționările 301 de la vechile adrese WordPress, plus compresia (Brotli/gzip), cache-ul și antetele de securitate.
- Pe Netlify / Cloudflare Pages: `_redirects` face redirecționările, iar `_headers` pune antetele de securitate și cache-ul. Poți șterge `.htaccess`.

Redirecționările sunt importante — fără ele pierzi poziționarea în Google pentru `/despre-noi/`, `/categorii/` și `/contact/`.

### 4. Ce ține de hosting, nu de fișiere

Trei lucruri dintr-un audit SEO nu se pot rezolva din cod, ci doar din server:

| Verificare | Cum trece |
|---|---|
| **Antete de securitate** (`X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, HSTS, CSP) | Automat, dacă `.htaccess` (Apache) sau `_headers` (Netlify / Cloudflare Pages) ajunge în rădăcină. Pe **GitHub Pages nu funcționează** — GitHub nu permite antete proprii |
| **Compresie** | Apache: `mod_deflate` / `mod_brotli`, deja configurate în `.htaccess`. GitHub Pages comprimă doar dacă browserul cere explicit `Accept-Encoding` |
| **CDN** | Pune domeniul prin **Cloudflare** (plan gratuit). Rezolvă simultan CDN, Brotli și antetele, dacă hostingul nu le poate seta |

Pe scurt: pe GitHub Pages, auditul se va opri în jur de 90. Pe hostingul real al lui `viovas.ro` (Apache) sau pe Cloudflare Pages, trece.

---

## Cum editezi conținutul

| Ce vrei să schimbi | Unde |
|---|---|
| **Data următoarei serii** | Caută `24 august 2026` în `index.html`, `despre.html`, `categorii.html`, `contact.html` |
| **Tarife** | `categorii.html`, secțiunea `price-grid` — plus blocul `hasOfferCatalog` din JSON-LD-ul din `index.html` |
| **Parcul auto** | `despre.html`, secțiunea `#parc` |
| **Telefoane / email / program** | Sunt în subsolul fiecărei pagini și în `contact.html` |
| **Recenzii** | `index.html`, secțiunea `#recenzii` |
| **Întrebările frecvente** | `index.html`, secțiunea `#intrebari` — plus blocul `FAQPage` din JSON-LD-ul aceleiași pagini. **Dacă schimbi un răspuns în pagină, schimbă-l și în JSON-LD**, altfel Google semnalează nepotrivirea |
| **Etapele până la permis** | `index.html`, secțiunea `#etape` |
| **Vârstele minime** | `categorii.html`, secțiunea `#varste` |
| **Actele necesare** | `categorii.html`, secțiunea `#acte` |
| **Banda cu parcul auto** | `index.html`, secțiunea `.marquee` — se dublează automat din JavaScript, tu scrii lista o singură dată |
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
├── _headers                        Antete de securitate + cache (Netlify / Cloudflare Pages)
├── robots.txt · sitemap.xml · site.webmanifest
└── assets/
    ├── css/style.css               Tot stilul, un singur fișier
    ├── js/main.js                  Toată interactivitatea, un singur fișier
    ├── fonts/                      Mulish variabil (400–900), self-hosted
    ├── img/                        Logo, poster, sala de curs, Yaris, favicon, OG
    └── video/                      Cele 4 filmări (MP4 H.264): hero, prezentare, categoria A, categoria C
```

---

## Ce e inclus

**Design** — temă dark, video cinematic în hero (plus o prezentare la mijlocul paginii principale și câte o filmare pentru categoriile A și C pe pagina de tarife — toate pornesc pe mut, cu buton de sunet), animații la scroll, carduri cu înclinare 3D, meniu mobil pe tot ecranul, bară fixă de acțiuni pe telefon (Sună / WhatsApp / Înscrie-te). Traseu grafic pentru etapele până la permis, cu marcaj rutier care se desenează pe măsură ce derulezi. Bandă derulantă cu parcul auto. Filigran de vehicul pe cardurile de categorii și de tarife.

**Conținut** — răspunsuri la întrebările reale ale unui cursant: de la ce vârstă, cât durează, ce acte îi trebuie, ce se întâmplă după ce trimite formularul. Accordion de întrebări frecvente cu date structurate `FAQPage`.

**SEO local** — date structurate `DrivingSchool` cu adresă, coordonate GPS, program, cele 7 tarife ca `Offer`, breadcrumbs pe fiecare pagină, titluri și descrieri unice, sitemap, imagine de partajare.

**Accesibilitate** — toate cele 7 pagini validează fără erori la W3C, contrast AA, navigare completă de la tastatură, `prefers-reduced-motion`, etichete și mesaje de eroare legate corect în formular.

> **Cache:** `.htaccess` ține CSS, JS, imaginile și filmările în cache un an. Când modifici `style.css`, `main.js` sau suprascrii o imagine/filmare păstrându-i numele, urcă versiunea din link-uri (`?v=2` → `?v=3`) în toate paginile, altfel vizitatorii vechi rămân cu fișierele din cache.

**Performanță** — un singur CSS și un singur JS, zero dependențe externe, fonturi self-hosted (fără Google Fonts), imagini WebP cu fallback JPEG/PNG prin `<picture>`, video amânat, ~360 KB pentru prima încărcare fără video.

---

## Sursele informațiilor legale din site

Conținutul adăugat despre vârste, durate și acte **nu descrie practicile Viovas**, ci cerințele legale valabile pentru orice școală auto autorizată din România. Sunt lucruri care se pot modifica, așa că iată de unde provin, ca să le poți reverifica.

| Ce scrie în site | Unde apare | Sursa |
|---|---|---|
| Vârstele minime: 16 / 18 / 21 / 24 de ani pe categorii | `categorii.html#varste`, FAQ | Art. 20 din OUG 195/2002 (Codul Rutier) |
| Minimum 24 de ore de legislație și 30 de ore de conducere, în minimum 4 săptămâni, maximum 6 luni | `index.html#etape`, FAQ | Legislația în vigoare privind pregătirea cursanților. „Minim 4 săptămâni · maxim 6 luni" era deja pe site, la parcul auto |
| Ora didactică are 50 de minute, maximum 2 ore de condus pe zi | `index.html#etape`, FAQ | Aceeași reglementare |
| Certificatul de absolvire e valabil un an și conține avizul medical | `index.html#etape`, `categorii.html#acte` | Reglementările privind dosarul de examinare |
| **Cazierul judiciar nu se mai depune (din 2026)** | `categorii.html#acte`, FAQ | Modificare de procedură intrată în vigoare în 2026: verificarea se face din oficiu, prin consultarea bazelor de date, cu acordul solicitantului |
| Restricția codul 78 pentru examenul dat pe cutie automată | FAQ | Cod european armonizat, aplicat pe permisul de conducere |

> **Înainte de publicare, confirmă cu un telefon la DGPCI (fostul DRPCIV) lista exactă de acte și taxa curentă.** În site am evitat intenționat să scriem sume, tocmai pentru că se schimbă. Secțiunea `#acte` are deja o notă care spune vizitatorului să sune pentru confirmare.

---

## Ce lipsește — de la client

Site-ul funcționează complet fără acestea, dar cu ele devine mai puternic. Primele două sunt cele care contează cel mai mult.

1. **Ce include tariful.** E prima întrebare a oricărui cursant și singurul loc din site unde încă răspundem „sună-ne”. Avem nevoie de: câte ore de conducere sunt incluse în preț, dacă dosarul și taxele de examen intră în tarif, cât costă o oră suplimentară.
   - De completat în: `categorii.html`, sub fiecare `price-card` (adaugă un `<ul class="price-card__rows">` cu detaliile), și în răspunsul „Ce include tariful” din `index.html#intrebari` — **plus același text în blocul `FAQPage` din JSON-LD**.
2. **Poze reale cu parcul auto** — Golf 7 și 8, Seat Ibiza, Toyota Yaris, motocicletele Honda, camioanele MAN și Mercedes Atego, autobuzul. Momentan lipsa lor e acoperită grafic (banda derulantă de pe prima pagină, vitrina cu cifre de pe `categorii.html`, filigranele de pe carduri), dar fotografiile reale ar bate orice grafică.
   - Unde intră direct: `categorii.html`, în locul blocului `.garage`; `despre.html`, secțiunea `#parc`.
3. **Nota exactă de pe Google.** Site-ul afișează „188 de recenzii", care e confirmat. Nota în stele nu a putut fi confirmată (sursele terțe se contrazic), așa că a fost omisă din pagină și din datele structurate — date structurate greșite atrag penalizare de la Google. Când confirmi nota, se poate adăuga.
4. **Mai multe recenzii.** Sunt 188 pe Google, iar în pagină apar 3, dintre care una de un cuvânt. Copiază încă 3–4 recenzii reale în `index.html#recenzii`, după modelul celor existente.
5. **Poze și nume pentru instructori** — recenziile îi laudă pe nume (Horațiu, Cătălin), dar site-ul nu are nicio secțiune „Echipa". Ar fi cea mai puternică dovadă socială de pe site.
6. **Google Analytics 4** — site-ul nu are nicio măsurătoare, nici acum, nici înainte. Dacă îl adaugi, **actualizează și `politica-de-cookies.html`**, care acum declară corect că site-ul nu folosește niciun instrument de analiză.

---

© Școala Auto VIOVAS S.R.L. · CUI RO18473354 · J22/622/2006
