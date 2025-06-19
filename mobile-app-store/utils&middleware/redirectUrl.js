/* middleware to store the redirect URL */
const redirectUrl = (req, res, next) => {
    req.session.redirect = req.originalUrl;
    next();
}

module.exports = redirectUrl;