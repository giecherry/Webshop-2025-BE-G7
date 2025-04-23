# 🛒 HAKIM LIVS - Backend G07

Detta är backend-delen av projektet **HAKIM LIVS**, byggd för att stödja en e-handelsplattform. Den tillhandahåller API:er för hantering av produkter, kategorier, beställningar och användarautentisering.

## 🔗 Projektlänkar

### ✅ Live Backend
**API URL:**  
https://webshop-2025-be-g7.vercel.app/api/

### 🎨 Live Frontend
**Version med Frontend-teamet:**  
https://webshop-2025-g7-fe-delta.vercel.app/

**Version efter Frontend-teamet lämnade:**  
https://webshop-2025-g7-fe-inky.vercel.app/

### 🌐 Egen domän
https://hakimlivs.com

---

## ⚙️ Installationsinstruktioner

### 1. Klona repository
```bash
git clone https://github.com/giecherry/Webshop-2025-BE-G7
cd Webshop-2025-BE-G7
```

### 2. Installera beroenden
Se till att du har Node.js installerat. Kör sedan:
```bash
npm install
```

### 3. Miljövariabler
Skapa en `.env`-fil i projektets rotmapp och lägg till följande variabler:
```
MONGODB_URI=<din mongodb atlas URI>
PORT=3000
JWT_SECRET=Backend_G7
```

> Obs: MONGODB_URI sattes upp via Vercels MongoDB Atlas-integration. Detta behöver konfigureras i början om man deployar till ny miljö.

### 4. Starta servern
```bash
npm run dev
```

Servern kommer att köras på:  
http://localhost:3000

---

## 🗂️ API Dokumentation

**Deployerad API-dokumentation:**  
https://webshop-2025-be-g7.vercel.app/api/

**Alla endpoints hittas i:**  
`src/index.js`

---

## 🚀 Deployment

### Vercel Deployment (CI/CD)
Backend är kopplad via GitHub → Vercel. Alla ändringar som pushas till `main` deployas automatiskt.

Guide som användes:  
https://willandskill.notion.site/Projekt-upps-ttning-Backend-1b617cd17715819f88bcfe61c83f5409

### För att deploya till en ny server:
      1. Klona detta repo
      2. Koppla till nytt GitHub repo om önskat
      3. Skapa ett nytt projekt i Vercel och länka till repot
      4. Lägg till miljövariabler i Vercel dashboard
      5. Tryck deploy (sker automatiskt om main branch pushas)

---

## 👩‍💻 Användningsinstruktioner

Sidan har två lägen:
- **Kund:** Kan se produkter, registrera sig, logga in och skapa ordrar.
- **Admin:** Kan logga in, hantera produkter (skapa, uppdatera, ta bort), se beställningar(dock ej frontendimplementerat ännu).

---

## 🔐 Gruppspecifika login (valfritt)

Testkonto (Admin):
```
Användarnamn: hakim
Lösenord:     hakim123
```

---

## 🌍 Miljövariabler

### Lokalt och Production:
- `MONGODB_URI`
- `PORT`
- `JWT_SECRET`

---

## 📦 Mappstruktur

```bash
📁 migration/              # Engångsskript för datamigrering
  └── data.migration.route.js

📁 src/
├── 📁 __tests__/          # Testfiler
├── 📁 data/               # Data (t.ex. seedfiler om ni har det)
├── 📁 middleware/
│   └── auth.js           # Middleware för autentisering
├── 📁 models/             # Mongoose-modeller
│   ├── Cart.js
│   ├── Category.js
│   ├── Order.js
│   ├── Product.js
│   └── User.js
├── 📁 routes/             # API-rutter
│   ├── auth.js
│   ├── cart.js
│   ├── categories.js
│   ├── orders.js
│   ├── products.js
│   └── index.js          # Huvudrouter för att samla allt
```