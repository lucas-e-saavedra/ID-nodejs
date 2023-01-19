const router = require("express").Router();
const User = require("../models/User");
const joi = require("@hapi/joi");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")


const schemaLogin = joi.object({
    email: joi.string().min(6).max(255).required().email(),
    password: joi.string().min(6).max(1024).required()
});

router.post('/login', async (req, res) => {
    const { error } = schemaLogin.validate(req.body);
    if (error) {
        return res.status(400).json({
            error: error.details[0].message
        });
    }

    const user = await User.findOne({ email : req.body.email});
    if (!user)
        return res.status(400).json({error : "email no registrado"});

    const passwordValid = await bcrypt.compare(req.body.password, user.password)
    if (!passwordValid)
        return res.status(400).json({error : "credenciales incorrectas"});

    const payload = {
        name: user.name,
        email: user.email,
        id: user._id
    };
    const minutesToExpireAccess = process.env.ACCESSTOKEN_EXPIRATION_MINUTES * 60;
    const accessToken = jwt.sign({
        exp: Math.floor(Date.now() / 1000) + minutesToExpireAccess,
        data: payload
    }, process.env.ACCESSTOKEN_SECRET);

    const minutesToExpireRefresh = process.env.REFRESHTOKEN_EXPIRATION_MINUTES * 60;
    const refreshToken = jwt.sign({
        exp: Math.floor(Date.now() / 1000) + minutesToExpireRefresh,
        data: payload
    }, process.env.REFRESHTOKEN_SECRET);

    res.json({
        error: null, 
        message: "Bienvenido", 
        accessToken: accessToken, 
        expiresIn: minutesToExpireAccess, 
        refreshToken: refreshToken, 
        refreshExpiresIn: minutesToExpireRefresh});
});

router.post('/refresh', async (req, res) => {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) {
        return res.status(400).json({error : "Falta token de refresco"});
    }
    try {
        const payload = jwt.verify(refreshToken, process.env.REFRESHTOKEN_SECRET);
        const minutesToExpireAccess = process.env.ACCESSTOKEN_EXPIRATION_MINUTES * 60;
        const accessToken = jwt.sign({
            exp: Math.floor(Date.now() / 1000) + minutesToExpireAccess,
            data: payload.data
        }, process.env.ACCESSTOKEN_SECRET);
        return res.json({
            error: null, 
            accessToken: accessToken, 
            expiresIn: minutesToExpireAccess});
    } catch (error) {
        return res.status(400).json({ error : "Token de refresco invalido" });
    }
});


const schemaRegister = joi.object({
    name: joi.string().min(3).max(255).required(),
    email: joi.string().min(6).max(255).required().email(),
    password: joi.string().min(6).max(1024).required()
});

router.post('/register', async (req, res) => {
    console.log(`${req.method} request to ${req.url}`);

    const { error } = schemaRegister.validate(req.body);
    if (error) {
        return res.status(400).json({
            error: error.details[0].message
        });
    }
    
    const existeEmail = await User.findOne({ email : req.body.email});
    if (existeEmail)
        return res.status(400).json({error : "email ya registrado"});

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(req.body.password, salt);
    
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: passwordHash
    });

    try {
        const userDB = await user.save();
        console.log(`userDB: ${userDB}`);
        res.json({
            error: null,
            data: userDB
        });
    } catch (error) {
        console.log(`error: ${error}`);
        res.status(400).json(error);
    }
});

module.exports = router;
