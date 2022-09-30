const urlModel = require('../models/urlModel')
const shortId = require('shortid')
const validUrl = require('valid-url');

const isValid = function (value) {
    if (typeof value !== "string") return false
    if (typeof value === "string" && value.trim().length === 0) return false
    return true
}
const isValidbody = function (value) {
    return Object.keys(value).length > 0
}

const createShortUrl = async function(req, res){
    try {
        const Data = req.body
        const { longUrl } = Data
        
        if (!isValidbody(Data)) {
            return res.status(400).send({ status: false, message: "Please provide data in request body" })
        }
        if (!longUrl || !isValid(longUrl)) {
            return res.status(400).send({ status: false, message: "invalid longurl or  Please provide longURL" })
        }
        if (!validUrl.isUri(longUrl)) {
            return res.status(400).send({ status: false, message: "Not a valid url,provide valid long urlL" })
        }
        const urlpresent = await urlModel.findOne({ longUrl: longUrl }).select({ longUrl: 1, shortUrl: 1, urlCode: 1, _id: 0 })
        if (urlpresent){
            return res.status(200).send({ status: true, message: "url already present", data: urlpresent })
        }
        
        const urlCode = shortId.generate()
        const shortUrl = "http://localhost:3000/"+urlCode
        
        Data.urlCode = urlCode
        Data.shortUrl = shortUrl
        
        
        const savedData = await urlModel.create(Data)
        const responsedata = { 
            longUrl: savedData.longUrl,
             shortUrl: savedData.shortUrl, 
             urlCode: savedData.urlCode 
            }
            return res.status(201).send({ status: true, message: "Data Created", data: responsedata })
    
}catch (err) {
    return res.status(500).send({ status: false, Error: err.message })
}
}


    


const getFullUrl = async function(req,res){

}

module.exports = {createShortUrl , getFullUrl}