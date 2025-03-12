import { Link } from "react-router-dom";

const HomePage = () => {
    return(
        <>
            <p>THIS IS THE HOME PAGE</p>
            <Link to="/registration">To Registration (using QR)</Link> <br/>
            <Link to="/altregistration">To Registration</Link>
        </>
    )
}

export default HomePage