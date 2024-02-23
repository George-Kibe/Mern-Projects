import styled from "styled-components"
import { Announcement as AnnouncementIcon } from "@material-ui/icons"
const Container=styled.div`    
    height:30px;
    background-color:teal;
    color:white;
    display:flex;
    align-items:center;
    justify-content:center;
    font-size:14px;
    font-weight:500;
`
const Announcement = () => {
  return (
    <Container>
      <AnnouncementIcon /> Announcement! Super Deal! Free Shipping over the weekend
    </Container>
  )
}

export default Announcement