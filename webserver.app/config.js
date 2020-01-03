const {
    MONGO_HOSTNAME,
    MONGO_PORT,
    MONGO_DB
} = process.env;

module.exports = {
    server: {
        host: "http://localhost/"
        , port: 3000
    },
    db: {
        connection_string: `mongodb://db:27017/laserrun`
    },
    jwt: {
        secret: "lazerrun"
    },
    bcrypt: {
        salt_round: 10
    }
}