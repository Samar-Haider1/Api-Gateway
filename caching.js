const { cache } = require('./proxy');
const { getLogger } = require('./winstonglog');
const logger = getLogger("caching.js");


const cacheData = (req, res, next) => {
    // Use the request URL+Body as the cache key
    const paramString = req.body.length > 0 || req.body.length == undefined ? JSON.stringify(req.body) : ''
    const key = `${req.originalUrl}:${paramString}`
    const cachedData = cache.get(key);

    if (cachedData) {
        // Serve the cached response if available
        logger.info(`status:${200} cached response: ${(JSON.stringify(cachedData))}`);
        res.send(cachedData);
        res.end()
        return


    }
    else {
        // If not cached, proceed to proxy the request
        next();

    }

}
exports.cacheData = cacheData;  