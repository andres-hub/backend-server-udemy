var express = require('express');

var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

app.use(fileUpload());

app.put('/:tipo/:id', (req,res,next)=>{

    var tipo = req.params.tipo;
    var id = req.params.id;

    // tipos de collection
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0 ) {
        return res.status(400).json({
            ok:false,
            mensaje: 'Tipo de coleccion no es valido',
            errors: {message: 'Tipo de coleccion no es valido'}
        });
    }

    if(!req.files){
        return res.status(400).json({
            ok:false,
            mensaje: 'No seleciono nada ',
            errors: {message: 'Debe selecionar una imagen'}
        });
    }

    //obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    //solo estas extenciones aceptamos
    var extencionesValidas = ['png', 'jpg', 'git', 'jpg'];

    if (extencionesValidas.indexOf(extensionArchivo)<0) {
        return res.status(400).json({
            ok:false,
            mensaje: 'Exteicion no valida',
            errors: {message: 'Las extenciones validas son ' + extencionesValidas.join(', ')}
        });
    }

    //nombre de archivo personalizado
    var nombreAchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

    // mover el archivo del temporal un path
    var path = `./uploads/${tipo}/${nombreAchivo}`;

    archivo.mv(path, err=>{

        if(err){
            return res.status(500).json({
                ok:false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }

    });

    subirPortipo(tipo, id,nombreAchivo, res);

    // res.status(200).json({
    //     ok: true,
    //     mensaje: 'Peticion exitos'
    // });

});

function subirPortipo(tipo, id,nombreAchivo, res) {

    if (tipo == 'usuarios') {
        Usuario.findById(id,(err, usuario)=>{

            if(!usuario){
                return res.status(400).json({
                    ok:false,
                    mensaje: 'Usuario no exite',
                    errors: err
                });
            }

            var pathViejo = './uploads/usuarios/' + usuario.img;

            // si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            usuario.img = nombreAchivo;

            usuario.save((err,usuarioActializado)=>{

                usuarioActializado.password = ':)';

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizado',
                    usuario: usuarioActializado
                });

            });

        });

    }

    if (tipo == 'medicos') {
        Medico.findById(id,(err, medico)=>{

            if(!medico){
                return res.status(400).json({
                    ok:false,
                    mensaje: 'Medico no existe',
                    errors: err
                });
            }

            var pathViejo = './uploads/medicos/' + medico.img;

            // si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            medico.img = nombreAchivo;

            medico.save((err,medicoActializado)=>{

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizado',
                    medico: medicoActializado
                });

            });

        });

    }

    if (tipo == 'hospitales') {
        Hospital.findById(id,(err, hospital)=>{

            if(!hospital){
                return res.status(400).json({
                    ok:false,
                    mensaje: 'Hospital no existe',
                    errors: err
                });
            }

            var pathViejo = './uploads/hospitales/' + hospital.img;

            // si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            hospital.img = nombreAchivo;

            hospital.save((err,hospitalActializado)=>{

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizado',
                    hospital: hospitalActializado
                });

            });

        });

    }

}

module.exports = app;
