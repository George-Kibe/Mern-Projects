import styled from "styled-components"
import Announcement from "../components/Announcement"
import Navbar from "../components/Navbar"
import Newsletter from "../components/Newsletter"
import Footer from "../components/Footer"
import { Add, Remove } from "@material-ui/icons"
import { mobile } from "../responsive"
import { publicRequest, userRequest } from "../requestMethods"
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { addproduct } from "../redux/cartRedux"
import { useDispatch } from "react-redux"


const Container =styled.div`

`
const Wrapper =styled.div`
    padding:50px;
    display:flex;
    ${mobile({padding:"10px", flexDirection:"column"})}

`
const ImageContainer =styled.div`
    flex:1;
`
const Image =styled.img`
    width:100%;
    height:90vh;
    object-fit:cover;
    ${mobile({height:"40vh", width:"70vw"})}
`
const InfoContainer =styled.div`
    flex:1;
    padding: 0px 50px;
    ${mobile({padding:"10px"})}

`
const Title =styled.h1`
    font-weight;200;
`
const Description =styled.p`
    margin:20px 0px;
`
const Price =styled.span`
    font-weight:100;
    font-size:40px;
`
const FilterContainer = styled.div`
    width:50%;
    margin: 30px 0px;
    display:flex;
    justify-content:space-between;
    ${mobile({width:"100%"})}
`
const Filter = styled.div`
    display:flex;
    align-items;center;
`
const FilterTitle = styled.span`
    font-size:20px;
    font-weight:200;

`
const FilterColor = styled.div`
    width:20px;
    height:20px;
    border-radius:50%;
    background-color:${(props) =>props.color};
    margin:0px 5px;
    cursor:pointer;
`
const FilterSize = styled.select`
    margin-left:10px;
    margin-right:20px;

`
const FilterSizeOption = styled.option``
const AddContainer = styled.div`
    display:flex;
    width:50%;
    align-items:center;
    justify-content:space-between;
    ${mobile({width:"100%"})}
`
const AmountContainer = styled.div`
    display:flex;
    font-weight:700;
    align-items:center;
`
const Amount = styled.span`
    width:30px;
    height:30px;
    border-radius:10px;
    border:1px solid teal;
    display:flex;
    align-items:center;
    justify-content:center;
    margin: 0px 5px;
`
const Button = styled.button`
    padding:15px;
    border:2px solid teal;
    background-color:white;
    cursor:pointer;
    font-weight:500;

    &:hover{
        background-color:#f8f4f4;
    }
`

const Product = () => {
    const location = useLocation();
    const id=location.pathname.split("/")[2]
    const [product, setProduct] = useState({})
    const [quantity, setQuantity] = useState(1)
    const [price, setPrice] = useState(0)
    const [color, setColor] = useState("")
    const [size, setSize] = useState("")
    const dispatch = useDispatch()

        
    useEffect(() =>{
        const getProduct = async ()=>{
            try{
                const res = await publicRequest.get(`/products/find/${id}`);                
                setProduct(res.data)
            }catch (error){
                console.log(error)
            }
        }
        getProduct()
    }, [id])

    const handleQuantity = (type) =>{
        if(type==="decrease" && quantity!==1){
            setQuantity(quantity-1)
        }else if(type==="increase"){
            setQuantity(quantity+1)
        }
    }

    const handleCartClick = () =>{
        dispatch(addproduct({product, quantity, price:product.price*quantity}))
    }

    return (
    <Container>
        <Announcement />
        <Navbar />
        <Wrapper>
            <ImageContainer>
                <Image src={product.image}/>
            </ImageContainer>
            <InfoContainer>
                <Title>{product.title}</Title>
                <Description>{product.description}</Description>
                <Price> $ {product.price}</Price>
                <FilterContainer>
                    <Filter>
                        <FilterTitle>Color</FilterTitle>
                        {product.color?.map((c) => (
                            <FilterColor color={c.toLowerCase()} key={c} onClick={()=>setColor(c.toLowerCase())}/>
                        ))}                               
                    </Filter>
                    <Filter>
                        <FilterTitle>Size</FilterTitle>
                        <FilterSize onChange={(e) => setSize(e.target.value)}>
                            {product.size?.map((s) =>(
                                <FilterSizeOption>{s}</FilterSizeOption>
                            ))}      
                            
                        </FilterSize>
                    </Filter>
                </FilterContainer>
                <AddContainer>
                    <AmountContainer>
                        <Remove onClick={() =>handleQuantity("decrease")} />
                        <Amount>{quantity}</Amount>
                        <Add onClick={() =>handleQuantity("increase")}  />
                    </AmountContainer>
                    <Button onClick={handleCartClick}>ADD TO CART</Button>
                </AddContainer>
            </InfoContainer>
        </Wrapper>
        <Newsletter />
        <Footer />
        
    </Container>
  )
}

export default Product