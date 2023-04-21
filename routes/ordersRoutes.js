import express from 'express';
import { createOrderCtrl, getAllordersCtrl, getOrderStatsCtrl, getSingleOrderCtrl, updateOrderCtrl } from '../controllers/orderCtrl.js';
import { isLoggedIn } from '../middlewares/isLoggedIn.js';


const orderRoutes = express.Router();

orderRoutes.post('/', isLoggedIn, createOrderCtrl)
orderRoutes.get('/', isLoggedIn, getAllordersCtrl)
orderRoutes.get('/sales/stats', isLoggedIn, getOrderStatsCtrl)
orderRoutes.get('/:id', isLoggedIn, getSingleOrderCtrl)
orderRoutes.put('/update/:id', isLoggedIn, updateOrderCtrl)

export default orderRoutes;