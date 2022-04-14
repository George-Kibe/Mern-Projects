import styled from "styled-components"

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
    padding:20px;
    width:25%;
    background-color:white;
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
`
const Link=styled.a`
    margin:px 0px;
    font-size:12px;
    text-decoration:underline;
    cursor:pointer;
`

const Login = () => {
  return (
    <Container>
        <Wrapper>
            <Title>SIGN IN TO YOUR ACCOUNT</Title>
            <Form>                
                <Input placeholder="Username" />                
                <Input placeholder="Password" />                
                <Button>SIGN IN</Button>
                <Link>FORGOT PASSWORD</Link>
                <Link>CREATE A NEW ACCOUNT</Link>
            </Form>
        </Wrapper>
    </Container>
  )
}

export default Login