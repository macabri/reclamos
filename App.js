import express from 'express';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import handlebars from 'handlebars';

//estas 3 lineas con para trabajar con archivos, para mandar la plantilla al mail
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

//conexion a la base datos, importo el archivo conexion.js
import { conexion } from './db/conexion.js';

//aca configuro el dot
dotenv.config();
const app = express ();
app.use(express.json());

app.use(express.static(path.join(path.dirname(fileURLToPath(import.meta.url)), 'public')));


app.get('/', (req, res) => {
    res.sendFile(path.join(path.dirname(fileURLToPath(import.meta.url)), 'public', 'index.html'));
});

const puerto = process.env.PUERTO;
app.listen(puerto, ()=> {
    console.log("lo escucho")
})

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/notificacion',(req,res) =>{
    const correo= req.body.correoElectronico;
    const filename = fileURLToPath(import.meta.url);
    const dir = path.dirname(`${filename}`); 

    const plantilla = fs.readFileSync(path.join(dir + '/utiles/handlebars/plantilla.hbs'), 'utf-8');
    const template = handlebars.compile(plantilla);

    const datos = {
        name : 'carla',
        apellido : 'aquino'

    }
    const correoHtml = template (datos);

    const transporter = nodemailer.createTransport({
        service : 'gmail',
        auth : {
            user: process.env.CORREO,
            pass: process.env.CLAVE
        }
    })

    const mailOptions = {
        from: 'api',
        to: correo,
        subject : "nada",
        html: correoHtml

    }

    transporter.sendMail(mailOptions,(error,info) =>{
        if(error){
            console.error("error",error);
        } else {
            console.log("Lo envio", info.response);
            res.send(true);
        }
    })
})


app.get ('/reclamos-estados', async (req, res) =>{
     try{
        const sql = 'SELECT * FROM `reclamos_estado` where activo = 1;'

        const [result] = await conexion.query(sql);

        console.log(result)

        res.status(200).json({estado:true});

     }catch(error){
        console.log(error);
        res.status(500).json({
            mensaje: "error interno."
        })
     }
})

// Endpoint para crear un reclamo
app.post('/reclamos', async (req, res) => {
    const { asunto, descripcion, idReclamoTipo, idUsuarioCreador } = req.body;

    // Validar que se reciban todos los datos necesarios
    if (!asunto || !descripcion || !idReclamoTipo || !idUsuarioCreador) {
        return res.status(400).json({ mensaje: "Todos los campos son obligatorios." });
    }

    // Fecha de creación
    const fechaCreado = new Date();

    try {
        const sql = `
            INSERT INTO reclamos (asunto, descripcion, fechaCreado, idReclamoEstado, idReclamoTipo, idUsuarioCreador)
            VALUES (?, ?, ?, ?, ?, ?);
        `;
        
        // Suponiendo que el estado inicial es 'creado' que corresponde a un id específico
        const idReclamoEstado = 1; // Cambia esto según tu lógica de estado

        const [result] = await conexion.query(sql, [asunto, descripcion, fechaCreado, idReclamoEstado, idReclamoTipo, idUsuarioCreador]);

        res.status(201).json({ mensaje: "Reclamo creado exitosamente", idReclamo: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al crear el reclamo." });
    }
});


