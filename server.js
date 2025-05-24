const express = require("express");
const fs = require('fs');
const { json } = require("stream/consumers");
import path from "path";
import { fileURLToPath } from "url";

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();
const PORT = process.env.PORT || 3000;
const dataPath = path.join(__dirname, "data.json");
const proverbJSON = JSON.parse(readFileSync(dataPath, "utf-8"));

app.use(express.json());
app.use(express.urlencoded({extended:true}));

const data = JSON.parse(fs.readFileSync("data.json"))
app.get("/random",(req,res)=>{
    const randomIndex =Math.floor( Math.random() * data.length);
    const randomdata = data[randomIndex];
    res.json(randomdata);
});
app.post("/api/create", (req, res) => {
  try {
    const newProverb = {
      id: Date.now().toString(),
      textDeutsch: req.body.proverb,
      textEnglish: req.body.englishproverb,
      translation: req.body.translation,
      meaning: req.body.meaning,
    };
    proverbJSON.push(newProverb);
    writeFileSync(dataPath, JSON.stringify(proverbJSON, null, 2));
    res.status(201).send("Proverb created successfully.");
  } catch (error) {
    res.status(500).send("Error creating proverb");
  }
}); 

app.post("/create",(req,res)=>{
    const newproverb = req.body;
    const newproverbid = Date.now().toString();
    newproverb.id = newproverbid;
    data.push(newproverb);
    fs.writeFileSync("data.json",JSON.stringify(data , null , 2));
    res.send("proverb is created.")
})
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT,()=>{
    console.log(PORT)
})
//https://axios-server-test-hf70.onrender.com