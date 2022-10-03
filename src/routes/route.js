const express = require('express')
const router = express.Router();
const urlController = require('../constrollers/urlController')


router.post('/url/shorten',urlController.createShortUrl)

router.get('/:urlCode',urlController.getFullUrl)

router.use(function(req,res){
    res.status(400).send({status:false, message:" Rout not found"})
})

module.exports = router