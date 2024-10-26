import { Request, Response } from "express";
import { db } from "../db";
import { productsTable } from "../db/productSchema";
import { eq } from "drizzle-orm";
import _ from 'lodash';

// list all products
export async function listProducts(req: Request, res: Response){
    try {
        const products = await db.select().from(productsTable)
        res.json({
            message: "success",
            products: products,
            statusCode: 200
        })
    } catch (error) {
        res.status(500).json({
            error: "Something went wrong"
        })
    }
}

// get product by id
export async function getProductById(req: Request, res: Response){
    try {
        const { id } = req.params;
        const [product] = await db.
            select()
            .from(productsTable)
            .where(eq(productsTable.id, Number(id)))
        if (!product) {
            return res.status(404).json({
                message: "Product not found",
                statuscode: 404
            })
        }
        res.json({
            message: "success",
            product: product,
            statusCode: 200
        })
    } catch (error) {
        res.status(500).json({
            error: "Something went wrong"
        })
    }
}

// create a new product
export async function createProduct(req: Request, res: Response){
    try {
        const [product] = await db.
            insert(productsTable).
            values(req.cleanBody).
            returning();

        res.status(201).json({
            message: "Product created successfully",
            product: product,
            statusCode: 201
        })
        
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: "Something went wrong"
        })
    }
}

// update a product
export async function updateProduct(req: Request, res: Response){
   try {
    const id = Number(req.params.id);
    const updatedFields = req.cleanBody;
    const [updatedProduct] = await db
        .update(productsTable)
        .set(updatedFields)
        .where(eq(productsTable.id, id))
        .returning();

    if (!updatedProduct) {
        return res.status(404).json({
            message: "Product not found",
            statusCode: 404
        })
    }
    res.json({
        message: "Product updated successfully",
        product: updatedProduct,
        statusCode: 200
    })
   } catch (error) {
        res.status(500).json({
            error: "Something went wrong"
        })
   }
}

// delete a product
export async function deleteProduct(req: Request, res: Response){
    try {
       const [deletedProduct] = await db
            .delete(productsTable)
            .where(eq(productsTable.id, Number(req.params.id)))
            .returning();

        if (!deletedProduct) {
            return res.status(404).json({
                message: "Product not found",
                statusCode: 404
            })
        }
        res.status(200).json({
            message: "Product deleted successfully",
            statusCode: 200
        })        
    } catch (error) {
        res.status(500).json({
            error: "Something went wrong"
        })
    }
}