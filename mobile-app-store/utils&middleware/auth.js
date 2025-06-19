// Authentication Middleware
const auth = (req, res, next) => {
    if(req.session.userId){
        console.log('Authenticated!');
        next();
    } else {
        console.log('fail');
        res.redirect('/login');
    }
};

module.exports = auth;