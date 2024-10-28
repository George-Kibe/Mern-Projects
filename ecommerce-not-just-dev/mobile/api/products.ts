const API_URL = process.env.EXPO_PUBLIC_API_URL;
import axios from "axios";

export async function listProducts(){
    try {
        const response = await axios.get(`${API_URL}/api/products`);
        if (response.status === 200) {
            return response.data.products;
        }
    } catch (error) {
        console.error("Error fetching products: ", error);
        return null;
    }

}

export async function getProductById(sid:number) {
    try {
        const response = await axios.get(`${API_URL}/api/products/${sid}`);
        if (response.status === 200) {
            return response.data.product;
        }
    } catch (error) {
        console.error("Error fetching product: ", error);
        return null;
    }
}