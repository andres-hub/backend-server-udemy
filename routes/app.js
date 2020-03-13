var express = require('express');

var app = express();

app.get('/', (req,res,nex)=> {

    res.status(200).json({
        ok: true,
        mensaje: 'OK'
    })

});

module.exports = app;