var express = require('express');

var mdAuttenticacion = require('../middlewares/autenticacion');

var app = express();

var Hospital = require('../models/hospital');

// ========================================================
// Obtener hospital por Id
//=========================================================
app.get('/:id', (req, res)=>{

    var id = req.params.id;

    Hospital.findById(id)
    .populate('usuario','nombre img email')
    .exec((err, hospital)=>{

        if(err){
          return res.status(500).json({
               ok:false,
               mensaje: 'Error al buscar hospital',
               errors: err
          });
        }

        if(!hospital){
          return res.status(400).json({
               ok:false,
               mensaje: `El hospital con el id ${id} no existe`,
               errors: {menssage: 'No existe un hospital con ese ID'}
          });
        }

        res.status(200).json({
           ok: true,
           hospital
        });

    });

});

// ========================================================
// Obtener todos los hospitales
//=========================================================
app.get('/',(req,res)=>{

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
    .skip(desde)
    .limit(5)
    .populate('usuario', 'nombre email')
    .exec((err,hospitales)=>{

        if(err){
            return res.status(500).json({
                ok:false,
                mensaje: 'Error al cargar hospitales',
                errors: err
            });
        }

        Hospital.count({},(err,conteo)=>{

            res.status(200).json({
                ok: true,
                hospitales,
                total: conteo
            });

        });

    });

});

// ========================================================
// Actualizar hospital
//=========================================================
app.put('/:id', mdAuttenticacion.verificaToken, (req,res)=>{

    var id = req.params.id
    var body = req.body;

    Hospital.findById(id,(err, hospital)=>{

        if(err){
            return res.status(500).json({
                ok:false,
                mensaje: 'Error al buscar el hopital',
                errors: err
            });
        }

        if(!hospital){
            return res.status(400).json({
                ok:false,
                mensaje:`El hospital con el id ${id} no existe`,
                errors: {message: 'no exixte el hospital con ese id'}
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalGuardado)=>{

            if(err){
                return res.status(400).json({
                    ok:false,
                    mensaje: 'Error al actualizar el hospital',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });

        });

    });

});

// ========================================================
// Crear un nuevo hospital
//=========================================================
app.post('/',mdAuttenticacion.verificaToken, (req,res)=>{

    var body = req.body;
    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err,hospitalGuardado)=>{

        if(err){
            return res.status(400).json({
                ok:false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalGuardado
        });

    });

});

// ========================================================
// Eliminar hospital 
//========================================================= 
app.delete('/:id',mdAuttenticacion.verificaToken,(req,res)=>{

    var id = req.params.id;

    Hospital.findByIdAndRemove(id,(err,hospitalBorrado)=>{

        if(err){
            return res.status(500).json({
                ok:false,
                mensaje: 'Error al borrar el hospital',
                errors: err
            });
        }

        if(!hospitalBorrado){
            return res.status(400).json({
                ok:false,
                mensaje: `No exite un hospital con este ${id}`,
                errors:{message:'No exite un hospital con ese id'}
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });

    });

});

module.exports = app;