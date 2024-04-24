import generateToken from "../../utils/generateToken.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const logIn = async (req, res) =>{
    try{
        const {username, password} = req.body;
        const user = await User.findOne({username});
        const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

        if(!user || !isPasswordCorrect){
            return res.status(400).json({error:"Invalid username and password"});
        }

        generateToken(user._id, res);

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            username: user.username,
            profilePic: user.profilePic,
        });

    }catch (error){
        console.log("Error in Login",error.message);
        res.status(500).json({error:"Enternal Server Error"});
    }
};

export const signUp = async (req, res) =>{
    try {
        const {fullName, username, password, confirmPassword, gender} = req.body;

        if(password !== confirmPassword){
            return res.status(400).json({error:"Password not match"});
        }

        const user = await User.findOne({username});

        if(user){
            return res.status(400).json({error:"Username already exixt"});
        }

        // HASH PASSWORD HERE
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);
        // https://avatar-placeholder.iran.liara.run/

        const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`;
        const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`;

        const newUser = new User({
            fullName, 
            username,
            password: hashPassword,
            gender,
            profilePic: gender === "male" ? boyProfilePic : girlProfilePic,
        });

        if(newUser){
            //Generate JWT Token
            generateToken(newUser._id, res);
            await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                username: newUser.username,
                profilePic: newUser.profilePic,
                gender: newUser.gender,
            });
        }else{
            res.status(400).json({error:"Invalid user data"});
        }
        

    }catch(error){
        console.log("Error in SignUp",error.message);
        res.status(500).json({error:"Enternal Server Error"});
    }
};

export const logOut = (req, res) =>{
    try{
        res.cookie("jwt", "", {maxAge: 0});
        res.status(200).json({message: "Logged out successfully"})

    }catch (error){
        console.log("Error in Logout",error.message);
        res.status(500).json({error:"Enternal Server Error"});
    }
};