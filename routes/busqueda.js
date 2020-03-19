var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// ========================================================
// Busqueda por collectio
//=========================================================
app.get('/collection/:tabla/:busqueda', (req,res)=>{

    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda,'i');
    var promesa;

    switch (tabla) {
        case 'hospitales':
            promesa = buscarHospitales(regex);
            break;
        case 'usuarios':
            promesa = buscarUsuario(regex);
            break;
        case 'medicos':
            promesa = buscarMedicos(regex);
            break;
        default:

            return res.status(400).json({
                ok:false,
                mensaje: 'los tipos de busqueda solo son usuarios medicos y hospitales',
                errors: {message: 'Tipo de tabla/collection no valido'}
            });

    }

    promesa.then(data =>{

        res.status(200).json({
            ok: true,
            [tabla]: data
        });

    })
    

});

// ========================================================
// Busqueda genral 
//=========================================================
app.get('/todo/:busqueda', (req,res, next)=>{

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda,'i');

    Promise.all([buscarHospitales(regex), buscarMedicos(regex), buscarUsuario(regex)])
    .then(respuesta => {

        res.status(200).json({
            ok: true,
            hospitales: respuesta[0],
            medicos: respuesta[1],
            usuarios:respuesta[2]
        });

    });

});

function buscarHospitales(regex) {

    return new Promise((reolve, reject)=>{

        Hospital.find({nombre: regex})
        .populate('usuario','nombre eamil')
        .exec((err, hospitales)=>{

            if(err){
                reject('Error al cargar hospitales', err);
            }else{
                reolve(hospitales);
            }
        });

    });


}

function buscarMedicos(regex) {

    return new Promise((reolve, reject)=>{

        Medico.find({nombre: regex})
        .populate('usuario','nombre email')
        .populate('hospital')
        .exec((err, medicos)=>{

            if(err){
                reject('Error al cargar hospitales', err);
            }else{
                reolve(medicos);
            }
        });

    });

}

function buscarUsuario(regex) {

    return new Promise((reolve, reject)=>{

        Usuario.find({},'nombre email role')
            .or([{'nombre': regex}, {'email': regex}])            
            .exec({nombre: regex}, (err, usuarios)=>{

            if(err){
                reject('Error al cargar hospitales', err);
            }else{
                reolve(usuarios);
            }

        });

    });

}

module.exports = app;