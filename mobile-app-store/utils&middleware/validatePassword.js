/* Password validation utility */
const validatePassword = (inputPassword, storedPassword) => {
    return inputPassword === storedPassword;
};

module.exports = validatePassword;