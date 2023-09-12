const jwt = require('jsonwebtoken')
const User = require('../models/User')
const Key = require('../models/Key')


const prefetch = async (req, res, next) => {
    try {
        const cookie = req.cookies.token
        const verified = jwt.verify(cookie, process.env.JWT_SECRET)
        const userId = verified.userId
        const usermail = (await User.findById(userId)).email
        // console.log(usermail)
        const pvt_key = (await Key.findOne({email : usermail})).pvt
        // console.log(pvt_key)
        req.body.privateKeyHex = pvt_key
        next()
    } catch (error) {
        return res.status(401).json(`Prefetch failed!\n ${error}`)
    }
}

module.exports = prefetch