var express = require('express');
var router = express.Router();
const controller= require("../controller/usercontrol")
const authentication = require('../middleware/middlewares')



router.get('/',controller.getHome)


router.route('/login')
        .get(controller.showLogin)
        .post(controller.postLogin)

router.route('/signup')
    .get(controller.showSignup)
    .post(controller.postSignup)

//shop    
router.get('/shop',authentication.userAuth,controller.shopView)

//category

router.get('/shop/:id',authentication.userAuth,controller.categoryWork)

router.get('/logout',controller.userlogout)

router.get('/otplogin',controller.showotp)

router.post('/sendOtp',controller.postotp)

router.get('/zoomView/:id',authentication.userAuth,controller.zoomshopView)

//cart

router.get('/add-to-cart/:id',authentication.userAuth,controller.addToCart)

router.get('/cart',authentication.userAuth,controller.getCartProducts)

router.get('/delete-cart-product/:id',authentication.userAuth,controller.deleteCartProduct)

router.post('/change-product-quantity',authentication.userAuth,controller.changeQuantity) 


//wish List management

router.get('/wishlist/:id',authentication.userAuth,controller.getWishlist)

router.get('/view-wishlist',authentication.userAuth,controller.viewWishList)

router.delete('/delete_wishlist',authentication.userAuth, controller.deleteWishList)

//profile

 router.get('/profile',authentication.userAuth,controller.profile)

router.post('/profile',authentication.userAuth,controller.postAddress)

router.post('/save',authentication.userAuth,controller.accountDetails)

router.get('/deleteAddress/:id',authentication.userAuth,controller.deleteAddress)

router.get('/editAddress/:id',authentication.userAuth,controller.getEditAddress)

router.post('/editAddress/:id',authentication.userAuth,controller.postEditAddress)



//place-order

router.get('/place-order',authentication.userAuth,controller.getPlaceOrder)

router.post('/place-order',authentication.userAuth,controller.postPlaceOrder)

//order success

router.get('/order-success',authentication.userAuth,controller.orderSuccess)

router.get('/orders',authentication.userAuth,controller.getOrders)

//view orders

router.get('/view-order-products/:id',authentication.userAuth,controller.getOrderProducts)

router.get('/order-cancel/:id',authentication.userAuth,controller.getOrderCancel)

router.get('/order-return/:id',authentication.userAuth,controller.getOrderReturn)

//coupon
router.post('/apply-coupon',authentication.userAuth,controller.applyCoupon)

//razorpay
router.post('/verify-payment',authentication.userAuth,controller.verifyPayment)




module.exports = router;
