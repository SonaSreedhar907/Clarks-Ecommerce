var express = require("express");
const { getMaxListeners } = require("../app");
var router = express.Router();
const adminControl = require("../controller/admincontrol");
const db = require("../model/connection");
const photoload = require("../multer/multer");
const authentication = require("../middleware/middlewares");

//display dashboard
router.get("/", authentication.adminAuth, adminControl.displayDashboard);

//admin-login
router
  .route("/login")
  .get(adminControl.getAdminLogin)
  .post(adminControl.postAdminLogin);

//admin-logout
router.get("/logout", adminControl.adminLogout);

//admin-userlist
router.get("/view-users", authentication.adminAuth, adminControl.getUserlist);

//admin block-the-user
router.get(
  "/block-users/:id",
  authentication.adminAuth,
  adminControl.blockTheUser
);

//admin unblock-the-user
router.get(
  "/unblock-users/:id",
  authentication.adminAuth,
  adminControl.unblockTheUser
);

//admin add-product
router
  .route("/add-product")
  .all(authentication.adminAuth)
  .get(adminControl.addProducts)
  .post(photoload.uploads.array("images", 4), adminControl.postProducts);

//admin view-product
router.get(
  "/view-product",
  authentication.adminAuth,
  adminControl.viewProducts
);

//admin edit-product
router
  .route("/edit-product/:id")
  .all(authentication.adminAuth)
  .get(adminControl.editProduct)
  .post(photoload.uploads.array("images", 4), adminControl.post_EditProduct);

//admin delete-the-product
router.get(
        "/delete-product/:id",
        authentication.adminAuth,
        adminControl.deleteTheProduct
      );
      
//admin add-category
router
  .route("/add-category")
  .all(authentication.adminAuth)
  .get(adminControl.getCategory)
  .post(adminControl.postCategory);

//delete-the-category
router.get(
  "/delete-category/:id",
  authentication.adminAuth,
  adminControl.deleteCategory
);

//edit-the-category
router.get(
  "/edit-category/:id",
  authentication.adminAuth,
  adminControl.editTheCategory
);

//post the edit-category
router.post(
  "/edit-category/:id",
  authentication.adminAuth,
  adminControl.postEditCategory
);

//view-orders
router.get("/orders", authentication.adminAuth, adminControl.orders);
router.get(
  "/order-details/:id",
  authentication.adminAuth,
  adminControl.getOrderProducts
);

//status of orders
router.post(
  "/order-status/:id",
  authentication.adminAuth,
  adminControl.postEditStatus
);

//get coupon
router.get("/add-coupons", authentication.adminAuth, adminControl.addCoupons);

//post coupon
router.post(
  "/add-coupons",
  authentication.adminAuth,
  adminControl.addNewCoupon
);

//admin view-coupon
router.get("/view-coupons", authentication.adminAuth, adminControl.viewCoupon);

//admin edit-coupon
router.get(
  "/edit-coupon/:id",
  authentication.adminAuth,
  adminControl.editCoupon
);

//post the view-coupon
router.post(
  "/edit-coupon/:id",
  authentication.adminAuth,
  adminControl.postEditCoupon
);

//delete the coupon
router.get(
  "/delete-coupon/:id",
  authentication.adminAuth,
  adminControl.deleteCoupon
);

//get the sales
router.get("/sales", authentication.adminAuth, adminControl.getSales);

//post the sales
router.post("/sales", authentication.adminAuth, adminControl.getSalesFilter);

module.exports = router;
