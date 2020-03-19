var express = require('express');

var app = express();

const path = require('path');
const fs = require('fs'); 

app.get('/:tipo/:img', (req,res,nex)=> {

    var tipo = req.params.tipo;
    var img = req.params.img;

    var pathImegen = path.resolve( __dirname, `../uploads/${tipo}/${img}`);
    if(fs.existsSync(pathImegen)){
        res.sendFile(pathImegen);
    }else{
        var pathNoImagen = path.resolve(__dirname,'../assets/no-img.jpg');
        res.sendFile(pathNoImagen);
    }

});

module.exports = app;