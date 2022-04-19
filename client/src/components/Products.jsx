import styled from 'styled-components'
import { popularProducts } from '../data'
import Product from './Product'
import { useEffect, useState } from 'react'
import axios from 'axios'
const Container = styled.div`
    padding:20px;
    display:flex;
    flex-wrap:wrap;
    justify-content:space-between;
`

const Products = ({category, filter, sort}) => {
  // console.log({category, filter, sort})
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() =>{
    const getProducts= async () =>{
      try{
        const res = await axios.get(category ? `http://localhost:5000/api/products?category=${category}` : "http://localhost:5000/api/products")
        setProducts(res.data)
      } catch(error){

      }
    }
    getProducts()
  }, [category, filter, sort])

  return (
    <Container>
        {products.map((item) =>(
            <Product item={item} key={item.id}/>
        ))}
    </Container>
  )
}

export default Products