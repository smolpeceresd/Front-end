
import { Db } from "mongodb";
import { getDocuments } from "./populated";
import express from "express";
import { free, people, register } from "./resolver";
const bodyParser = require('body-parser');


const run = async () => {

  const db: Db = await getDocuments();//ya me devuelve la base de datos ya conectada
  const app = express();
  app.set("db", db);
  ///Los USE 
  //Pasar body a json entendible
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  ///GETs ->obtener
  app.get("/status", async (req, res) => {
    const date = new Date();
    res.status(200).send(`DATE: ${date.getDate()} - ${date.getMonth()} - ${date.getUTCFullYear()}`);
  });
  app.get("/people", people);  
  app.post("/register", register);
  app.post("/free", free);

  await app.listen(4000);
};

/// geter & Setter
/// estoy corriendo esto
try {
  run();
} catch (e) {
  console.error(e);
}