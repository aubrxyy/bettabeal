module.exports = {
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'api-bettabeal.dgeo.id',
                port: '',
                pathname: '/storage/**',
            },
            {
                protocol: 'https',
                hostname: 'api.bettabeal.my.id',
                port: '',
                pathname: '/storage/**',
            },
        ],
    },
}