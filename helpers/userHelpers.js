const bcrypt = require("bcrypt");
const { isObjectIdOrHexString } = require("mongoose");
const { user, cart } = require("../model/connection");
const db = require("../model/connection");
const ObjectId = require("mongodb").ObjectId;
const Razorpay = require("razorpay");
var instance = new Razorpay({
  key_id: "rzp_test_djEP5tFIiP8WlG",
  key_secret: "vliziyibhkalnlLPHrWpC0eQ",
});

module.exports = {

  //user sign-up
  doSignUp: (userData) => {
    let response = {};
    return new Promise(async (resolve, reject) => {
      try {
        email = userData.email;
        existingUser = await db.user.findOne({ email: email });
        if (existingUser) {
          response = { status: false };
          return resolve(response);
        } else {
          var hashPassword = await bcrypt.hash(userData.password, 10);
          const data = {
            username: userData.username,
            Password: hashPassword,
            email: userData.email,
            phoneNumber: userData.phonenumber,
          };
          console.log(data);
          await db.user.create(data).then((createdUser) => {
            resolve({ data: createdUser, status: true });
          });
        }
      } catch (err) {
        console.log(err);
        reject(err);
      }
    });
  },

  //user-login
  dologin: (userData) => {
    return new Promise(async (resolve, reject) => {
      try {
        let response = {};
        let users = await db.user.findOne({ email: userData.email });
        if (users) {
          if (users.blocked == false) {
            await bcrypt
              .compare(userData.password, users.Password)
              .then((status) => {
                if (status) {
                  response.user = users;
                  resolve({ response, status: true });
                } else {
                  resolve({ blockedStatus: false, status: false });
                }
              });
          } else {
            resolve({ blockedStatus: true, status: false });
          }
        } else {
          resolve({ blockedStatus: false, status: false });
        }
      } catch (err) {
        console.log(err);
        reject(err);
      }
    });
  },

  zoomlistProductShop: (productId) => {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await db.products.findOne({ _id: productId }).exec();
        resolve(response);
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  },

  listProductShop: (search, page, limit) => {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await db.products
          .find({
            $or: [
              { Productname: { $regex: ".*" + search + ".*", $options: "i" } },
              { category: { $regex: ".*" + search + ".*", $options: "i" } },
              {
                ProductDescription: {
                  $regex: ".*" + search + ".*",
                  $options: "i",
                },
              },
            ],
          })
          .sort({ Price: 1 })
          .limit(limit * 1)
          .skip((page - 1) * limit);
        console.log(response, "bad");
        resolve(response);
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  },

  //user otp-verification
  otpverification: (otpvariable) => {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await db.products.findOne({
          phoneNumber: otpvariable,
        });
        resolve(response);
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  },

  //user add-to-carts
  addToCarts: (proId, userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let proobj = {
          product: ObjectId(proId),
          quantity: 1,
        };
        let obj = {
          userid: userId,
          products: proobj,
        };
        let usercart = await db.cart.find({ userid: userId });
        if (usercart.length < 1) {
          await db.cart.create(obj);
        } else {
          let proExist = await db.cart.findOne({
            userid: userId,
            "products.product": ObjectId(proId),
          });
          console.log(proExist + "PRO EXIST TTT TTT");
          if (proExist) {
            await db.cart.findOneAndUpdate(
              { userid: userId, "products.product": ObjectId(proId) },
              { $inc: { "products.$.quantity": 1 } }
            );
          } else {
            await db.cart.findOneAndUpdate(
              { userid: userId },
              { $push: { products: proobj } }
            );
          }
        }
        resolve({ status: true });
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  },

  //display products in shop
  displayProducts: (usersId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let userId = new ObjectId(usersId);
        let cartItems = await db.cart.aggregate([
          {
            $match: {
              userid: userId,
            },
          },
          {
            $unwind: {
              path: "$products",
            },
          },
          {
            $lookup: {
              from: "products",
              localField: "products.product",
              foreignField: "_id",
              as: "proDetails",
            },
          },
          {
            $project: {
              proDetails: 1,
              "products.quantity": "$products.quantity",
              product: "$products.product",
              sample: {
                $arrayElemAt: ["$proDetails", 0],
              },
            },
          },
          {
            $project: {
              product: 1,
              proDetails: 1,
              "products.quantity": 1,
              price: "$sample.Price",
            },
          },
          {
            $project: {
              proDetails: 1,
              "products.quantity": 1,
              _id: 1,
              subtotal: {
                $multiply: [
                  {
                    $toInt: "$products.quantity",
                  },
                  {
                    $toInt: "$price",
                  },
                ],
              },
            },
          },
        ]);
        resolve(cartItems);
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  },

  //cart count
  getCartCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let count = 0;
        let cart = await db.cart.findOne({ user: ObjectId(userId) });
        if (cart) {
          count = cart.products.length;
        }
        console.log(count);
        resolve(count);
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  },

  //remove items from cart
  removeItem: (proId, userId) => {
    return new Promise((resolve, reject) => {
      db.cart
        .updateOne(
          { userid: userId, "products.product": ObjectId(proId) },
          { $pull: { products: { product: ObjectId(proId) } } }
        )
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  //change the product quantity in cart
  changeProductQuantity: (details) => {
    const count = parseInt(details.count);
    const quantity = parseInt(details.quantity);
    return new Promise((resolve, reject) => {
      if (count === -1 && quantity === 1) {
        db.cart
          .updateOne(
            { _id: ObjectId(details.cart) },
            {
              $pull: { products: { item: ObjectId(details.product) } },
            }
          )
          .then((response) => {
            resolve({ removeProduct: true });
          })
          .catch((error) => {
            reject(error);
          });
      } else {
        db.cart
          .updateOne(
            {
              _id: ObjectId(details.cart),
              "products.product": ObjectId(details.product),
            },
            {
              $inc: { "products.$.quantity": count },
            }
          )
          .then((response) => {
            resolve({ status: true });
          })
          .catch((error) => {
            reject(error);
          });
      }
    });
  },

  change_Quantity: (details) => {
    details.count = parseInt(details.count);
    details.quantity = parseInt(details.quantity);

    return new Promise((resolve, reject) => {
      if (details.count === -1 && details.quantity === 1) {
        db.cart
          .findOneAndUpdate(
            {
              _id: details.cart,
            },
            {
              $pull: {
                products: {
                  product: ObjectId(details.product),
                },
              },
            }
          )
          .then((response) => {
            resolve({ removeProduct: true });
          })
          .catch((error) => {
            reject(error);
          });
      } else {
        db.cart
          .findOneAndUpdate(
            {
              _id: details.cart,
              "products.product": ObjectId(details.product),
            },
            {
              $inc: {
                "products.$.quantity": details.count,
              },
            }
          )
          .then((response) => {
            resolve({ status: true });
          })
          .catch((error) => {
            reject(error);
          });
      }
    });
  },

  //display the products in cart
  displayProduct: (usersId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let userId = new ObjectId(usersId);
        let cartItems = await db.cart.aggregate([
          {
            $match: {
              userid: userId,
            },
          },
          {
            $unwind: {
              path: "$products",
            },
          },
          {
            $lookup: {
              from: "products",
              localField: "products.product",
              foreignField: "_id",
              as: "proDetails",
            },
          },
          {
            $project: {
              proDetails: 1,
              "products.quantity": "$products.quantity",
              product: "$products.product",
              sample: {
                $arrayElemAt: ["$proDetails", 0],
              },
            },
          },
          {
            $project: {
              product: 1,
              proDetails: 1,
              "products.quantity": 1,
              price: "$sample.Price",
            },
          },
          {
            $project: {
              proDetails: 1,
              "products.quantity": 1,
              _id: 1,
              subtotal: {
                $multiply: [
                  {
                    $toInt: "$products.quantity",
                  },
                  {
                    $toInt: "$price",
                  },
                ],
              },
            },
          },
        ]);
        console.log(cartItems[0], "oooooooooooooppppppppptttttttttttt");
        resolve(cartItems);
      } catch (error) {
        reject(error);
      }
    });
  },

  //total amount 
  getTotalAmount: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let uId = ObjectId(userId);
        let total = await db.cart.aggregate([
          {
            $match: {
              userid: uId,
            },
          },
          {
            $unwind: {
              path: "$products",
            },
          },
          {
            $project: {
              _id: 0,
              cart: "$products.product",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: "products",
              localField: "cart",
              foreignField: "_id",
              as: "proDetails",
            },
          },
          {
            $project: {
              quantity: 1,
              prod: {
                $arrayElemAt: ["$proDetails", 0],
              },
            },
          },
          {
            $project: {
              _id: 0,
              price: "$prod.Price",
              quantity: 1,
            },
          },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: { $multiply: ["$price", "$quantity"] } },
            },
          },
        ]);
        resolve(total[0].totalRevenue);
      } catch (error) {
        reject(error);
      }
    });
  },

  //cart products list display
  getCartProductList: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let cart = await db.cart.findOne({ userid: ObjectId(userId) });
        resolve(cart.products);
      } catch (error) {
        reject(error);
      }
    });
  },

  //total amount of cart products
  getTotalAmounts: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        console.log(userId);
        let uId = ObjectId(userId);
        let total = await db.cart.aggregate([
          {
            $match: {
              userid: uId,
            },
          },
          {
            $unwind: {
              path: "$products",
            },
          },
          {
            $project: {
              _id: 0,
              cart: "$products.product",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: "products",
              localField: "cart",
              foreignField: "_id",
              as: "proDetails",
            },
          },
          {
            $project: {
              quantity: 1,
              prod: {
                $arrayElemAt: ["$proDetails", 0],
              },
            },
          },
          {
            $project: {
              _id: 0,
              price: "$prod.Price",
              quantity: 1,
            },
          },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: { $multiply: ["$price", "$quantity"] } },
            },
          },
        ]);

        resolve(total[0].totalRevenue);
      } catch (error) {
        reject(error);
      }
    });
  },

  getOrderTheProducts: (orderId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let orderItems = await db.order.aggregate([
          {
            $match: { _id: ObjectId(orderId) },
          },
          {
            $unwind: "$products",
          },
          {
            $lookup: {
              from: "products",
              localField: "products.product",
              foreignField: "_id",
              as: "productDetails",
            },
          },
          {
            $project: {
              product: "$products.product",
              quantity: "$products.quantity",
              productDetails: "$productDetails",
            },
          },
        ]);
        resolve(orderItems[0].productDetails[0]);
      } catch (error) {
        reject(error);
      }
    });
  },

  addAddress: (data, id) => {
    return new Promise((resolve, reject) => {
      const address = new db.address({
        owner: id,
        name: data.name,
        phone: data.phone,
        billing_address: data.billing_address,
        billing_address2: data.billing_address2,
        city: data.city,
        state: data.state,
        zipcode: data.zipcode,
      });
      address
        .save()
        .then((data) => {
          resolve(data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  getAllAddress: (id) => {
    return new Promise(async (resolve, reject) => {
      try {
        let addresses = await db.address.find({ owner: ObjectId(id) }).exec();
        resolve(addresses);
      } catch (error) {
        reject(error);
      }
    });
  },

  getUserDetails: (id) => {
    return new Promise(async (resolve, reject) => {
      try {
        let user = await db.user.find({ _id: ObjectId(id) }).exec();
        resolve(user[0]);
      } catch (error) {
        reject(error);
      }
    });
  },

  deleteTheAddress: (id) => {
    return new Promise((resolve, reject) => {
      db.address.deleteOne({ _id: id }, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve("Address deleted successfully");
        }
      });
    });
  },

  getAddressDetails: (id) => {
    return new Promise(async (resolve, reject) => {
      try {
        let address = await db.address.findOne({ _id: ObjectId(id) }).exec();
        resolve(address);
      } catch (error) {
        reject(error);
      }
    });
  },

  updateAddress: (addressId, data) => {
    return new Promise(async (resolve, reject) => {
      try {
        await db.address.updateOne(
          { _id: ObjectId(addressId) },
          {
            $set: {
              name: data.name,
              phone: data.phone,
              billing_address: data.billing_address,
              billing_address2: data.billing_address2,
              city: data.city,
              state: data.state,
              zipcode: data.zipcode,
            },
          }
        );
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },

  changePassword: (userid, body) => {
    console.log("hai hello");
    return new Promise(async (resolve, reject) => {
      try {
        const saltRounds = 10;
        const hashPassword = await bcrypt.hash(body.npassword, saltRounds);
        const updateuser = await db.user.updateOne(
          { _id: userid },
          { Password: hashPassword }
        );
        console.log(updateuser, "hakuna matata");
        resolve(updateuser);
        return updateuser.nModified === 1;
      } catch (error) {
        reject(error);
      }
    });
  },

  placeOrder: (order, products, totalPrice, discountamt) => {
    return new Promise((resolve, reject) => {
      let status = order.paymentMethod === "COD" ? "placed" : "pending";
      let orderObj = new db.order({
        _id: ObjectId(),
        userid: order.userId,
        Name: order.Name,
        phone: order.phone,
        address: order.address,
        Email: order.Email,
        paymentMethod: order.paymentMethod,
        total: totalPrice,
        products: products,
        status: status,
        date: new Date(),
      });
      orderObj
        .save()
        .then(async (response) => {
          db.cart.deleteOne({ userId: ObjectId(order.userId) }, (error) => {
            if (error) {
              console.log(error);
            } else {
              console.log("Cart item deleted successfully.");
            }
          });
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  generateRazorpay: (orderId, total) => {
    console.log(orderId, "9987");
    console.log(total, "6666666");
    return new Promise((resolve, reject) => {
      try {
        const Razorpay = require("razorpay");
        var options = {
          amount: total * 100, // amount in the smallest currency unit
          currency: "INR",
          receipt: "" + orderId,
        };
        instance.orders.create(options, function (err, order) {
          if (err) {
            reject(err);
          } else {
            console.log("new order :", order);
            resolve(order);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  },

  verifyPayment: (details) => {
    return new Promise((resolve, reject) => {
      try {
        const crypto = require("crypto");
        let hmac = crypto.createHmac("sha256", "vliziyibhkalnlLPHrWpC0eQ");
        hmac.update(
          details["payment[razorpay_order_id]"] +
            "|" +
            details["payment[razorpay_payment_id]"]
        );
        hmac = hmac.digest("hex");
        if (hmac == details["payment[razorpay_signature]"]) {
          resolve();
        } else {
          reject();
        }
      } catch (error) {
        reject(error);
      }
    });
  },

  changePaymentStatus: (orderId) => {
    return new Promise((resolve, reject) => {
      try {
        db.order
          .updateOne({ _id: ObjectId(orderId) }, { $set: { status: "placed" } })
          .then(() => {
            resolve();
          })
          .catch((error) => {
            reject(error);
          });
      } catch (error) {
        reject(error);
      }
    });
  },

  getbalanceWallet: (userid) => {
    return new Promise(async (resolve, reject) => {
      try {
        let wallet = await db.wallet.find({ user: ObjectId(userid) });
        resolve(wallet[0]);
      } catch (error) {
        reject(error);
      }
    });
  },

  gethistory: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let wallet = await db.wallethistory.find({ user: ObjectId(userId) });
        resolve(wallet);
      } catch (error) {
        reject(error);
      }
    });
  },

  getUserOrders: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let orders = await db.order
          .find({ userid: ObjectId(userId) })
          .sort({ date: -1 });
        resolve(orders);
      } catch (error) {
        reject(error);
      }
    });
  },

  getShipAddress: (orderId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let orderItems = await db.order.aggregate([
          {
            $match: { _id: ObjectId(orderId) },
          },
          {
            $lookup: {
              from: "addresses",
              localField: "address",
              foreignField: "_id",
              as: "address",
            },
          },
        ]);

        let response = orderItems[0].address;
        resolve(response);
      } catch (error) {
        reject(error);
      }
    });
  },

  getShipProducts: (id) => {
    return new Promise(async (resolve, reject) => {
      try {
        let orders = await db.order.find({ _id: ObjectId(id) });
        resolve(orders);
      } catch (error) {
        reject(error);
      }
    });
  },

  getOrder: (id) => {
    return new Promise(async (resolve, reject) => {
      try {
        let orders = await db.order.find({ _id: ObjectId(id) });
        console.log(orders[0], "mazhaaaaaaaaaaaaaa");
        resolve(orders[0]);
      } catch (error) {
        reject(error);
      }
    });
  },

  cartOrder: async (userId) => {
    try {
      return new Promise(async (resolve, reject) => {
        const cartItems = await db.cart.aggregate([
          { $match: { userid: ObjectId(userId) } },
          { $unwind: "$products" },
          {
            $lookup: {
              from: "products",
              localField: "products.product",
              foreignField: "_id",
              as: "products.product",
            },
          },
          { $unwind: "$products.product" },
          {
            $group: {
              _id: "$_id",
              userid: { $first: "$userid" },
              products: { $push: "$products" },
            },
          },
          {
            $project: {
              _id: 0,
              userid: 1,
              products: {
                product: {
                  _id: 1,
                  Productname: 1,
                  ProductDescription: 1,
                  Price: 1,
                  Image: 1,
                  // include any other fields you want from the product collection
                },
                quantity: 1,
              },
            },
          },
        ]);
        resolve(cartItems[0]?.products);
      });
    } catch (error) {
      console.log(error);
    }
  },

  addToWallet: async (refund, userId) => {
    try {
      const amount = Number(refund);
      const userWallet = await db.wallet.findOne({ user: userId });

      if (userWallet) {
        const response = await db.wallet.updateOne(
          { user: userId },
          { $inc: { balance: amount } }
        );

        const historywallet = {
          user: userId,
          balance: amount,
          date: Date.now(),
        };
        await db.wallethistory.create(historywallet);
        resolve(response);
        console.log("Balance updated successfully.");
      } else {
        const balanceObj = { user: userId, balance: amount };
        await db.wallet.create(balanceObj);

        const historywallet = {
          user: userId,
          balance: amount,
          date: Date.now(),
        };
        await db.wallethistory.create(historywallet);
        console.log("Balance added to wallet successfully.");
      }
    } catch (error) {
      console.error(error);
    }
  },

  cancelOrder: (orderId) => {
    return new Promise(async (resolve, reject) => {
      try {
        await db.order.updateOne(
          { _id: ObjectId(orderId) },
          { $set: { status: "Cancelled" } }
        );
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },

  returnOrder: (orderId) => {
    console.log(orderId);
    return new Promise(async (resolve, reject) => {
      try {
        await db.order.updateOne(
          { _id: ObjectId(orderId) },
          { $set: { status: "Return" } }
        );
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },

  getAllSales: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let sales = await db.order
          .find({ status: "Delivered" })
          .sort({ date: -1 });
        resolve(sales);
      } catch (error) {
        reject(error);
      }
    });
  },

  getAllSalesInDateRange: (date1, date2) => {
    return new Promise(async (resolve, reject) => {
      try {
        const sales = await db.order.aggregate([
          {
            $match: {
              status: "Delivered",
              date: {
                $gte: new Date(date1),
                $lte: new Date(date2),
              },
            },
          },
        ]);
        console.log("Sales---", sales);
        resolve(sales);
      } catch (error) {
        console.log("Error fetching sales: ", error);
        reject(error);
      }
    });
  },

  getFilterCategory: (catName) => {
    console.log(catName, "sana sona sayooj");
    return new Promise((resolve, reject) => {
      db.products
        .find({ category: catName })
        .then((response) => {
          console.log("haiii");
          console.log(response);
          resolve(response);
        })
        .catch((error) => {
          console.log("Error fetching filtered category: ", error);
          reject(error);
        });
    });
  },

  ///wishlist

  getWishlistCount: (userId) => {
    let count = 0;
    return new Promise(async (resolve, reject) => {
      try {
        let wishlist = await db.wishlist.findOne({ user: ObjectId(userId) });
        if (wishlist) {
          count = wishlist.products.length;
        }
        console.log(count, "hai hellooo");
        resolve(count);
      } catch (error) {
        console.error("Error fetching wishlist count: ", error);
        reject(error);
      }
    });
  },

  addToWishlist: (proId, userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let proobj = {
          product: ObjectId(proId),
          quantity: 1,
        };
        let obj = {
          userid: userId,
          products: proobj,
        };
        let usercart = await db.wishlist.find({ userid: userId });
        if (usercart.length < 1) {
          await db.wishlist.create(obj);
        } else {
          let proExist = await db.wishlist.findOne({
            userid: userId,
            "products.product": ObjectId(proId),
          });
          console.log(proExist + "PRO EXIST TTT TTT");
          if (proExist) {
            await db.wishlist.findOneAndUpdate(
              { userid: userId, "products.product": ObjectId(proId) },
              { $inc: { "products.$.quantity": 1 } }
            );
          } else {
            await db.wishlist.findOneAndUpdate(
              { userid: userId },
              { $push: { products: proobj } }
            );
          }
        }
        resolve({ status: true });
      } catch (error) {
        console.error("Error adding to wishlist: ", error);
        reject(error);
      }
    });
  },

  displaywishlist: (usersId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let userId = new ObjectId(usersId);
        let wishlistItems = await db.wishlist.aggregate([
          {
            $match: {
              userid: userId,
            },
          },
          {
            $unwind: {
              path: "$products",
            },
          },
          {
            $lookup: {
              from: "products",
              localField: "products.product",
              foreignField: "_id",
              as: "proDetails",
            },
          },
          {
            $project: {
              proDetails: 1,
              "products.quantity": "$products.quantity",
              product: "$products.product",
              sample: {
                $arrayElemAt: ["$proDetails", 0],
              },
            },
          },
          {
            $project: {
              product: 1,
              proDetails: 1,
              "products.quantity": 1,
              price: "$sample.Price",
            },
          },
          {
            $project: {
              proDetails: 1,
              "products.quantity": 1,
              _id: 1,
              subtotal: {
                $multiply: [
                  {
                    $toInt: "$products.quantity",
                  },
                  {
                    $toInt: "$price",
                  },
                ],
              },
            },
          },
        ]);
        console.log(wishlistItems, "999999999999999999999999");
        resolve(wishlistItems);
      } catch (error) {
        console.error("Error displaying wishlist: ", error);
        resolve(null);
      }
    });
  },

  removeWishlistItem: (proId, userId) => {
    return new Promise((resolve, reject) => {
      db.wishlist
        .updateOne(
          { userid: userId, "products.product": ObjectId(proId) },
          { $pull: { products: { product: ObjectId(proId) } } }
        )
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          console.error("Error removing wishlist item: ", error);
          reject(error);
        });
    });
  },

  getsubTotal: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        console.log(userId);
        let subtotal = await db.cart.aggregate([
          {
            $match: {
              userid: ObjectId(userId),
            },
          },
          {
            $unwind: {
              path: "$products",
            },
          },
          {
            $project: {
              _id: 0,
              cart: "$products.product",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: "products",
              localField: "cart",
              foreignField: "_id",
              as: "proDetails",
            },
          },
          {
            $project: {
              quantity: 1,
              prod: {
                $arrayElemAt: ["$proDetails", 0],
              },
            },
          },
          {
            $project: {
              price: "$prod.Price",
              quantity: 1,
            },
          },
          {
            $project: {
              result: {
                $multiply: ["$quantity", "$price"],
              },
            },
          },
        ]);
        console.log(subtotal, "<------>");
        resolve(subtotal);
      } catch (error) {
        console.error("Error calculating subtotal: ", error);
        resolve(null);
      }
    });
  },

  documentCount: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let documents = await db.products.find().countDocuments();
        resolve(documents);
      } catch (error) {
        console.error("Error fetching document count: ", error);
        resolve(null);
      }
    });
  },

  documentCounts: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let documents = await db.order.find().countDocuments();
        resolve(documents);
      } catch (error) {
        console.error("Error fetching document count: ", error);
        resolve(null);
      }
    });
  },

  documentcount: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let documents = await db.coupon.find().countDocuments();
        console.log(documents, "havvuu");
        resolve(documents);
      } catch (error) {
        console.error("Error fetching document count: ", error);
        resolve(null);
      }
    });
  },

  couponMatch: (couponCode) => {
    return new Promise(async (resolve, reject) => {
      try {
        console.log("inside coupon match");
        const couponExist = await db.coupon.findOne({ code: couponCode });
        if (couponExist) {
          resolve(couponExist);
        } else {
          reject(new Error("Invalid coupon"));
        }
      } catch (error) {
        console.error("Error fetching coupon: ", error);
        reject(new Error("Error fetching coupon"));
      }
    });
  },

  addToWishlist: (proId, userId) => {
    let proObj = {
      productId: proId,
    };

    return new Promise(async (resolve, reject) => {
      try {
        let wishlist = await db.wishlist.findOne({ user: userId });
        if (wishlist) {
          let productExist = wishlist.wishitems.findIndex(
            (item) => item.productId == proId
          );
          if (productExist == -1) {
            await db.wishlist.updateOne(
              { user: userId },
              {
                $addToSet: {
                  wishitems: proObj,
                },
              }
            );
          }
        } else {
          const newWishlist = new db.wishlist({
            user: userId,
            wishitems: proObj,
          });

          await newWishlist.save();
        }
        resolve({ status: true });
      } catch (error) {
        console.error("Error adding to wishlist: ", error);
        resolve({ status: false });
      }
    });
  },

  // listWishlist: (userId) => {
  //   console.log(userId, "this is user Id view wishlist");
  //   return new Promise(async (resolve, reject) => {
  //     try {
  //       let wishlist = await db.wishlist.aggregate([
  //         {
  //           $match: {
  //             user: new ObjectId(userId),
  //           },
  //         },
  //         {
  //           $unwind: {
  //             path: "$wishitems",
  //             includeArrayIndex: "string",
  //           },
  //         },
  //         {
  //           $project: {
  //             item: "$wishitems.productId",
  //           },
  //         },
  //         {
  //           $lookup: {
  //             from: "products",
  //             localField: "item",
  //             foreignField: "_id",
  //             as: "wishlist",
  //           },
  //         },
  //         {
  //           $unwind: "$wishlist",
  //         },
  //         {
  //           $project: {
  //             item: 1,
  //             Productname: "$wishlist.Productname",
  //             Price: "$wishlist.Price",
  //             Image: "$wishlist.Image",
  //           },
  //         },
  //       ]);
  //       console.log(wishlist);
  //       console.log("hhhhhhhhhhhhhhhhh");
  //       resolve(wishlist);
  //     } catch (error) {
  //       console.error("Error fetching wishlist: ", error);
  //       resolve([]);
  //     }
  //   });
  // },
  getWishCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let count = 0;
        let wishlist = await db.wishlist.findOne({ user: userId });
        if (wishlist) {
          count = wishlist.wishitems.length;
        }
        resolve(count);
      } catch (error) {
        console.error("Error fetching wishlist count: ", error);
        resolve(0);
      }
    });
  },

  getDeleteWishlist: (body) => {
    console.log(body);

    return new Promise(async (resolve, reject) => {
      try {
        await db.wishlist.updateOne(
          { _id: body.wishlistId },
          {
            $pull: { wishitems: { productId: body.productId } },
          }
        );
        resolve({ removeProduct: true });
      } catch (error) {
        console.error("Error removing product from wishlist: ", error);
        resolve({ removeProduct: false });
      }
    });
  },
};
