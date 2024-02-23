const { request } = require("express");
const Cart = require("../models/Cart");
const { verifyToken, verifyTokenAndAdmin, verifyTokenAndAutherization } = require("./verifyToken")

const router = require("express").Router();

//create
router.post("/", verifyToken, async (req,res) =>{
    const newCart= new Cart(req.body)
    try{
        const savedCart= await newCart.save();
        res.status(200).json(savedCart);
    }catch(error){
        res.status(500).json(error)
    }
})


//Update
router.put("/:id", verifyTokenAndAutherization, async (req, res) =>{
    try{
        const updatedCart = await Cart.findByIdAndUpdate(
            req.params.id, {$set: req.body}, {new:true}
        );
        res.status(200).json(updatedCart);
    } catch (err){
        res.status(500).json(err);
    }
});

//Delete
router.delete("/:id", verifyTokenAndAutherization, async (req, res) =>{
    try{
        await Cart.findByIdAndDelete(req.params.id);
        res.status(200).json("Cart has been deleted")
    }
    catch (err){
        res.status(500).json(err)
    }
})

//GET User Cart
router.get("/find/:userId",verifyTokenAndAutherization, async (req, res) =>{
    try{
        const cart = await Cart.findOne({userId: request.params.userId});
        res.status(200).json(cart);
    }
    catch (err){
        res.status(500).json(err);
    }
})

//GET ALL Carts
router.get("/",verifyTokenAndAdmin, async (req, res) =>{
    try{
        const carts= await Cart.find();
        res.status(200).json(carts);
    }
    catch (err){
        res.status(500).json(err);
    }
})

//Get Cart Stats
router.get("/stats", async (req, res) =>{
    const date =new Date(); //creates current date
    console.log(date)
    const lastYear= new Date(date.setFullYear(date.getFullYear() - 1 ));
    console.log(lastYear)
    try{
        const data = await Cart.aggregate([
            {$match: {createdAt:{$gte:lastYear}}},
            {
                $project:{month:{$month : "$createdAt"}},
            },
            { $group:{_id:"month", total: {$sum:1}}}
        ]);
        res.status(200).json(data)
    }catch(error){
        res.status(500).json(error);
    }
})

module.exports = router;
