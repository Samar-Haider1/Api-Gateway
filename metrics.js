const client = require('prom-client');
const collectDefaultMetrics = client.collectDefaultMetrics;
const Registry = client.Registry;
const register = new Registry();

register.setDefaultLabels({
    app: 'my-apigateway-app'
})

const http_request_counter = new client.Counter({
    name: 'ApiGateway_http_request_count',
    help: 'Count of HTTP requests made to my app',
    labelNames: ['method', 'route', 'statusCode','project','source'],
});



register.registerMetric(http_request_counter);
collectDefaultMetrics({ register });

const setupMetrics = (app) => {
    app.use(function (req, res, next) {
        // Increment the HTTP request counter
        http_request_counter.labels({ method: req.method, route: req.originalUrl, statusCode: res.statusCode, project: "my-apigateway-app", source: "my-apigateway-app" }).inc();
        next();
    }),

        app.get('/metrics', function (req, res) {
            res.setHeader('Content-Type', register.contentType)

            register.metrics().then(data => res.status(200).send(data))
        })
}


exports.setupMetrics = setupMetrics