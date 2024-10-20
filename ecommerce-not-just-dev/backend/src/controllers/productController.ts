import { Request, Response } from "express";

// list all products
export async function listProducts(req: Request, res: Response){
    res.json({
        products: "Products will be displayed here "
    })
}

// get product by id
export async function getProductById(req: Request, res: Response){
    res.json({
        product: "Product will be displayed here "
    })
}

// create a new product
export async function createProduct(req: Request, res: Response){
    console.log(req.body)
    res.json({
        product: "Product will be created here "
    })
}

// update a product
export async function updateProduct(req: Request, res: Response){
    res.json({
        product: "Product will be updated here "
    })
}

// delete a product
export async function deleteProduct(req: Request, res: Response){
    res.json({
        product: "Product will be deleted here "
    })
}