import User from "../models/usermode.js"
import sendemail from "../utils.js/sendemail.js";
import Apperror from "../utils.js/utils.js";
import cloudinary from "cloudinary"
import fs from  'fs/promises';

const cookiesoption ={
    maxage: 7*24*60*60*1000,
    httponly: true,
    secure: true,
}

const Register= async (req, res, next)=>{
    const {fullname, email, password}= req.body

    if(!fullname || !email || !password){
        return next (new Apperror('All fields are required', 400))
    }
    
    const userexist= await User.findOne({email})
    
    if(userexist){
        return next (new Apperror('User already exist', 400))
    }
    
    const user = await User.create({
        fullname,
        email,
        password,
        avatar: {
        public_id: email,
        secure_url:'https://res.cloudinary.com/dvhcu6di8/image/upload/v1691039851/lms/cuoyoiibnbb6xhldxru9.png'
        }   
    });
    if(!user){
        return next (new Apperror('User registration failed', 400))
    }

    // TODO file upload
    console.log('File details >',JSON.stringify(req.file))
    if(req.file){
    try {

        const result = await cloudinary.v2.uploader.upload(req.file.path, {
            folder: 'lms',
            width: 250,
            height: 250,
            gravity: 'face',
            crop: 'fill'
        })
        if(result){
            user.avatar.public_id= result.publicid;
            user.avatar.secure_url= result.secureurl;

            // remove file from local
            fs.rm(`uploads/${req.file.filename}`)
        }
    } catch (e) {
        return next(
            new Apperror(e || 'file not uploaded, please try again', 500)
        )
    }
}
    await user.save();
    user.password=undefined

    const token = await user.generatejwttoken();

    res.cookie('token', token, cookiesoption)

     res.status(200).json({
        success: true,
        message: 'User registered successfully',
        user
    })
}
const login= async(req, res, next)=>{
    try {
    const {email, password} = req.body
    if(!email || !password){
        return next(new Apperror('fields are required', 400))
    }
    const user = await User.findOne({email}).select('+password');

    if(!user || !user.comparepassword(password)) {
        return next(new Apperror('email or password does not match', 400))
    }
    const token = await user.generatejwttoken();
    user.password= undefined;
     res.cookie('token', token, cookiesoption);

     res.status(200).json({
        success: true,
        message: 'user logged in successfully',
        user,
     })
    }catch (error) {
      return next(new Apperror(error.message, 500))
}
}
const logout=(req, res)=>{
    res.cookie('token', null, {
        secure: true,
        maxage: 0,
        httponly: true,
    })
    res.status(200).json({
        success: true,
        message: 'User logged out successfully'
    })
}
const Profile=async(req, res)=>{
    try {
        const userid= req.user.id;
        const user= await User.findById(userid)

        return res.status(200).json({
            success: true, 
            message: 'User details',
            user
        })
    } catch (e) {
        return next(new Apperror('failed to fetch details', 400))
    }
}

const forgotpassword= async(req, res, next)=>{
    const {email}= req.body;
    if(!email){
return next(new Apperror('email is required', 400))
}
const user=await User.findOne({email})
if(!user){
        return next(new Apperror('email not registered ', 400))
    }
    const resettoken= await user.generatepasswordresettoken();

    await user.save();
    const resetpasswordurl= `${process.env.FRONTENT_URL}/reset-password${resettoken}`
    const subject='Reset Password';
    const message=`You can reset your password by clicking <a href= ${resetpasswordurl} target= "_blank"> Reset Your password</a> \n If the above link does not work for some reason then copy paste this link in new tab ${resetpasswordurl}.\n If you have not requested this, kindly ignore.`
    try{
        await sendemail(email, subject, message)
        res.status(200).json({
            success: true,
            message: `reset password has been sent to ${email} successfully`
        })
    } catch (e) {
        user.forgetpasswordexpiry= undefined;
        user.forgetpasswordtoken= undefined;

        await user.save();  
        return next(new Apperror(e.message, 500))
    }
}

const resetpassword= ()=>{

}
export {
    Register,
    login,
    logout,
    Profile,
    forgotpassword,
    resetpassword
    }
