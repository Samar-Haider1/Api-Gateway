const { MD5 } = require('crypto-js')

const authenticate = async (req, res, next) => {
    // req.body.message = 'hello'
    const bodyHash = await hashGenerator(req.body)
    if (req.headers && req.headers.authorization == bodyHash || req.url == '/metrics') {
        next(); // Proceed to the next middleware or route
    } else {
        res.status(401).send(); // Respond with an authentication error
        return
    }
};

const hashGenerator = (body) => {
    const strResp = JSON.stringify(body);
    const hashVariable = MD5(strResp).toString();
    return hashVariable

}

module.exports = {
    authenticate,
    hashGenerator
}