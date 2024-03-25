//*************************** Required Imports ******************************/

const { createProxyMiddleware } = require('http-proxy-middleware');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require("uuid");
const { getLogger } = require('./winstonglog');
const { ROUTES } = require("./routes");

const logger = getLogger("proxy.js");
const NodeCache = require('node-cache');
// const { cacheData } = require('./caching');
const cache = new NodeCache({ stdTTL: 60 });



let trans_id = '';

//*************************** Cutomer Request Handler ******************************/

const customRequestHandler = (proxyReq, req, res) => {
    getUuid();

    // Copy Of request to add t_id
    const reqBodyClone = {}
    Object.assign(reqBodyClone, req.body)
    const propName = 't_id'
    reqBodyClone[propName] = trans_id;

    // Logging after adding t_id 
    logger.info(`Request Url:${req.hostname}:8003${req.url}`, { method: req.method })
    logger.info(`Target Url: ${proxyReq._headers.host}${proxyReq.path}`);
    logger.info(`Parameter:${JSON.stringify(reqBodyClone)}`)

    // Manipulating request body for targeted request
    if (req.body) {
        let bodyData = JSON.stringify(req.body);
        let access_token = req.headers.access_token ? req.headers.access_token : ''
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.setHeader('Access_token', access_token)
        proxyReq.write(bodyData)
        proxyReq.end();
    }


};

//***************************Cutomer Response Handler ******************************/

const customResponseHandler = (proxyRes, req, res) => {

    let responseData = '';

    // Reteriving Data from response body
    proxyRes.on('data', chunk => {
        responseData += chunk;
    });

    // Adding t_id in response before Sending back to client
    proxyRes.on('end', () => {
        let myResponse = {}
        if (!res.finished) {
            // const paramString = JSON.stringify(req.body)

            let prop = 't_id'
            myResponse[prop] = trans_id
            //incase an api does not send json response, below line will be used
            myResponse = responseData.length > 0 || responseData.length == undefined ? Object.assign(myResponse, { data: JSON.parse(responseData) }) : responseData
            // console.log(responseData.length);
            logger.info(`status:${proxyRes.statusCode} response: ${(JSON.stringify(myResponse))}`);
            res.send(myResponse)
            res.end();
            const filteredUrl = req.method == 'GET' ? req.originalUrl.split('?')[0] : req.originalUrl

            ROUTES.forEach(route => {
                if (route.url == filteredUrl && route.isCached) {
                    cacheData(myResponse, req, res)
                }
            })


        }




    });
};


//***************************Cutomer Error Handler ******************************/

const customErrorHandler = (err, req, res, target) => {
    if (err && err.code === 'ETIMEDOUT') {
        let obj = {};
        obj['message'] = "Gate-way Timeout"
        obj['code'] = err.code
        obj['errno'] = err.errno
        obj['t_id'] = trans_id
        res.status(504).send(obj)
    } else {
        let obj = {};
        obj['message'] = err.message
        obj['code'] = err.code
        obj['errno'] = err.errno
        obj['t_id'] = trans_id
        res.status(500).send(obj)
        logger.error(`error: ${JSON.stringify(obj)}`)
    }


}




// Main Proxing Setup for Middleware
const setupProxies = (app, routes) => {
    const TIMEOUT = 30*60*1000;
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(bodyParser.json({ limit: "50mb" }))
    routes.forEach(route => {
        const proxyOptions = {
            target: route.proxy.target, // target Url for proxing
            changeOrigin: true,
            auth: 'shahzad:shaikh',
            pathRewrite: route.pathRewrite,
            secure: false,//route.proxy.secure,
            selfHandleResponse: true,// forcing proxy to send custom response to client
            onProxyReq: customRequestHandler, // Use the custom request handler
            onError: customErrorHandler, // Use the custom Error handler
            onProxyRes: customResponseHandler,// Use the custom Response handler
            proxyTimeout: TIMEOUT,
            timeout: TIMEOUT,

        };

        const apiProxy = createProxyMiddleware(route.url, proxyOptions);
        app.use(apiProxy);

    });

}


// Util function setting Uuid for every req&res
function getUuid(proxyRes, req, res) {
    const uuid = uuidv4();
    const numbericUuid = parseInt(uuid.substring(0, 6), 16) % 1000000;
    trans_id = numbericUuid.toString().padStart(6, "0");
    trans_id = numbericUuid
}


const cacheData = (myResponse, req, res) => {
    const paramString = req.body.length > 0 || req.body.length == undefined ? JSON.stringify(req.body) : ''
    const key = `${req.originalUrl}:${paramString}`
    cache.set(key, myResponse, 120);


}


module.exports = {
    setupProxies,
    cache
} 