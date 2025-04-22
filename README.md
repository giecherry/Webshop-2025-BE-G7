# HAKIM LIVS – Backend (Grupp 7)

Detta är backend-delen av projektet **HAKIM LIVS**, byggd för att stödja en e-handelsplattform. Den tillhandahåller API:er för hantering av produkter, kategorier, beställningar och användarautentisering.

---

## 🔗 Projektlänkar

### ✅ Live Backend  
**API URL:**  
[https://webshop-2025-be-g7.vercel.app/api/](https://webshop-2025-be-g7.vercel.app/api/)

### 🎨 Live Frontend  
**Version med Frontend-teamet:**  
[https://webshop-2025-g7-fe-delta.vercel.app/](https://webshop-2025-g7-fe-delta.vercel.app/)

**Version efter Frontend-teamet lämnade:**  
[https://webshop-2025-g7-fe-inky.vercel.app/](https://webshop-2025-g7-fe-inky.vercel.app/)

### 🌐 Egen domän  
[https://hakimlivs.com](https://hakimlivs.com)

---

## ⚙️ Installationsinstruktioner

1. **Kloning av repository**  
   ```bash
   git clone <repo-url>
   cd <projektmapp>
   ```

2. **Installera beroenden**  
   Se till att du har Node.js installerat. Kör sedan:  
   ```bash
   npm install
   ```

3. **Miljövariabler**  
   Skapa en `.env`-fil i projektets rotmapp och lägg till följande variabler:  
   *(exempelvariabler här – skriv in faktiska nycklar)*  
   ```env
   MONGODB_URI=din_mongodb_uri
   JWT_SECRET=din_hemliga_nyckel
   ```

4. **Starta servern**  
   För att starta utvecklingsservern:  
   ```bash
   npm run dev
   ```

   Servern kommer att köras på:  
   [http://localhost:3000](http://localhost:3000)

---

## API Documentation

For a complete list of API endpoints, refer to:

**Deployed API Documentation**: [https://webshop-2025-be-g7.vercel.app/api/](https://webshop-2025-be-g7.vercel.app/api/)

**Source Code**: Check the `src/index.js` file for the full list of API routes.

## 💡 Utvecklingsanteckningar

### Teknisk stack  
- **Backend:** Node.js, Express.js  
- **Databas:** MongoDB (via Mongoose)  
- **Autentisering:** JWT  

### Scripts  
- `npm run dev` – Starta utvecklingsserver  
- `npm start` – Starta produktionsserver  

### Mappstruktur  
    src/
    ├── models/         # Mongoose models
    ├── routes/         # API routes
    ├── middleware/     # Middleware functions
    ├── controllers/    # Business logic
    └── utils/          # Utility functions
---

## 🧭 Onboarding-info

- **Databas:** Säkerställ att du har åtkomst till MongoDB-databasen. Kontakta tidigare team för inloggningsuppgifter om det behövs.  
- **Miljövariabler:** Uppdatera `.env`-filen med rätt värden.  
- **Testning:** Använd Postman eller liknande verktyg för att testa API:er.  
- **Deployment:** Projektet är deployat via Vercel. Kontrollera Vercel-dashboarden för inställningar.

---

## 📬 Kontakt

Vid frågor, kontakta det tidigare teamet eller projektledaren.

---

