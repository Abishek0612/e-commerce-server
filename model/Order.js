import mongoose from "mongoose";
const Schema = mongoose.Schema;

//Generate random numbers for orderNumber
const randomTxt = Math.random().toString(36).substring(7).toLocaleUpperCase();
const randomNumbers = Math.floor(1000 + Math.random() * 90000);

const OrderSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      Ref: "User",
      required: true,
    },
    orderItems: [
      {
        type: Object,
        required: true,
      },
    ],
    shippingAddress: {
      //shippingAddress coming from User model
      type: Object,
      required: true,
    },
    orderNumber: {
      type: String,
      required: true,
      default: randomTxt + randomNumbers,
    },
    //for stripe payment
    paymentStatus: {
      type: String,
      default: "Not paid",
    },
    paymentMethod: {
      type: String,
      default: "Not specified",
    },
    totalPrice: {
      type: Number,
      default: 0.0,
    },
    currency: {
      type: String,
      default: "Not specified",
    },
    //for Admin
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "proccessing", "shipped", "delivered"],
    },
    deliveredAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);


//compile to form model
const Order = mongoose.model("Order", OrderSchema);

export default Order;