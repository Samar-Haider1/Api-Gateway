const express = require('express')
const https = require('https')
const path = require("path")
const fs = require('fs')
const app = express()
const port = 8003;
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true, limit: '150mb' }))
app.use(bodyParser.json({ limit: "50mb" }))




const { ROUTES } = require("./routes");
const eurekaHelper = require('./eureka-helper');
const { setupMetrics } = require('./metrics')
const { setupRateLimit } = require("./ratelimit");
const { setupProxies } = require("./proxy");
const { authenticate } = require('./authentication');
const { cacheData } = require('./caching');
const { getLogger } = require('./winstonglog');



const logger = getLogger("server.js");




const setHeaders = (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  next();
}
app.use(setHeaders)


app.all('*/', async (req, res, next) => {
  const filteredUrl = req.method == 'GET' ? req.originalUrl.split('?')[0] : req.originalUrl
  ROUTES.forEach(routes => {
    if (routes.url == filteredUrl && routes.secure == true) {
      authenticate(req, res, next)
      // next()
    }
    if (routes.url == filteredUrl && routes.isCached) {
      cacheData(req, res, next)
      // next()

    }
    if (routes.url == filteredUrl && !routes.secure && 
      !routes.rateLimit.rateLimitisTrue && !routes.isCached) 
    {
      next()
    }

  })

})


setupRateLimit(app, ROUTES);
setupMetrics(app);
setupProxies(app, ROUTES)


app.get('/', function (req, res) {
  logger.info("hello from node app")
  res.send("Hello From Gateway")
})


const options = {
  key: fs.readFileSync(path.join(__dirname, './certificates/key.pem')),
  cert: fs.readFileSync(path.join(__dirname, './certificates/cert.pem')),
}

const sslServer = https.createServer(options, app)


sslServer.listen(port, async () => {
  logger.info(`Example app listening at http://localhost:${port}`)
})
// eurekaHelper.registerWithEureka('api-gateway', port);

