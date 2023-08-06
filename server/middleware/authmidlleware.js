import Apperror from "../utils.js/utils.js";
import  jwt  from "jsonwebtoken";

const isloggedin= async (req, res, next)=>{
    const {token}= req.cookies;

    if(!token){
        return next(new Apperror('Unauthentication please logged in again', 401))
    }

    const userdetail= await jwt.verify(token, process.env.jwt_secret)
    req.user= userdetail;
    next();
}
export {
    isloggedin
}