import { Router } from "express";
import { 
    listProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
 } from "../../controllers/productController";

 import {z} from 'zod';
import { validateData } from "../../middlewares/validationMiddleware";
import { createProductSchema, updateProductSchema } from "../../db/productSchema";

// const createProductSchema = z.object({
//     name: z.string().min(1, { message: "Name is required" }),
//     description: z.string().min(1, { message: "Description is required" }),
//     price: z.number().min(1, { message: "Price is required" }),
//     //category: z.string().min(1, { message: "Category is required" }),
//     //quantity: z.number().min(1, { message: "Quantity is required" }),
// })
const router = Router();

router.get("/", listProducts)
router.get("/:id", getProductById)
router.post("/", validateData(createProductSchema),  createProduct)
router.put("/:id", validateData(updateProductSchema) ,updateProduct)
router.delete("/:id", deleteProduct)

export default router;