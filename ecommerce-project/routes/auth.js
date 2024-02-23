const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt =require("jsonwebtoken");


//Register
router.post("/register", async (req, res) =>{
    const newUser = new User({
        username:req.body.username,
        email:req.body.email,
        password:CryptoJS.AES.encrypt(req.body.password, process.env.PASS_SEC).toString(),
    });
    try{
        const savedUser= await newUser.save();
        console.log(savedUser);
        res.status(201).json(savedUser);
    }catch (err){
        res.status(500).json(err);
    }    
});

//Login
router.post("/login", async (req, res) =>{
    try{
        const user = await User.findOne({username: req.body.username});
        !user && res.status(401).json("Wrong credentials")
        //if there is no user response will be...
        const hashedPassword = CryptoJS.AES.decrypt(user.password, 
            process.env.PASS_SEC);
        const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8); 

        //if password is not equal to input password
        originalPassword !==req.body.password && res.status(401).json("Wrong credentials")
        
        const accessToken = jwt.sign({
            id:user._id, isAdmin:user.isAdmin,
        }, process.env.JWT_SEC, {expiresIn:"3d"}
        );

        const { password, ...others } = user._doc;

        res.status(200).json({...others, accessToken});
    }
    catch (error){
        res.status(500).json(error);
        
    }
})

module.exports = router;






