import { Facebook, Instagram, MailOutline, Phone, Pinterest, Room, Twitter, WhatsApp } from "@material-ui/icons"
import styled from "styled-components"

const Container = styled.div`
    display:flex;
    flex-direction:row;
    padding:20px;
`
const Left = styled.div`
    flex:1;
`
const Logo = styled.h1`
    
`
const Description = styled.p`
    margin:20px 0px;
`
const SocialContainer = styled.div`
    display:flex;
`
const SocialIcon = styled.div`
    width:40px;
    height:40px;
    border-radius:50%;
    color:white;
    background-color:#${props => props.color};
    display:flex;
    align-items:center;
    justify-content:center;
    margin-right:10px;

`
const Center = styled.div`
    flex:1;
    padding:20px;
`
const Title= styled.h3`
    margin-bottom:30px;

`
const List=styled.ul`
    margin:0;
    padding:0;
    list-style:none;
    display:flex;
    flex-wrap:wrap;
`
const ListItem =styled.li`
    width:50%;
    margin-bottom:10px;

`

const Right = styled.div`
    flex:1;
    padding:20px;
`
const ContactItem=styled.div`
    margin-bottom:20px;
    display:flex;
    align-items:center;
`
const Payment = styled.img`
    width:100%;

`

const Footer = () => {
  return (
    <Container>
        <Left>
            <Logo>Buenas Group Inc.</Logo>
            <Description>We Offer a wide range of products and services from Real estate, research, web development and design etc...</Description>
            <SocialContainer>
                <SocialIcon color="3B5999">
                    <Facebook />
                </SocialIcon>
                <SocialIcon color="E1306C">
                    <Instagram />
                </SocialIcon>
                <SocialIcon color="E60023">
                    <Pinterest />
                </SocialIcon>
                <SocialIcon color="55ACEE">
                    <Twitter />
                </SocialIcon>
                <SocialIcon color="25D366">
                    <WhatsApp />
                </SocialIcon>
            </SocialContainer>
        </Left>
        <Center>
            <Title>Useful Links</Title>
            <List>
                <ListItem>Home</ListItem>
                <ListItem>Cart</ListItem>
                <ListItem>Checkout</ListItem>
                <ListItem>Man's fashion</ListItem>
                <ListItem>Woman's Fashion</ListItem>
                <ListItem>Accessories</ListItem>
                <ListItem>My Account</ListItem>
                <ListItem>Order Tracking</ListItem>
                <ListItem>Wish List</ListItem>
                <ListItem>Terms and Conditions</ListItem>
            </List>
        </Center>
        <Right>
            <Title>Contact</Title>
            <ContactItem><Room style={{marginRight:"10px"}}/> 00100, GPO Nairobi KCB Towers</ContactItem>
            <ContactItem><Phone style={{marginRight:"10px"}}/> +254 704 817 466</ContactItem>
            <ContactItem><MailOutline style={{marginRight:"10px"}}/> georgekibew@gmail.com</ContactItem>
            <Payment src="https://i.ibb.co/Qfvn4z6/payment.png" />
        </Right>
    </Container>
  )
}

export default Footer