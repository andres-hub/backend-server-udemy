var express = require('express');
var bcrypt = require('bcryptjs');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Usuario = require('../models/usuario');

// ========================================================
// Obtener todos los usuarios
//=========================================================
app.get('/', (req,res,nex)=> {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Usuario.find({}, 'nombre email img role google')
    .skip(desde)
    .limit(5)
    .exec(
     (err, usuarios)=>{

        if(err){
            return res.status(500).json({
                ok:false,
                mensaje: 'Error cargando usuario',
                errors: err
            });
        }

        Usuario.count({},(err,conteo)=>{

            if(err){

                return res.status(500).json({
                    ok:false,
                    mensaje: 'Error en conteo usuario',
                    errors: err
                });

            }
            res.status(200).json({
                ok: true,
                usuarios,
                total: conteo
            });

        });


    });

});

// ========================================================
// Actualizar usuario
//=========================================================
app.put('/:id', [mdAutenticacion.verificaToken,mdAutenticacion.verificaADMIN_o_MismoUsuario], (req,res)=>{

    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id,(err,usuario)=>{
        
        if(err){
            return res.status(500).json({
                ok:false,
                mensaje: 'Erorr al buscar usuario',
                errors: err
            });
        }

        if(!usuario){
            return res.status(400).json({
                ok:false,
                mensaje: `El usuario ${id} no existe`,
                errors: {message:'No existe un usuario con ese ID'}
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado)=>{

            if(err){
                return res.status(400).json({
                    ok:false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }

            usuarioGuardado.password = ':)';

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });

        });

    });

});

// ========================================================
// Crear un nuevo usuario
//=========================================================
app.post('/', (req,res)=>{

    var body = req.body;
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err,usuarioGuardado)=>{

        if(err){
            return res.status(400).json({
                ok:false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            usuarioGuardado,
            usuarioToken: req.usuario
        });

    });

});

// ========================================================
// Borrar un usuario por el id
//=========================================================
app.delete('/:id',[mdAutenticacion.verificaToken,mdAutenticacion.verificaADMIN_ROLE],(req,res)=>{

    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado)=>{

        if(err){
            return res.status(500).json({
                ok:false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }

        if(!usuarioBorrado){
            return res.status(400).json({
                ok:false,
                mensaje: `No exite un usuario con este id ${id}`,
                errors: {message:'No exite un usuario con ese id'}
            });
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });

    });

});

module.exports = app;