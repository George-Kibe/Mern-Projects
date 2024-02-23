import styled from "styled-components"
import { mobile } from "../responsive"
import { useState } from "react"
import { login } from "../redux/apiCalls"
import { useDispatch, useSelector } from "react-redux"


const Container = styled.div`
    width:100vw;
    height:100vw;
    background:linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.9)), url("https://i.ibb.co/gjqfVBK/headphones.jpg") center;
    background-size:cover;
    display:flex;
    align-items:center;
    justify-content:center;
`
const Wrapper = styled.div`
    width:25%;    
    padding:20px;    
    background-color:white;
    ${mobile({width:"75%"})}
`
const Title = styled.h1`
    font-size:24px;
    font-weight:300;
`
const Form = styled.form`
    display:flex;
    flex-direction:column;
`

const Input = styled.input`
    flex:1;
    min-width:40%;
    margin: 10px 0px ;
    padding:10px;
`

const Button = styled.button`
    width:40%;
    border:none;
    padding:15px 20px;
    background-color:teal;
    color:white;
    cursor:pointer;
    margin-bottom: 10px;
    &:disabled{
        color:green;
        cursor:not-allowed;
    }
`
const Link=styled.a`
    margin:px 0px;
    font-size:12px;
    text-decoration:underline;
    cursor:pointer;
`
const Error = styled.span`
    color:red;
`

const Login = () => {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const dispatch = useDispatch()
    const {isFetching, error} = useSelector((state) =>state.user)

    const handleLogin = (e) =>{
        e.preventDefault();
        login(dispatch, {username, password})
    }

  return (
    <Container>
        <Wrapper>
            <Title>SIGN IN TO YOUR ACCOUNT</Title>
            <Form>                
                <Input placeholder="Username" onChange={(e) => setUsername(e.target.value)}/>                
                <Input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)}/>                
                <Button onClick={handleLogin} disabled={isFetching}>SIGN IN</Button>
                {error &&
                    <Error>Something went wrong...</Error>
                }
                <Link>FORGOT PASSWORD</Link>
                <Link>CREATE A NEW ACCOUNT</Link>
            </Form>
        </Wrapper>
    </Container>
  )
}

export default Login