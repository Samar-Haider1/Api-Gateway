//*************************** Target Routes Declartion ******************************/
// const LAN_HOST =
require('dotenv').config();

const ROUTES = [
    {
        url: '/hi',
        secure: false,
        isCached: false,
        isRateLimitTrue: true,
        proxy: {
            target: process.env.LAN_HOST,
            changeOrigin: true,

        },
        rateLimit: {
            windowMs: 1 * 60 * 1000, // time limit is set 15 minutes
            max: 5, // max 5 request with in time limit
        }
    },
    {
        url: '/nodepost',
        secure: false,
        isCached: true,
        isRateLimitTrue: true,
        proxy: {
            target: process.env.LAN_HOST,
            changeOrigin: true,

        },
        pathRewrite: {
            '^/nodepost': '/post', // rewrite path
        },
        rateLimit: {
            windowMs: 1 * 60 * 1000, // 15 minutes
            max: 5, // Limit each IP to 100 requests per windowMs
            // message: 'Too many requests from this IP, please try again later.',
        }
    },
    {
        url: '/uatAccountDetails',
        secure: false,
        isCached: false,
        isRateLimitTrue: false,
        proxy: {
            target: "https://10.111.200.166:7100",
            changeOrigin: true,

        },
        pathRewrite: {
            '^/uatAccountDetails': '/connectblbtransact/v1/getAccount', // rewrite path
        },
        rateLimit: {
            windowMs: 15 * 60 * 1000,
            max: 5,
        }
    },
    {
        url: '/authToken',
        secure: false,
        isCached: false,
        isRateLimitTrue: false,
        proxy: {
            target: "http://10.111.202.145:9066",
            changeOrigin: true,

        },
        pathRewrite: {
            '^/authToken': '/api/login', // rewrite path
        },
        rateLimit: {
            windowMs: 15 * 60 * 1000,
            max: 5,
        }
    },
    {
        url: '/income',
        secure: false,
        isCached: false,
        isRateLimitTrue: false,
        proxy: {
            rateLimitisTrue: false,
            target: "http://10.111.202.145:9066",
            changeOrigin: true,

        },
        pathRewrite: {
            '^/income': '/api/income', // rewrite path
        },
        rateLimit: {
            windowMs: 15 * 60 * 1000,
            max: 5,
        }
    },
    {
        url: '/chatbot',
        secure: false,
        isCached: false,
        isRateLimitTrue: true,
        proxy: {
            // target: "https://10.121.214.33:5005",
            target: "http://172.28.40.196:5005",
            changeOrigin: true,

        },
        pathRewrite: {
            '^/chatbot': '/webhooks/rest/webhook', // rewrite path
        },
        rateLimit: {
            windowMs: 15 * 60 * 1000,
            max: 5,
        }
    },

]

exports.ROUTES = ROUTES;
