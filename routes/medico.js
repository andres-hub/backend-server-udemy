var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Medico = require('../models/medico');

// ========================================================
// Trae el listado de medicos
//=========================================================
app.get('/',(req,res)=>{

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
    .skip(desde)
    .limit(5)
    .populate('usuario','nombre email')
    .populate('hospital')
    .exec((err,medicos)=>{

        if(err){
            return res.status(500).json({
                ok:false,
                mensaje: 'Error al cargar medicos',
                errors: err
            });
        }

        Medico.count({},(err, conteo)=>{

            res.status(200).json({
                ok: true,
                medicos,
                total: conteo
            });

        })


    });

});

// ========================================================
// Actualizar medico
//=========================================================
app.put('/:id',mdAutenticacion.verificaToken,(req,res)=>{

    var id = req.params.id;
    var body = req.body;

    Medico.findById(id,(err,medico)=>{

        if(err){
            return res.status(500).json({
                ok:false,
                mensaje: 'Error al busacar el medico',
                errors: err
            });
        }

        if(!medico){
            return res.status(400).json({
                ok:false,
                mensaje: `El medico ${id} no existe`,
                errors: err
            });
        }

        medico.nombre = body.nombre;
        medico.hospital = body.hospital;
        medico.usuario = req.usuario._id;

        medico.save((err, medicoGuardado)=>{

            if(err){
                return res.status(500).json({
                    ok:false,
                    mensaje: 'Error al actualizar el medico',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });

        });

    });

});

// ========================================================
// Crear medico
//=========================================================
app.post('/',mdAutenticacion.verificaToken,(req,res)=>{

    var body = req.body;
    var medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        hospital: body.hospital,
        usuario: req.usuario._id
    });

    medico.save((err,medicoGuardado)=>{

        if(err){
            return res.status(500).json({
                ok:false,
                mensaje: 'Error al crear medico',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            medicoGuardado
        });

    });

});

// ========================================================
// Eliminar medico
//=========================================================
app.delete('/:id', mdAutenticacion.verificaToken,(req,res)=>{

    var id = req.params.id;

    Medico.findByIdAndDelete(id,(err,medicoBorrado)=>{

        if(err){
            return res.status(500).json({
                ok:false,
                mensaje: 'Error al borrar el medico',
                errors: err
            });
        }

        if(err){
            return res.status(400).json({
                ok:false,
                mensaje: `No existes el medico con el id ${id}`,
                errors:{message:'No exite un medico con ese id'}
            });
        }

        res.status(200).json({
            ok: true,
            medicoBorrado
        });

    });

});

module.exports = app;