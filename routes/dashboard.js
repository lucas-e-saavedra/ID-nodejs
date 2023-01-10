const router = require("express").Router();

router.get("/me", async (req, res) => {
    res.json({
        error : null,
        data : {
            title : "Dashboard",
            user : req.user
        }
    });
});

module.exports = router;