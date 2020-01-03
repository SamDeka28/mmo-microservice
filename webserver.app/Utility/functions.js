module.exports = {
    success: function (message, data) {
        return {
            status: 200,
            message: message,
            data: data
        }
    },
    failed: function (message, error) {
        return {
            status: 203,
            message: message,
            error: error
        }
    }
}