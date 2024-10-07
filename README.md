# Automatisk CV Upload

## Beskrivelse

**Automatisk CV Upload** er en webapplikation, der muliggør nem upload og ekstraktion af CV-data fra PDF-filer. Ved hjælp af OpenAI's GPT-4 teknologi kan brugere uploade deres CV'er, som automatisk parses til strukturerede data. Applikationen inkluderer en intuitiv formular til manuel indtastning samt en funktion til træk-og-slip af PDF-filer.

## Funktioner

- **PDF Upload:** Brugere kan uploade deres CV'er som PDF-filer.
- **Automatisk Dataekstraktion:** CV-data udtrækkes automatisk ved hjælp af OpenAI's GPT-4 API.
- **Formular Validering:** Grundig validering af alle formularfelter for at sikre datakvalitet.
- **Dynamiske Felter:** Tilføj eller fjern tidligere jobs, uddannelser, færdigheder og egenskaber dynamisk.
- **Fejlhåndtering:** Klare fejlmeddelelser ved forkert filtype eller valideringsfejl.
- **Server-side Logging:** CV-data logges til serverens konsol for yderligere behandling eller integration.

## Teknologier

- **Backend:**
  - [Node.js](https://nodejs.org/)
  - [Express.js](https://expressjs.com/)
  - [Multer](https://github.com/expressjs/multer) (Filupload)
  - [OpenAI API](https://openai.com/api/)
  - [Zod](https://github.com/colinhacks/zod) (Schema Validering)
  - [pdf-parse](https://github.com/modesty/pdf-parse) (PDF Tekst Ekstraktion)
  - [dotenv](https://github.com/motdotla/dotenv) (Miljøvariabler)

- **Frontend:**
  - HTML, CSS, JavaScript

## Installation

### Forudsætninger

- [Node.js](https://nodejs.org/) installeret på din maskine.
- En OpenAI API-nøgle. Du kan få en nøgle ved at oprette en konto på [OpenAI](https://openai.com/).

### Trin for Trin

1. **Klon Repository:**

   ```bash
   git clone https://github.com/dit-brugernavn/automatisk-cv-upload.git
   cd automatisk-cv-upload
    ```

2. **Installer Afhængigheder:**
   ```bash
   npm install
    ```


3. **Konfigurer Miljøvariabler:**
Opret en .env-fil i roden af projektet og tilføj din OpenAI API-nøgle:
   ```
    OPENAI_API_KEY=din_openai_api_nøgle
    ```


4. **Opret Upload Mapper:**
   ```bash
   mkdir uploads
    ```


5. **Start Serveren:**
   ```bash
   npm start
    ```

Serveren vil køre på http://localhost:3000.