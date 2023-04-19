import express from 'express';
import { createOrderCtrl } from '../controllers/orderCtrl.js';
import { isLoggedIn } from '../middlewares/isLoggedIn.js';


const orderRoutes = express.Router();

orderRoutes.post('/',isLoggedIn, createOrderCtrl)

export default orderRoutes;