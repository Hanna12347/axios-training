import express from "express";
import { readFileSync, writeFileSync } from "fs";
import axios from "axios";
const API_URL = window.location.origin; // Points to your Render URL in production

document.getElementById("get-proverb").addEventListener("click", async () => {
  try {
    const response = await axios.get(`${API_URL}/api/random`);
    const proverb = response.data;
    document.getElementById("proverb-container").innerHTML = `
      <p><strong>German:</strong> ${proverb.textDeutsch}</p>
      <p><strong>English:</strong> ${proverb.textEnglish}</p>
    `;
  } catch (error) {
    console.error("Failed to fetch proverb:", error);
  }
});

const PORT = process.env.PORT || 3000;
const app = express();
const dataPath = path.join(__dirname, "backend", "data.json");
const proverbJSON = JSON.parse(readFileSync(dataPath, "utf-8")); 
app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Store today's proverb index
const todayIndex = Math.floor(Math.random() * proverbJSON.length);
let currentProverb = null;
app.get("/random", (req, res) => {
    const randomIndex = Math.floor(Math.random() * proverbJSON.length);
    res.json(proverbJSON[randomIndex]);
});

app.post("/create", (req, res) => {
    try {
        const newProverb = {
            id: Date.now().toString(),
            textDeutsch: req.body.proverb,
            textEnglish: req.body.englishproverb,
            translation: req.body.translation,
            meaning: req.body.meaning
        };
        proverbJSON.push(newProverb);
        writeFileSync('data.json', JSON.stringify(proverbJSON, null, 2));
        res.status(201).send("Proverb created successfully.");
    } catch (error) {
        console.error("Error creating proverb:", error);
        res.status(500).send("Error creating proverb");
    }
});

app.get("/", (req, res) => {
    res.render("https://axios-server-test-hf70.onrender.com", { proverb: currentProverb });
});

app.post("/proverbAction", (req, res) => {
    try {
        switch(req.body.choice) {
            case "today-proverb":
                currentProverb = proverbJSON[todayIndex];
                break;
            case "another-proverb":
                currentProverb = proverbJSON[Math.floor(Math.random() * proverbJSON.length)];
                break;  
            default:
                // Handle unknown choices
                break;
        }
        res.redirect("/");
    } catch (error) {
        console.error("Error handling proverb action:", error);
        res.status(500).redirect("/");
    }
});

app.get("/download/:id", (req, res) => {
    try {
        const proverb = proverbJSON.find(p => p.id.toLowerCase() === req.params.id.toLowerCase());
        if (proverb) {
            res.attachment(`${proverb.textDeutsch || 'proverb'}.json`);
            res.send(JSON.stringify(proverb, null, 2));
        } else {
            res.status(404).send('Proverb not found');
        }
    } catch (error) {
        console.error("Error downloading proverb:", error);
        res.status(500).send("Error downloading proverb");
    }
});

app.post("/delete/:id", (req, res) => {
    try {
        const id = req.params.id;
        const index = proverbJSON.findIndex(p => p.id === id);
        proverbJSON.splice(index, 1);
        writeFileSync(dataPath, JSON.stringify(proverbJSON, null, 2));
        
        res.send("Proverb deleted successfully");}
    catch{
        console.error("Error deleting proverb:", error);
        res.status(500).send("Error deleting proverb");
    }
});
