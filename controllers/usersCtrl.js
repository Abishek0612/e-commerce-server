import User from "../model/User.js";
import bcrypt from "bcryptjs";
import asyncHandler from "express-async-handler";
import generateToken from "../utils/generateToken.js";
import { getTokenFromHeader } from "../utils/getTokenFromHeader.js";
import { verifyToken } from "../utils/verifyToken.js";

//Register user

export const registerUserCtrl = asyncHandler(async (req, res) => {
  const { fullname, email, password } = req.body;
  //Check user exist
  const userExists = await User.findOne({ email });
  if (userExists) {
    //throw
    throw new Error("User already exists");
  }
  //hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  //create the user
  const user = await User.create({
    fullname,
    email,
    password: hashedPassword,
  });
  res.status(201).json({
    status: "Success",
    message: "User Registered Successfully",
    data: user,
  });
});

//Login user (post/api/v1/users/login)

export const loginUserCtrl = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  //Find the user in db only
  const userFound = await User.findOne({
    email,
  });
  if (userFound && (await bcrypt.compare(password, userFound?.password))) {
    res.json({
      status: "success",
      message: "User logged in successfully",
      userFound,
      token: generateToken(userFound?._id),
    });
  } else {
    throw new Error("Invalid login credentials");
  }
});

//Get user profile
//Get/api/users/profile
//private

export const getUserProfileCtrl = asyncHandler(async (req, res) => {
  //find  the user
  const user = await User.findById(req.userAuthId).populate("orders")
// console.log(user)
res.json({
  status:'success',
  message:'user profile fetched successfully',
  user
})
});

//@desc Update user shipping address
//@route PUT/api/users/update/shipping
//@access Private

export const updateShippingAddressCtrl = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    address,
    city,
    postalCode,
    province,
    country,
    phone,
  } = req.body;
  const user = await User.findByIdAndUpdate(
    req.userAuthId,
    {
      shippingAddress: {
        firstName,
        lastName,
        address,
        city,
        postalCode,
        province,
        country,
        phone,
      },
      hasShippingAddress: true,
    },
    {
      new: true,
    }
  );
  res.json({
    status:"success",
    message:"User shipping address updated successfully",
    user,
  })
});
