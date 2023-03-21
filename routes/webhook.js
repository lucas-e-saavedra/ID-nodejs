const router = require("express").Router();

router.get('', async (req, res) => {
    console.log(`${req.method} request to ${req.url}`);
    const clientId = req.header('X-AdobeSign-ClientId');

    res.json({
        xAdobeSignClientId : clientId
    });
});

router.post('', async (req, res) => {
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



router.post('/register', async (req, res) => {
    
});

module.exports = router;
