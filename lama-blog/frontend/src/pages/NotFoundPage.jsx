import { Link } from "react-router";
import StateMessage from "../components/StateMessage";

const NotFoundPage = () => (
  <div className="container-page py-16">
    <StateMessage
      title="Page not found"
      body="The page you're looking for isn't in the catalog."
      action={<Link to="/posts" className="btn btn-primary">Browse all posts</Link>}
    />
  </div>
);

export default NotFoundPage;
