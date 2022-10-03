const urlModel = require('../models/urlModel')
const shortId = require('shortid')
const validUrl = require('valid-url');
const redis = require('redis')
const { promisify } = require('util')

const isValid = function (value) {
    if (typeof value !== "string" || typeof (value) === 'undefined' || value === null) return false
    if (typeof value === "string" && value.trim().length === 0) return false
    return true
}
const redisClient = redis.createClient(
    10509,                                                          
    "redis-10509.c301.ap-south-1-1.ec2.cloud.redislabs.com",        
    { no_ready_check: true }
);
redisClient.auth("BkaBIfxSN230ehXRNrJ8ENoK7DvFIOHo",                
    function (err) {
        if (err) throw err;
    });

redisClient.on("connect", async function () {               
    console.log("Connected to Redis..");
});

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient)
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient)


const createShortUrl = async function(req, res){
    try {
         const data = req.body
        
        if (Object.keys(data).length == 0) 
            return res.status(400).send({ status: false, message: "Please provide data in request body" })

        const longUrl = data.longUrl
        if(!longUrl) return res.status(400).send({ status: false, message: "longURL is Mandatory" })

        if (! isValid(longUrl) || !validUrl.isUri(longUrl)){    
            return res.status(400).send({ status: false, message: "Not A Valid URL , Plz Provide valid long URL" })
        }
        const cachedata = await GET_ASYNC(`${longUrl}`)
        if (cachedata) {
            return res.status(200).send({ status: true, message: "longurl from cache", data:JSON.parse(cachedata) })
        }

        const urlPresent = await urlModel.findOne({ longUrl: longUrl }).select({ longUrl: 1, shortUrl: 1, urlCode: 1, _id: 0 })
        if (urlPresent){
            //  await SET_ASYNC(`${longUrl}`, JSON.stringify(longUrl))
            return res.status(200).send({ status: true, message: "URL Already Present and cached", data: urlPresent })
        }
        const urlCode = shortId.generate()
        const shortUrl = "http://localhost:3000/"+urlCode
        
        data["urlCode"] = urlCode
        data["shortUrl"] = shortUrl
                
        const savedData = await urlModel.create(data)

        const responsedata = { 
            longUrl: savedData.longUrl,
             shortUrl: savedData.shortUrl, 
             urlCode: savedData.urlCode 
        }
        await SET_ASYNC(`${longUrl}`, JSON.stringify(responsedata))
        return res.status(201).send({ status: true, message: "Data Created and cached", data: responsedata })
    }
    catch (err) {
        return res.status(500).send({ status: false, Error: err.message })
    }
}



    


const getFullUrl = async function(req,res){
    try{
        let urlCode = req.params.urlCode
        let findData = await urlModel.findOne({urlCode:urlCode})
        if(findData){
            let longUrl = findData.longUrl
            return res.status(302).redirect(longUrl)
        }
        return res.status(404).send({status: false,message: "Url not found"})
    }
    catch(err){
        res.status(500).send({status:false , message:err.message})
    }
}

module.exports = {createShortUrl , getFullUrl}