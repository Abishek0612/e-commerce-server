import Order from "../model/Order.js";
import dotenv from "dotenv";
dotenv.config();
import Stripe from "stripe";
import asyncHandler from "express-async-handler";
import User from "../model/User.js";
import Product from "../model/Product.js";
// import Coupon from "../model/Coupon.js";

//@desc create orders
//@route POST/api/v1/orders
//@access private

//stripe instance
const stripe = new Stripe(process.env.STRIPE_KEY);

export const createOrderCtrl = asyncHandler(async (req, res) => {
  // //get teh coupon
  //This coupon logic is for API development we handle it in the frontend so we commented it
  // const { coupon } = req?.query;

  // const couponFound = await Coupon.findOne({
  //   code: coupon?.toUpperCase(),
  // });
  // if (couponFound?.isExpired) {
  //   throw new Error("Coupon has expired");
  // }
  // if (!couponFound) {
  //   throw new Error("Coupon does exists");
  // }

  //get discount
  // const discount = couponFound?.discount / 100;  (we are going to do the calculation in client side)

  //Get the payload(customer, orderItems, shippingAddress, totalPrice);
  const { orderItems, totalPrice } = req.body;

  
  // console.log({
  //   orderItems,
  //   shippingAddress,
  //   totalPrice,
  // });
  //find the user
    // Find the user and include the shippingAddress in the response
    const user = await User.findById(req.userAuthId).select('+shippingAddress');


  // Check if user has a shipping address or if it's provided in the request body
  const shippingAddress = req.body.shippingAddress || user.shippingAddress;

  if (!shippingAddress) {
    throw new Error("Shipping address is required.");
  }


  //check if order is not empty
  if (orderItems?.length <= 0) {
    throw new Error("No Order Items");
  }
  //Place/create order - save into DB
  const order = await Order.create({
    user: user?._id,
    orderItems,
    shippingAddress, // This now comes from above logic

    totalPrice,
    // totalPrice: couponFound ? totalPrice - totalPrice * discount : totalPrice,
  });
  console.log(order);

  //Update the product qty
  const products = await Product.find({ _id: { $in: orderItems } });

  orderItems?.map(async (order) => {
    const product = products?.find((product) => {
      return product?._id?.toString() === order?._id.toString();
    });
    if (product) {
      product.totalSold += order.qty;
    }
    await product.save();
  });
  //push order into user
  user.orders.push(order?._id);
  await user.save();
  //make payment(stripe)
  //convert order items to have same structure that stripe need
  const convertedOrders = orderItems.map((item) => {
    return {
      price_data: {
        currency: "inr",
        product_data: {
          name: item?.name,
          description: item?.description,
        },
        unit_amount: item?.price * 100,
      },
      quantity: item?.qty,
    };
  });
  const session = await stripe.checkout.sessions.create({
    line_items: convertedOrders,
    metadata: {
      orderId: JSON.stringify(order?._id),
    },
    mode: "payment",
    success_url: "http://localhost:3000/success",
    cancel_url: "http://localhost:3000/cancel",
  });

  res.send({ url: session.url });
});

//@desc get all orders
//@route GET/api/v1/orders
//@access private

export const getAllordersCtrl = asyncHandler(async (req, res) => {
  //find all orders
  const orders = await Order.find().populate("user");
  res.json({
    success: true,
    message: "All orders",
    orders,
  });
});



//@desc get single orders
//@route Get/api/orders/:id
//@access private/admin

export const getSingleOrderCtrl = asyncHandler(async (req, res) => {
  //get the id from the params
  const id = req.params.id;
  const orders = await Order.findById(id);
  //send response
  res.json({
    success: true,
    message: "Single order",
    orders,
  });
});

//@desc update order to deliver
//@route PUT/api/v1/orders/update/:id
//@access private/admin

//we are mentioning status coz in Order.js model in status there will be pending, delivered, proccessing, shipped we need to update it to it
export const updateOrderCtrl = asyncHandler(async (req, res) => {
  const id = req.params.id;
  //update
  const updateOrder = await Order.findByIdAndUpdate(
    id,
    {
      status: req.body.status,
    },
    {
      new: true,
    }
  );
  res.status(200).json({
    success: true,
    message: "Order updated",
    updateOrder,
  });
});

//@desc get sales sum of orders
//@route Get /api/v1/orders/sales/sum
//@access private/admin

export const getOrderStatsCtrl = asyncHandler(async (req, res) => {
  //sum of sales
  //get  order stats
  const orders = await Order.aggregate([
    {
      $group: {
        _id: null,
        minimumSale: {
          $min: "$totalPrice",
        },
        totalSales: {
          $sum: "$totalPrice",
        },
        maximumSale: {
          $max: "$totalPrice",
        },
        avgSale: {
          $avg: "$totalPrice",
        },
      },
    },
  ]);

  //get the date (gte means greater than or equal to)
  const date = new Date();
  const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const saleToday = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: today,
        },
      },
    },
    {
      $group: {
        _id: null,
        totalSales: {
          $sum: "$totalPrice",
        },
      },
    },
  ]);

  //send response
  res.status(200).json({
    success: true,
    message: "Sum of orders",
    orders,
    saleToday,
  });
});

// Your webhook signing secret is whsec_a26783484c7cba6d11f94abbd16dd423f9a03d3fc167a908386494ff10ac615d (^C to quit)
