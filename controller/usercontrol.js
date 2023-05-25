const { resolveInclude } = require("ejs");
const adminhelpers = require("../helpers/adminHelper");
const userhelpers = require("../helpers/userHelpers");
const { category } = require("../model/connection");
const db = require("../model/connection");

var loginheader, loginStatus;

module.exports = {
  //home
  getHome: async (req, res) => {
    try {
      if (loginStatus) {
        let userId = req.session.user._id;
        let username = req.session.user.username;
        const cartCount = await userhelpers.getCartCount(userId);
        wishcount = await userhelpers.getWishCount(userId);
        if (cartCount) {
          res.render("user/userhome", {
            loginheader: true,
            cartCount,
            userName: username,
            wishcount,
          });
        } else {
          res.render("user/userhome", {
            loginheader: true,
            userName: username,
          });
        }
      } else {
        res.render("user/userhome", { loginheader: false });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  //get user login
  showLogin: (req, res) => {
    try {
      if (req.session.userIn) {
        res.render("user/userhome", { loginheader: true });
      } else {
        res.render("user/login");
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  //post user login
  postLogin: async (req, res) => {
    try {
      const response = await userhelpers.dologin(req.body);
      loginheader = true;
      loginStatus = response.status;
      var blockedStatus = response.blockedStatus;
      req.session.userIn = true;
      if (loginStatus) {
        req.session.user = response.response.user;
        req.session.userIn = true;
        res.redirect("/");
      } else {
        res.render("user/login", { loginStatus, blockedStatus, login: false });
        console.log(blockedStatus + "blocked status");
        console.log(loginStatus + "log");
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  //get zoom shop view
  zoomshopView: async (req, res) => {
    try {
      if (req.session.userIn) {
        let user = req.session.user.username;
        let userId = req.session.user._id;
        const response = await userhelpers.zoomlistProductShop(req.params.id);
        let wishcount = await userhelpers.getWishCount(userId);
        let cartCount = await userhelpers.getCartCount(userId);
        res.render("user/imagezoom", {
          response,
          wishcount,
          cartCount,
          loginheader: true,
          userName: user,
        });
      } else {
        const response = await userhelpers.zoomlistProductShop(req.params.id);
        res.render("user/imagezoom", { response, loginheader: false });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  //user shop view
  shopView: async (req, res) => {
    try {
      const userId = req.session.user.id;
      let username = req.session.user.username;
      var search = "";
      if (req.query.search) {
        search = req.query.search;
      }
      var page = 1;
      if (req.query.page) {
        page = req.query.page;
      }
      const limit = 12;
      const cartCount = await userhelpers.getCartCount(userId);
      wishcount = await userhelpers.getWishCount(req.session.user._id);
      const response = await userhelpers.listProductShop(search, page, limit);
      const cat = await adminhelpers.findAllcategories();
      res.render("user/shop", {
        response,
        cat,
        loginheader: true,
        cartCount,
        userName: username,
        wishcount,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  //get signup
  showSignup: (req, res) => {
    try {
      res.render("user/signup", { emailStatus: true });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  //post signup
  postSignup: async (req, res) => {
    try {
      const response = await userhelpers.doSignUp(req.body);
      console.log(response);
      var emailStatus = response.status;
      if (emailStatus) {
        res.redirect("/login");
      } else {
        res.render("user/signup", { emailStatus });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  //user logout
  userlogout: (req, res) => {
    try {
      loginheader = false;
      loginStatus = false;
      req.session.userIn = false;
      res.redirect("/");
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  //show otp
  showotp: (req, res) => {
    try {
      res.render("user/otplogin");
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  //post otp
  postotp: (req, res) => {
    try {
      userhelpers.otpverification(req.body).then((response) => {
        if (response.blocked) {
          loginStatus = false;
          res.redirect("/otplogin");
        } else {
          req.session.userIn = true;
          loginStatus = true;
          res.redirect("/");
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  //add-to-cart
  addToCart: (req, res) => {
    try {
      const userId = req.session.user._id;
      const proId = req.params.id;
      userhelpers.addToCarts(proId, userId).then(() => {
        userhelpers.getCartCount(userId).then((cartCount) => {
          if (cartCount) {
            res.json({ status: true, cartCount });
          } else {
            res.json({ status: true });
          }
        });
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  //cart products display
  getCartProducts: (req, res) => {
    try {
      let userId;
      if (req.session.user) {
        userId = req.session.user._id;
      }
      let username = req.session.user.username;
      userhelpers.displayProducts(userId).then(async (products) => {
        wishcount = await userhelpers.getWishCount(req.session.user._id);
        let cartCount = await userhelpers.getCartCount(userId);
        console.log(cartCount, "gddmnggg");
        total = await userhelpers.getTotalAmount(userId);
        console.log(total, "gdmng");
        if (cartCount) {
          res.render("user/cart", {
            productExist: true,
            products,
            cartCount,
            loginheader: true,
            total,
            userName: username,
            wishcount,
          });
        } else {
          res.render("user/cart", {
            productExist: false,
            loginheader: true,
            userName: username,
            products,
          });
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  //delete cart products
  deleteCartProduct: async (req, res) => {
    try {
      let userId;
      if (req.session.user) {
        userId = req.session.user._id;
      }
      const cartCount = await userhelpers.getCartCount(userId);
      wishcount = await userhelpers.getWishCount(req.session.user._id);
      userhelpers
        .removeItem(req.params.id, userId)
        .then((response) => {
          res.redirect("/cart", cartCount, wishcount);
        })
        .catch((err) => {
          res.redirect("/cart");
        });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  //change quantity of products
  changeQuantity: (req, res) => {
    try {
      let userId;
      if (req.session.user) {
        userId = req.session.user._id;
      }
      userhelpers.change_Quantity(req.body).then(async (response) => {
        response.total = await userhelpers.getsubTotal(req.session.user._id);
        response.grandTotal = await userhelpers.getTotalAmount(userId);

        res.json(response);
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  //wishlist
  addToWishlist: async (req, res) => {
    try {
      let username = req.session.user.username;
      const userId = req.session.user._id;
      const proId = req.params.id;
      let WishlistCount = await userhelpers.getWishlistCount(userId);
      userhelpers.addToWishlist(proId, userId).then(() => {
        console.log(WishlistCount, "oh namo narayana");
        res.render("user/wishList", {
          loginheader: true,
          WishlistCount,
          userName: username,
        });
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  //display the wishlist
  wishlist: (req, res) => {
    try {
      let userId;
      if (req.session.user) {
        userId = req.session.user._id;
      }
      let username = req.session.user.username;
      userhelpers.displaywishlist(userId).then(async (products) => {
        res.render("user/wishList", {
          loginheader: true,
          products,
          userName: username,
        });
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  //delete the wishlist products
  deleteWishlistProduct: (req, res) => {
    try {
      let userId;
      if (req.session.user) {
        userId = req.session.user._id;
      }
      userhelpers
        .removeWishlistItem(req.params.id, userId)
        .then((response) => {
          res.redirect("/wishList");
        })
        .catch((error) => {
          console.error(error);
          res.redirect("/wishList");
        });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  //user profile
  profile: async (req, res) => {
    try {
      let userId = "";
      if (req.session.user) {
        userId = req.session.user._id;
      }
      let user = "";
      if (req.session.user) {
        user = req.session.user;
      }
      let balance = await userhelpers.getbalanceWallet(userId);
      const cartCount = await userhelpers.getCartCount(userId);
      wishcount = await userhelpers.getWishCount(req.session.user._id);
      let username = req.session.user.username;
      let history = await userhelpers.gethistory(userId);
      let orders = await userhelpers.getUserOrders(userId);
      userhelpers.getAllAddress(userId).then((address) => {
        userhelpers.getUserDetails(userId).then((user) => {
          res.render("user/profile", {
            loginheader: true,
            address,
            user,
            orders,
            userName: username,
            balance,
            history,
            cartCount,
            wishcount,
          });
        });
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  //user dashboard
  dashboard: (req, res) => {
    try {
      let username = req.session.user.username;
      res.render("user/dashboard", { loginheader: true, userName: username });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  //post the address details of user
  postAddress: (req, res) => {
    try {
      let userId = "";
      if (req.session.user) {
        userId = req.session.user._id;
      }
      userhelpers.addAddress(req.body, userId).then((data) => {
        res.redirect("/profile");
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  //delete the address
  deleteAddress: (req, res) => {
    try {
      let addressId = req.params.id;
      userhelpers
        .deleteTheAddress(addressId)
        .then((response) => {
          res.redirect("/profile");
        })
        .catch((error) => {
          console.error(error);
          res.redirect("/profile");
        });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  //get the edit address
  getEditAddress: async (req, res) => {
    try {
      let userId = "";
      if (req.session.user) {
        userId = req.session.user._id;
      }
      let username = req.session.user.username;
      const cartCount = await userhelpers.getCartCount(userId);
      wishcount = await userhelpers.getWishCount(req.session.user._id);

      let address = await userhelpers.getAddressDetails(req.params.id);
      res.render("user/editAddress", {
        loginheader: true,
        address,
        userName: username,
        cartCount,
        wishcount,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  //post the edit address
  postEditAddress: async (req, res) => {
    try {
      let id = req.params.id;
      userhelpers
        .updateAddress(id, req.body)
        .then(() => {
          res.redirect("/profile");
        })
        .catch((error) => {
          console.error(error);
          res.redirect("/profile");
        });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  //account details
  accountDetails: async (req, res) => {
    try {
      let userId = "";
      if (req.session.user) {
        userId = req.session.user._id;
      }
      if (req.body.npassword === req.body.cpassword) {
        const updatedUser = await userhelpers.changePassword(userId, req.body);
        if (updatedUser) {
          req.session.user.Password = req.body.npassword;
          loginheader = false;
          loginStatus = false;
          req.session.user.username = false;
          req.session.userIn = false;
          req.session.user = false;

          res.redirect("/login");
        } else {
          res.status(400).send("Failed to update password");
        }
      } else {
        res.status(400).send("New password and confirm password do not match");
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error");
    }
  },

  //get the place order
  getPlaceOrder: async (req, res) => {
    try {
      let userId = "";
      if (req.session.user) {
        userId = req.session.user._id;
      }
      let user = "";
      if (req.session.user) {
        user = req.session.user;
      }
      let username = req.session.user.username;
      let products = await userhelpers.displayProducts(userId);

      let total = 0;
      if (products.length > 0) {
        total = await userhelpers.getTotalAmount(userId);
      }

      let cartCount = null;
      if (userId) {
        cartCount = await userhelpers.getCartCount(userId);
        wishcount = await userhelpers.getWishCount(req.session.user._id);
      }

      userhelpers.getAllAddress(userId).then((address) => {
        res.render("user/place-order", {
          products,
          total,
          loginheader: true,
          cartCount,
          address,
          user,
          userName: username,
          wishcount,
        });
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error");
    }
  },

  //post the place order
  postPlaceOrder: async (req, res) => {
    try {
      let products = await userhelpers.cartOrder(req.body.userId);
      let totalPrice = req.session.newTotal
        ? req.session.newTotal
        : await userhelpers.getTotalAmount(req.body.userId);

      userhelpers
        .placeOrder(req.body, products, totalPrice)
        .then((response) => {
          let orderId = response._id;
          let total = response.total;
          if (req.body.paymentMethod === "COD") {
            res.json({ codSuccess: true });
          } else {
            userhelpers.generateRazorpay(orderId, total).then((response) => {
              res.json(response);
            });
          }
        });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error");
    }
  },

  //order success
  orderSuccess: async (req, res) => {
    try {
      let username = req.session.user.username;
      wishcount = await userhelpers.getWishCount(req.session.user._id);
      res.render("user/order-success", {
        loginheader: true,
        userName: username,
        wishcount,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error");
    }
  },

  //display the orders list
  getOrders: async (req, res) => {
    try {
      let username = req.session.user.username;
      let userId = req.session.user._id;
      wishcount = await userhelpers.getWishCount(req.session.user._id);
      const cartCount = await userhelpers.getCartCount(userId);
      userhelpers.getUserOrders(userId).then((response) => {
        res.render("user/orders", {
          loginheader: true,
          response,
          userName: username,
          cartCount,
          wishcount,
        });
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error");
    }
  },

  //display the order produts
  getOrderProducts: async (req, res) => {
    try {
      let userId = req.session.user._id;
      let username = req.session.user.username;
      let products = await userhelpers.displayProduct(userId);
      console.log(products, "oom daivame");
      let cartCount = await userhelpers.getCartCount(userId);
      wishcount = await userhelpers.getWishCount(req.session.user._id);
      let order = await userhelpers.getShipProducts(req.params.id);
      userhelpers.getShipAddress(req.params.id).then(async (response) => {
        res.render("user/view-order-products", {
          loginheader: true,
          response,
          order,
          userName: username,
          products,
          cartCount,
          wishcount,
        });
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error");
    }
  },

  //order cancel
  getOrderCancel: async (req, res) => {
    try {
      let userId = "";
      if (req.session.user) {
        userId = req.session.user._id;
      }
      let orderId = req.params.id;
      let order = await userhelpers.getOrder(orderId);
      let refund = order.total;
      userhelpers
        .addToWallet(refund, userId)
        .then((response) => {
          userhelpers
            .cancelOrder(orderId)
            .then((response) => {
              res.redirect("/orders");
            })
            .catch((error) => {
              console.error(
                `The cancel order operation failed with error: ${error}`
              );
            });
        })
        .catch((error) => {
          console.error(
            `The addToWallet operation failed with error: ${error}`
          );
        });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error");
    }
  },

  //order return
  getOrderReturn: async (req, res) => {
    try {
      let orderId = req.params.id;
      let order = await userhelpers.getOrder(orderId);
      let refund = order.total;
      userhelpers.addToWallet(refund, userId);
      userhelpers
        .returnOrder(orderId)
        .then((response) => {
          res.redirect("/orders");
        })
        .catch((error) => {
          console.error(
            `The returnOrder operation failed with error: ${error}`
          );
        });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error");
    }
  },

  //payment verification
  verifyPayment: (req, res) => {
    try {
      userhelpers
        .verifyPayment(req.body)
        .then((response) => {
          userhelpers
            .changePaymentStatus(req.body["order[receipt]"])
            .then(() => {
              console.log("Payment Successful");
              res.json({ status: true });
            });
        })
        .catch((err) => {
          console.error(err);
          res.json({ status: false, errMsg: "" });
        });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error");
    }
  },

  //category separation shop
  categoryWork: (req, res) => {
    try {
      let username = req.session.user.username;
      userhelpers.getFilerCategory(req.params.id).then((response) => {
        adminhelpers.findAllcategories().then((cat) => {
          console.log(response);
          res.render("user/shop", {
            loginheader: true,
            response,
            cat,
            userName: username,
          });
        });
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error");
    }
  },

  //coupon apply in user side
  applyCoupon: async (req, res) => {
    try {
      const couponCode = req.body.code;
      const total = req.body.total;
      console.log("inside apply coupon", total);
      console.log("inside apply coupon", couponCode);
      const coupon = await userhelpers.couponMatch(couponCode);
      console.log(coupon, "ccccoupioj");
      if (
        coupon &&
        coupon.isActive &&
        total >= coupon.minimumAmount &&
        total <= coupon.maximumDiscount
      ) {
        const discount = coupon.discountAmount;
        const newTotal = total - discount;
        req.session.newTotal = newTotal;
        res.json({ success: true, newTotal, discount });
      } else {
        res.json({ success: false, message: "Invalid coupon code" });
      }
    } catch (error) {
      console.log(error);
      res.json({ success: false, message: "Error applying coupon" });
    }
  },

  //wishlist
  getWishlist: async (req, res) => {
    try {
      await userhelpers
        .addToWishList(req.params.id, req.session.user._id)
        .then(() => {
          res.json({ status: "success" });
        });
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: "error" });
    }
  },

  viewWishList: async (req, res) => {
    try {
      wishcount = await userhelpers.getWishCount(req.session.user._id);
      let cartCount = await userhelpers.getCartCount(req.session.user._id);

      console.log(wishcount, "this is count of wishlist");
      let user = req.session.user.username;
      await userhelpers
        .ListWishList(req.session.user._id)
        .then((wishlistItems) => {
          res.render("user/view-wishlist", {
            wishlistItems,
            wishcount,
            cartCount,
            userName: user,
            loginheader: true,
          });
        });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error");
    }
  },

  deleteWishList: async (req, res) => {
    try {
      await userhelpers.getDeleteWishList(req.body).then((response) => {
        res.json(response);
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: "error" });
    }
  },
};
