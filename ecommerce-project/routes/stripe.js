const router = require("express").Router();
//const KEY = process.env.STRIPE_KEY
const KEY ="sk_test_51K7g1nEkdIEftzMHKtN6WuUHQTbncl77hk5FlkqysTpbXbuQOOSOORymb3eBD9FzSkWYDVTiDmiZAPOL7Gfj5OhI00yA9vO2Iw"
const stripe=require("stripe")(KEY);

router.post("/payment", (req, res) =>{
    console.log(req.body.tokenId)
    console.log(req.body.amount)
    console.log(KEY)

    stripe.charges.create(
        {
            source: req.body.tokenId,
            amount:req.body.amount,
            currency:"usd",
        },
        (stripeErr, stripeRes) =>{
            if (stripeErr){
                res.status(500).json(stripeErr);
                console.log(stripeErr)
            }else{
                res.status(200).json(stripeRes);
                console.log(stripeRes)
            }
        }
    )
})

module.exports = router;