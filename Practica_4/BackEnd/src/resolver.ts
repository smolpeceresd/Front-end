
import { Request, Response } from "express";
import { Db } from "mongodb";
import { User } from "./types";
const bodyParser = require('body-parser');

export const people = async (req: Request, res: Response) => {

    const db: Db = req.app.get("db");
    const reservas = (await db.collection("People").find().toArray());

    return res.status(200).json(reservas)

}


export const register = async (req: Request, res: Response) => {
   
    console.log(req.body)
   
    const db: Db = req.app.get("db");
    const reservas = (await db.collection("People")
        .findOne({ email: req.body.email }));

    if (reservas) {
        return res.status(404).send("correo ya registrado");
    }

    const user: User = {
        name:req.body.name as string,
        lastname:req.body.lastname as string,
        email:req.body.email as string
    }

    const chars = await db.collection("People").insertOne(user);
    if (chars) {
        return res.status(200);
    } else {
        return res.status(500).send("Algo ha ido mal al registrarse");
    }

}

export const free = async (req: Request, res: Response) => {
    const db: Db = req.app.get("db");
    const reserva = await db.collection("People").deleteOne(
        {
            name:req.body.name as string,
            lastname:req.body.lastname as string,
            email:req.body.email as string
        }
    );
    if (reserva.deletedCount === 1) {
        return res.status(200);
    }
}