import {useState,useHistory, useEffect} from 'react'
import StripeCheckout from 'react-stripe-checkout'
import axios from 'axios';
const KEY ="pk_test_51K7g1nEkdIEftzMH6rESvfaC10tC8HRv9CUwwvAImywuROtXvVqZDl0xnSGWfvA0EshZtfer0C0NbtmzFpgttyhP00cAbONgOG"

const Pay = () => {
  const [stripeToken, setStripeToken] = useState(null);
  const history=useHistory()

  const onToken = (token) =>{
    setStripeToken(token)
    console.log(token)
  }
  useEffect(() =>{
    const makeRequest = async () =>{
      try{
        const res = await axios.post("http://localhost:5000/api/checkout/payment", {
          tokenId:stripeToken.id,
          amount:10000,
        })
        console.log(res.data)
        history.push("/success")
      }catch(error){
        console.log(error)
      }
    };
    stripeToken && makeRequest()
  }, [stripeToken, history])

  return (
    <div style={{
      height:"100vh",
      display:"flex",
      alignItems:"center",
      justifyContent:"center",
    }}>
      {stripeToken ? (
        <span>Processing. Please Wait...</span>
      ) : (
        <StripeCheckout
          name="Buenas E-Store"
          image="https://avatars.githubusercontent.com/u/1486366?v=4"
          billingAddress
          shippingAddress
          description='Your Total is $100'
          amount={10000}
          token={onToken}
          stripeKey={KEY}
          >
          <button style={{
            border:"none",
            width:120,
            borderRadius:5,
            padding:"20px",
            backgroundColor:"black",
            color:"white",
            fontWeight:"600",
            cursor:"pointer", 
          }}>
            Pay Now
          </button>
          </StripeCheckout>
      )}
    </div>
  )
}

export default Pay