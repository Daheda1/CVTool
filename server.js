// server.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import cors from 'cors';
import bodyParser from 'body-parser';
import { handlePdfUpload } from './pdftojson.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// For at kunne bruge __dirname i ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Multer setup for filuploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Mappen hvor filer skal gemmes
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        const filetypes = /pdf/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Kun PDF-filer er tilladt!'));
    }
});

// Rute til filupload
app.post('/upload', upload.single('pdf'), handlePdfUpload);

// Rute til formularindsendelse
app.post('/submit-cv-form', (req, res) => {
    const { fullname, dob, phone, email, address, zipcode, city, jobs, education, skills, attributes } = req.body;
    
    // Valider grundlæggende felter
    if (!fullname || !dob || !phone || !email || !address || !zipcode || !city) {
        return res.status(400).json({ success: false, message: 'Alle felter skal udfyldes.' });
    }
    
    // Valider Postnummer
    const zipPattern = /^\d{4}$/;
    if (!zipPattern.test(zipcode)) {
        return res.status(400).json({ success: false, message: 'Postnummer skal være 4 cifre.' });
    }

    // Valider Tidligere Jobs
    if (jobs) {
        if (!Array.isArray(jobs.from) || !Array.isArray(jobs.to) || !Array.isArray(jobs.place)) {
            return res.status(400).json({ success: false, message: 'Ugyldig format for Tidligere Jobs.' });
        }

        for (let i = 0; i < jobs.from.length; i++) {
            if (!jobs.from[i] || !jobs.to[i] || !jobs.place[i]) {
                return res.status(400).json({ success: false, message: 'Alle felter i Tidligere Jobs skal udfyldes.' });
            }
            // Valider at "Fra" er før "Til"
            if (new Date(jobs.from[i]) > new Date(jobs.to[i])) {
                return res.status(400).json({ success: false, message: 'Startdato skal være før slutdato i Tidligere Jobs.' });
            }
        }
    }

    // Valider Uddannelse
    if (education) {
        if (!Array.isArray(education.from) || !Array.isArray(education.to) || !Array.isArray(education.place)) {
            return res.status(400).json({ success: false, message: 'Ugyldig format for Uddannelse.' });
        }

        for (let i = 0; i < education.from.length; i++) {
            if (!education.from[i] || !education.to[i] || !education.place[i]) {
                return res.status(400).json({ success: false, message: 'Alle felter i Uddannelse skal udfyldes.' });
            }
            // Valider at "Fra" er før "Til"
            if (new Date(education.from[i]) > new Date(education.to[i])) {
                return res.status(400).json({ success: false, message: 'Startdato skal være før slutdato i Uddannelse.' });
            }
        }
    }

    // Valider Færdigheder
    if (skills) {
        if (!Array.isArray(skills)) {
            return res.status(400).json({ success: false, message: 'Ugyldig format for Færdigheder.' });
        }

        for (let i = 0; i < skills.length; i++) {
            if (!skills[i].trim()) {
                return res.status(400).json({ success: false, message: 'Alle felter i Færdigheder skal udfyldes.' });
            }
        }
    }

    // Valider Egenskaber
    if (attributes) {
        if (!Array.isArray(attributes)) {
            return res.status(400).json({ success: false, message: 'Ugyldig format for Egenskaber.' });
        }

        for (let i = 0; i < attributes.length; i++) {
            if (!attributes[i].trim()) {
                return res.status(400).json({ success: false, message: 'Alle felter i Egenskaber skal udfyldes.' });
            }
        }
    }

    // For demonstration, logger dataene til server konsolen

    console.log('CV Formular Data:');
    console.log('Navn:', fullname);
    console.log('Fødselsdato:', dob);
    console.log('Telefon:', phone);
    console.log('Email:', email);
    console.log('Adresse:', address);
    console.log('Postnummer:', zipcode);
    console.log('By:', city);

    if (jobs) {
        console.log('Tidligere Jobs:');
        for (let i = 0; i < jobs.from.length; i++) {
            console.log(`Fra: ${jobs.from[i]}, Til: ${jobs.to[i]}, Arbejdsplads: ${jobs.place[i]}`);
        }
    }

    if (education) {
        console.log('Uddannelse:');
        for (let i = 0; i < education.from.length; i++) {
            console.log(`Fra: ${education.from[i]}, Til: ${education.to[i]}, Uddannelsessted: ${education.place[i]}`);
        }
    }

    if (skills) {
        console.log('Færdigheder:');
        skills.forEach(skill => {
            console.log(`- ${skill}`);
        });
    }

    if (attributes) {
        console.log('Egenskaber:');
        attributes.forEach(attribute => {
            console.log(`- ${attribute}`);
        });
    }

    res.json({ success: true, message: 'Formular indsendt succesfuldt!' });
});

// Håndter fejl fra multer
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError || err.message === 'Kun PDF-filer er tilladt!') {
        return res.status(400).json({ success: false, message: err.message });
    }
    next(err);
});

// Start serveren
app.listen(PORT, () => {
    console.log(`Serveren kører på http://localhost:${PORT}`);
});
