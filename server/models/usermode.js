import { Schema, model } from "mongoose";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto'

const userschema = new Schema({
    fullname:{
        type: 'String',
        required: [true, 'Name is required'],
        minlength: [3, 'Name must be at least 3 character '],
        maxlength: [20, 'Name should be less than 20 character'],
        trim: true,
        lowercase: true,
    },
    email:{
        type: 'String',
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true,
        unique: true,
        match: [
            /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
            'Please fill in a valid email address'
        ],
    },
    password:{
        type: 'String',
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 character'],
        select: false,  //password don't show
    },
    avatar: {
        public_id:{
            type: 'String'
        },
        secure_url: {
            type: 'String'
        },
    },
    role:{
        type: String,
        enum: ['USER', 'ADMIN'],
        default: 'USER',
    },
        forgetpasswordtoken : String,
        forgetpasswordexpiry: Date,
},{ timestamps: true,   

});

 userschema.pre('save', async function (next){
    if(!this.isModified('password')){
       return next(); 
    }
    this.password= await bcrypt.hash(this.password, 10)
}) 
userschema.methods={
    generatejwttoken: async function(){
        return await jwt.sign(
        {id: this._id, email: this.email, subscription: this.subscription, role: this.role},
        process.env.jwt_secret,
        {
            expiresIn: process.env.jwt_expiry,
        }
        )
    },
    comparepassword: async function(plaintextpassword){
        return await bcrypt.compare(plaintextpassword, this.password)
    },
    generatepasswordresettoken: async function(){
        const resettoken= crypto.randombytes(20).toString('hex');

        this.forgetpasswordtoken= crypto
        .createHash('sha256')
        .update(resettoken)
        .digest('hex')
        this.forgetpasswordexpiry= Date.now() +  15*60*1000; //15min for now
        return  resettoken;
    }
}
const User = model('User', userschema)

export default User;