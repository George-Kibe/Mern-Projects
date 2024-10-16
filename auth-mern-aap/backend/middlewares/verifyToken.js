import jwt from 'jsonwebtoken';
// verify Token Middleware
export default function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    // console.log("Bearer header: ", bearerHeader)
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        const decoded = jwt.verify(bearerToken, process.env.ACCESS_TOKEN_SECRET)
        req.userId = decoded.userId;
        next();
    } else {
        res.sendStatus(403);
    }
}

export const verifyHttpOnlyToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ 
            message: "Unauthorized, No Token Provided",
            success: false
        });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded){
            return res.status(401).json({
                message: "Unauthorized, Invalid or Expired Token",
                success: false
            });
        }
        req.userId = decoded.userId;
        next();
    } catch (error) {
        console.log("Error in verifyHTTPOnlyToken: ", error)
        return res.status(500).json({
            message: "Internal Server Error",
            success: false
        });
    }
}