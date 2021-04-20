const { Router } = require('express')
const cookieParser = require("cookie-parser")
const jwt = require('jsonwebtoken')
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

const router = Router()
router.use(cookieParser())

// -------- models -------------
const { User, Tweet } = require('../models/models.js');

// ----------- print function ------------
function print(data1, data2) {
    if (data2 == undefined) {
        console.log(data1)
    } else {
        console.log(data2)
        console.log(data1)
    }
}

// ----------- creating User Page ------------
router.get('/', function(req, res) {

    res.render('pages/createUser.ejs')
})

// ----------- creating User ------------
router.post('/createUser', async function(req, res) {

    let username = req.body.username
    let password = req.body.password

    // ----------- creating user -----------
    await User.sync()
    let user = await User.create({
        username,
        password
    })

    console.log(user.toJSON())
    res.redirect('/login')
})

// ---------- login page ----------
router.get('/login', function(req, res) {
    res.render('pages/login.ejs')
})

//  --------- logging in ----------
router.post('/login', async function(req, res) {

    let username = req.body.username
    let password = req.body.password

    let user = await User.findOne({
        where: {
            [Op.and]: [
                { username },
                { password }
            ]
        }
    })

    if (user) {

        let id = uuidv4()

        // ------------ setting cookie ----------------
        res.cookie('cID', id, {
            expires: new Date(Date.now() + 900000),
            httpOnly: true
        })

        // -------- setting session -----------
        await User.update({ session: id }, {
            where: {
                [Op.and]: [
                    { username },
                    { password }
                ]
            }
        });

        res.redirect('/createTweet')

    } else {
        res.redirect('/error')
    }

})

// ----------- creating Tweet page ------------
router.get('/createTweet', async function(req, res) {

    let cID = req.cookies.cID

    // ------ checking for undefined values -------
    if (cID) {

        let user = await User.findOne({
            where: {
                session: cID
            }
        })

        if (user) {
            let data = {
                user: (user.toJSON()).username
            }
            res.render('pages/createTweet.ejs', data)
        } else {
            res.redirect('/error')
        }
    } else {
        res.redirect('/error')
    }

})

// ----------- creating Tweet ------------
router.post('/createTweet', async function(req, res) {

    let content = req.body.content
    let cID = req.cookies.cID

    if (cID) {

        // ------------- User Locating ---------- 
        let user = await User.findOne({
            where: { session: cID }
        })

        if (user) {
            // ------------- creating tweet ----------
            await Tweet.create({
                content,
                timeCreated: new Date(),
                fuckingId: user.id

            })

            res.redirect('/createTweet')
        } else {
            res.redirect('/error')
        }
    } else {
        res.redirect('/error')
    }
})

// ----------- logOut function ------------
router.get('/logout', async function(req, res) {

    let cID = req.cookies.cID

    //--------------- deleting session ----------

    // ------ checking for undefined values -------
    if (cID) {

        print(cID, '\n This is the cookie ID')

        let user = await User.findOne({
            where: {
                session: cID
            }
        })

        if (user) {
            // -------- deleting session -----------
            await User.update({ session: null }, {
                where: {
                    session: cID
                }
            });

            // -------------- Deleting Cookie ---------------
            res.cookie('cID', '', {
                maxAge: 0,
                httpOnly: true
            })

            res.redirect('/')

        } else {
            res.redirect('/error')
        }
    } else {
        res.redirect('/error')
    }

})

// ---------- Tweet View ------------
router.get('/view', async function(req, res) {

    let tweets = await Tweet.findAll({
        include: User
    })
    let data = { tweets }

    res.render('pages/view.ejs', data)
})

// ------------- error -----------------
router.get('/error', function(req, res) {
    res.send('<h1 style="text-align:center">What a BUMMER!</h1>')
})

//------- Route to view all users in console ------
router.get('/users', async function(req, res) {
    let users = await User.findAll()
    console.log(JSON.stringify(users, null, 2))
    res.redirect('/')
})

module.exports = router