import Product from "../model/Product.js";
import Review from "../model/Review.js";
import asyncHandler from "express-async-handler";

//@desc  Create  new review
//@route POST/api/v1/reviews
//@access Private/Admin

export const createReviewCtrl = asyncHandler(async (req, res) => {
  const { product, message, rating } = req.body;
  //1.Find the product
  const { productID } = req.params;
  const productFound = await Product.findById(productID).populate("reviews");
  if (!productFound) {
    throw new Error("Product Not Found");
  } 

  //check if user already reviewd this product( to avoid duplication of a review)
  const hasReviewed = productFound?.reviews?.find((review) => {
    console.log(review)
    return review?.user?.toString() === req.userAuthId?.toString();
  });

  if(hasReviewed){
    throw new Error("You already reviewed this product")
  }
  //create review
  const review = await Review.create({
    message,
    rating,
    product: productFound?._id,
    user: req.userAuthId,
  });
  //push review into product Found
  productFound.reviews.push(review?._id);
  //resave
  await productFound.save();

  res.status(201).json({
    success: true,
    message: "Review created successfully",
  });
});
