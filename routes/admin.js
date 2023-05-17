var express = require('express');
const { getMaxListeners } = require("../app");
var router = express.Router();
const adminControl = require('../controller/admincontrol')
// const adminHelper = require('../helpers/adminHelpers');
const db = require('../model/connection')
//const multer = require('multer')
const photoload = require('../multer/multer')
const authentication = require('../middleware/middlewares')

router.get('/',authentication.adminAuth,adminControl.displayDashboard)

//login   
router.route('/login')
.get(adminControl.getAdminLogin)
    .post(adminControl.postAdminLogin)
    
//logout
router.get('/logout',adminControl.adminLogout)

//userlist
router.get('/view-users',authentication.adminAuth,adminControl.getUserlist)

router.get('/block-users/:id',authentication.adminAuth,adminControl.blockTheUser)

router.get('/unblock-users/:id',authentication.adminAuth,adminControl.unblockTheUser)

//product
router.route("/add-product")
        .all(authentication.adminAuth)
        .get(adminControl.addProducts)
        .post(photoload.uploads.array('images',4), adminControl.postProducts)

router.get('/view-product',authentication.adminAuth, adminControl.viewProducts)

router.route('/edit-product/:id')
        .all(authentication.adminAuth)
        .get(adminControl.editProduct)
        .post(photoload.uploads.array('images',4),adminControl.post_EditProduct)

//category
router.route('/add-category')
        .all(authentication.adminAuth)
        .get(adminControl.getCategory)
        .post(adminControl.postCategory)

router.get('/delete-product/:id',authentication.adminAuth,adminControl.deleteTheProduct)

router.get("/delete-category/:id",authentication.adminAuth,adminControl.deleteCategory)

router.get('/edit-category/:id',authentication.adminAuth,adminControl.editTheCategory)

router.post('/edit-category/:id',authentication.adminAuth,adminControl.postEditCategory)

//orders

router.get('/orders',authentication.adminAuth,adminControl.orders)

router.get('/order-details/:id',authentication.adminAuth,adminControl.getOrderProducts)

router.post('/order-status/:id',authentication.adminAuth,adminControl.postEditStatus)

//coupon

router.get('/add-coupons',authentication.adminAuth,adminControl.addCoupons)

router.post('/add-coupons',authentication.adminAuth,adminControl.addNewCoupon)

router.get('/view-coupons',authentication.adminAuth,adminControl.viewCoupon)

router.get('/edit-coupon/:id',authentication.adminAuth,adminControl.editCoupon)

router.post('/edit-coupon/:id',authentication.adminAuth,adminControl.postEditCoupon)

router.get('/delete-coupon/:id',authentication.adminAuth,adminControl.deleteCoupon)

//sales

router.get('/sales',authentication.adminAuth,adminControl.getSales)

router.post('/sales',authentication.adminAuth,adminControl.getSalesFilter)


//offer-product
router.get("/add-offer", authentication.adminAuth, adminControl.getAddoffer);


module.exports = router;