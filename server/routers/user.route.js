import { Router } from "express";
import {Register, login, logout, Profile, forgotpassword, resetpassword} from '../controllers/authcontroller.js'
import { isloggedin } from "../middleware/authmidlleware.js";
import upload from "../middleware/multer.middleware.js";

const route= Router();

route.post('/register', upload.single('avatar'), Register)
route.post('/login', login)
route.post('/logout', logout)
route.post('/me', isloggedin, Profile)
route.post('/reset', forgotpassword)
route.post('/reset/:resettoken', resetpassword)

export default route;