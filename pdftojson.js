// pdftojson.js

import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import { z } from 'zod';
import dotenv from 'dotenv';
import { zodResponseFormat } from "openai/helpers/zod";
import pdf from 'pdf-parse';

// Indlæs miljøvariabler
dotenv.config();

// Initialiser OpenAI-klienten med API-nøgle fra miljøvariabler
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Hent API-nøglen fra .env-filen
});

// Definer Zod schema for struktureret dataekstraktion
const PDFDataExtraction = z.object({
    fullname: z.string(),
    dob: z.string(),
    phone: z.string(),
    email: z.string(),
    address: z.string(),
    zipcode: z.string(),
    city: z.string(),
    jobs: z.array(z.object({
        from: z.string(),
        to: z.string(),
        place: z.string()
    })),
    education: z.array(z.object({
        from: z.string(),
        to: z.string(),
    })),
    skills: z.array(z.string()),
    attributes: z.array(z.string())
});

/**
 * Extracts all text from a given PDF file.
 * @param {string} filePath - The path to the PDF file.
 * @returns {Promise<string>} - A promise that resolves with the extracted text.
 */
async function extractPdfText(filePath) {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);
        return data.text;
    } catch (error) {
        console.error('Error extracting text from PDF:', error);
        throw error;
    }
}

// Eksporteret funktion til at håndtere PDF upload og dataekstraktion
export async function handlePdfUpload(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Ingen fil uploadet.' });
        }

        // Læs den uploadede PDF-fil
        const filePath = path.join('uploads', req.file.filename);

        // Ekstraher tekst fra PDF
        const extractedText = await extractPdfText(filePath);

        // Opsæt beskeder til OpenAI API
        const messages = [
            {
                role: "system",
                content: "Du er en ekspert i struktureret dataekstraktion fra PDF-dokumenter. Du vil modtage tekst fra en PDF og skal udtrække følgende information i det angivne format. Du kan kun svare i JSON. Hvis ikke dato er givet, blot sæt som xxxx/01/01. Du skal under færdigheder tilføje fra hele dokumentet, også fra de færdigheder de har navnt andre steder i dokumentet. Hvilken som helst dato skal formates således: yyyy-mm-dd"
            },
            {
                role: "user",
                content: extractedText,
            },
        ];

        // Send forespørgsel til OpenAI API ved brug af den nye parse-metode
        const completion = await openai.beta.chat.completions.parse({
            model: "gpt-4o-2024-08-06",
            messages: messages,
            response_format: zodResponseFormat(PDFDataExtraction, "cvdata"),
        });

        // Ekstraher og valider det strukturerede svar
        const responseMessage = completion.choices[0].message;

        console.log('responseMessage:', responseMessage);

        if (responseMessage.refusal) {
            console.error('Refusal:', responseMessage.refusal);
            return res.status(400).json({ success: false, message: responseMessage.refusal });
        }

        const parsedData = PDFDataExtraction.parse(responseMessage.parsed);

        // Returner det strukturerede data til klienten
        res.json({ success: true, filePath: `/${filePath}`, data: parsedData });

    } catch (error) {
        console.error('Fejl under upload eller dataekstraktion:', error);
        res.status(500).json({ success: false, message: 'Der opstod en fejl under upload eller dataekstraktion.' });
    }
}
