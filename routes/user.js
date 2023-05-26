var express = require("express");
var router = express.Router();
const controller = require("../controller/usercontrol");
const authentication = require("../middleware/middlewares");

//user home
router.get("/", controller.getHome);

//user login
router.route("/login").get(controller.showLogin).post(controller.postLogin);

//user signup
router.route("/signup").get(controller.showSignup).post(controller.postSignup);

//user shop
router.get("/shop", authentication.userAuth, controller.shopView);

//user category
router.get('/category/:id',controller.getCategory)


//sort
router.get('/sort',authentication.userAuth,controller.postSort)

//user logout
router.get("/logout", controller.userlogout);

//user get otp
router.get("/otplogin", controller.showotp);

//user post otp
router.post("/sendOtp", controller.postotp);

//user zoom-view
router.get("/zoomView/:id", authentication.userAuth, controller.zoomshopView);

//user add-to-cart
router.get("/add-to-cart/:id", authentication.userAuth, controller.addToCart);

router.get("/cart", authentication.userAuth, controller.getCartProducts);

router.get(
  "/delete-cart-product/:id",
  authentication.userAuth,
  controller.deleteCartProduct
);

router.post(
  "/change-product-quantity",
  authentication.userAuth,
  controller.changeQuantity
);

//user wish-List-management
router.get("/wishlist/:id", authentication.userAuth, controller.getWishlist);

//view-wishlist
router.get("/view-wishlist", authentication.userAuth, controller.viewWishList);

//delete-wishlist
router.delete(
  "/delete_wishlist",
  authentication.userAuth,
  controller.deleteWishList
);

//get profile
router.get("/profile", authentication.userAuth, controller.profile);

router.post("/profile", authentication.userAuth, controller.postAddress);

router.post("/save", authentication.userAuth, controller.accountDetails);

router.get(
  "/deleteAddress/:id",
  authentication.userAuth,
  controller.deleteAddress
);

router.get(
  "/editAddress/:id",
  authentication.userAuth,
  controller.getEditAddress
);

router.post(
  "/editAddress/:id",
  authentication.userAuth,
  controller.postEditAddress
);

//user place-order
router.get("/place-order", authentication.userAuth, controller.getPlaceOrder);

router.post("/place-order", authentication.userAuth, controller.postPlaceOrder);

//user order-success
router.get("/order-success", authentication.userAuth, controller.orderSuccess);

router.get("/orders", authentication.userAuth, controller.getOrders);

//user view-orders
router.get(
  "/view-order-products/:id",
  authentication.userAuth,
  controller.getOrderProducts
);
router.get(
  "/order-cancel/:id",
  authentication.userAuth,
  controller.getOrderCancel
);
router.get(
  "/order-return/:id",
  authentication.userAuth,
  controller.getOrderReturn
);

//coupon
router.post("/apply-coupon", authentication.userAuth, controller.applyCoupon);

//razorpay
router.post(
  "/verify-payment",
  authentication.userAuth,
  controller.verifyPayment
);

//search item 
router.get('/search',controller.search)

//search empty
router.get('/searchEmpty',controller.searchempty)

module.exports = router;
