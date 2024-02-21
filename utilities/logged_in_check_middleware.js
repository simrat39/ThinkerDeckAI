/**
 * Middleware function to check if a user is logged in.
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function.
 */
export default function logged_in_check(req, res, next) {
    console.log(req.user)
    if (req.user) {
        next()
    } else {
        res.redirect("/signin")
    }
}