const db = require("../model/connection");

module.exports = {
  listUsers: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let userData = await db.user.find().exec();
        resolve(userData);
      } catch (error) {
        reject(error);
      }
    });
  },

  //block and unblock users
  blockUser: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        await db.user.updateOne({ _id: userId }, { $set: { blocked: true } });
        console.log("User blocked successfully");
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },

  unblockUser: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        await db.user.updateOne({ _id: userId }, { $set: { blocked: false } });
        console.log("User unblocked successfully");
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },

  //for finding all catagories available and making them to passable object

  findAllCategories: () => {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await db.category.find().exec();
        resolve(response);
      } catch (error) {
        reject(error);
      }
    });
  },

  postAddProduct: (userData, image) => {
    return new Promise((resolve, reject) => {
      try {
        const uploadedImage = new db.products({
          Productname: userData.name,
          ProductDescription: userData.description,
          Quantity: userData.quantity,
          Image: image,
          category: userData.category,
          Price: userData.Price,
        });

        uploadedImage.save().then((data) => {
          console.log(uploadedImage, "kikikkkiikiii");
          resolve(data);
        });
      } catch (error) {
        reject(error);
      }
    });
  },

  getViewProducts: (pageNum, perPage) => {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await db.products
          .find()
          .skip((pageNum - 1) * perPage)
          .limit(perPage);
        resolve(response);
      } catch (error) {
        reject(error);
      }
    });
  },

  addCategory: (data) => {
    return new Promise(async (resolve, reject) => {
      try {
        let existingCat = await db.category.findOne({
          CategoryName: { $regex: new RegExp(data.category, "i") },
        });
        if (existingCat) {
          resolve(existingCat);
          return;
        }
        const catData = new db.category({ CategoryName: data.category });
        await catData.save().then((data) => {
          resolve(data);
        });
      } catch (error) {
        reject(error);
      }
    });
  },

  viewAddCategory: () => {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await db.category.find().exec();
        resolve(response);
      } catch (error) {
        reject(error);
      }
    });
  },

  delCategory: (delete_id) => {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await db.category.deleteOne({ _id: delete_id });
        resolve(response);
      } catch (error) {
        reject(error);
      }
    });
  },

  editProduct: (productId) => {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await db.products.findOne({ _id: productId }).exec();
        resolve(response);
      } catch (error) {
        reject(error);
      }
    });
  },

  postEditProduct: (productId, editedData, filename) => {
    return new Promise(async (resolve, reject) => {
      try {
        const products = await db.products.findOne({ _id: productId });
        let oldArray = products.Image;
        let newArray = [];

        await db.products
          .updateOne(
            { _id: productId },
            {
              $set: {
                Productname: editedData.name,
                ProductDescription: editedData.description,
                Quantity: editedData.quantity,
                Price: editedData.price,
                category: editedData.category,
                Image: filename,
              },
            }
          )
          .then((response) => {
            console.log(response);
            resolve(response);
          });
      } catch (error) {
        reject(error);
      }
    });
  },

  deleteProduct: (productId) => {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await db.products.deleteOne({ _id: productId });
        resolve(response);
      } catch (error) {
        reject(error);
      }
    });
  },

  findOneCategory: (categoryId) => {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await db.category.findOne({ _id: categoryId });
        resolve(response);
      } catch (error) {
        reject(error);
      }
    });
  },

  editPostTheCategory: (categoryId, data) => {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await db.category.updateOne(
          { _id: categoryId },
          { $set: { CategoryName: data.categoryname } }
        );
        resolve(response);
      } catch (error) {
        reject(error);
      }
    });
  },

  getUserOrdersall: (pageNum, perPage) => {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await db.order
          .find({})
          .skip((pageNum - 1) * perPage)
          .limit(perPage)
          .sort({ date: -1 })
          .exec();
        console.log(response, "i miss you oj");
        resolve(response);
      } catch (error) {
        reject(error);
      }
    });
  },

  getOrderDetails: async (id) => {
    try {
      let order = await userhelpers.getShipProducts(req.params.id);
      // Perform other operations with the order details
    } catch (error) {
      // Handle the error
    }
  },

  updateStatus: (orderid, orderDetails) => {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await db.order.updateOne(
          { _id: orderid },
          { $set: { status: orderDetails.status } }
        );
        console.log(response);
        resolve();
      } catch (error) {
        console.error("The operation failed with error");
        reject(error);
      }
    });
  },

  //coupon

  addNewCoupon: (data) => {
    return new Promise((resolve, reject) => {
      try {
        data = new db.coupon({
          code: data.couponName,
          description: data.description,
          discountAmount: data.price,
          minimumAmount: data.minimum,
          maximumDiscount: data.maximum,
          startDate: data.start,
          endDate: data.expiry,
        });

        data.save().then((data) => {
          resolve(data);
        });
      } catch (error) {
        reject(error);
      }
    });
  },

  getViewCoupon: () => {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await db.coupon.find().exec();
        resolve(response);
      } catch (error) {
        reject(error);
      }
    });
  },

  editCoupon: (Id) => {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await db.coupon.findOne({ _id: Id }).exec();
        resolve(response);
      } catch (error) {
        reject(error);
      }
    });
  },

  postEditCoupon: (id, editedData) => {
    return new Promise(async (resolve, reject) => {
      try {
        let coupon = await db.coupon.findOne({ _id: id });
        await db.coupon
          .updateOne(
            { _id: id },
            {
              $set: {
                couponName: editedData.couponName,
                price: editedData.price,
                expiry: editedData.expiry,
              },
            }
          )
          .then((response) => {
            console.log(response);
            resolve(response);
          });
      } catch (error) {
        reject(error);
      }
    });
  },

  deleteCoupon: (id) => {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await db.coupon.deleteOne({ _id: id });
        resolve(response);
      } catch (error) {
        reject(error);
      }
    });
  },

  totalRevenue: () => {
    return new Promise(async (resolve, reject) => {
      try {
        const revenue = await db.order.aggregate([
          {
            $match: {
              status: "placed",
            },
          },
          {
            $project: {
              total: 1,
            },
          },
          {
            $group: {
              _id: "",
              totalRevenue: {
                $sum: {
                  $toInt: "$total",
                },
              },
            },
          },
        ]);

        resolve(revenue[0]);
      } catch (error) {
        reject(error);
      }
    });
  },

  countOfOrder: () => {
    return new Promise((resolve, reject) => {
      try {
        db.order.countDocuments({}, (error, ordersCount) => {
          if (error) {
            reject(error);
          } else {
            resolve(ordersCount);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  },

  countOfProducts: () => {
    return new Promise((resolve, reject) => {
      try {
        db.products.countDocuments().then((response) => {
          resolve(response);
        });
      } catch (error) {
        reject(error);
      }
    });
  },

  monthlyRevenue: () => {
    return new Promise(async (resolve, reject) => {
      try {
        const monthly = await db.order.aggregate([
          {
            $match: {
              status: "placed",
            },
          },
          {
            $project: {
              total: 1,
            },
          },
          {
            $group: {
              _id: {
                month: {
                  $month: "$date",
                },
              },
              totalnum: {
                $sum: {
                  $toInt: "$total",
                },
              },
            },
          },
          {
            $group: {
              _id: "_id",
              AverageValue: {
                $avg: "$totalnum",
              },
            },
          },
          {
            $project: {
              _id: 0,
              AverageValue: 1,
            },
          },
        ]);

        resolve(monthly[0]);
      } catch (error) {
        reject(error);
      }
    });
  },

  showChart: () => {
    return new Promise(async (resolve, reject) => {
      try {
        const chart = await db.order.aggregate([
          {
            $match: {
              status: "Delivered",
            },
          },
          {
            $project: {
              date: 1,
              total: 1,
            },
          },
          {
            $group: {
              _id: {
                day: {
                  $dayOfWeek: "$date",
                },
              },
              totalnum: {
                $sum: {
                  $toInt: "$total",
                },
              },
            },
          },
          {
            $project: {
              daywise: "$_id.day",
              _id: 0,
              totalnum: 1,
            },
          },
          {
            $sort: {
              daywise: 1,
            },
          },
          {
            $project: {
              days: {
                $arrayElemAt: [
                  ["", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
                  "$daywise",
                ],
              },
              totalnum: 1,
            },
          },
        ]);

        resolve(chart);
      } catch (error) {
        reject(error);
      }
    });
  },

  paymentMethod: () => {
    return new Promise(async (resolve, reject) => {
      try {
        const count = await db.order.aggregate([
          {
            $group: {
              _id: "$paymentMethod",
              count: {
                $sum: 1,
              },
            },
          },
        ]);

        console.log(count, "pppp09");
        resolve(count);
      } catch (error) {
        reject(error);
      }
    });
  },

  categoryGroup: () => {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await db.products.aggregate([
          {
            $group: {
              _id: "$category",
              total: {
                $sum: "$Price",
              },
            },
          },
        ]);

        resolve(res);
      } catch (error) {
        reject(error);
      }
    });
  },

  postAddOffers: (details) => {
    return new Promise(async (resolve, reject) => {
      try {
        const offerDetails = new db.offer({
          offerType: details.offerType,
          offerValue: details.offerValue,
          offerCode: details.offerCode,
          product: details.product,
          category: details.category,
          startDate: details.start,
          endDate: details.expiry,
        });
        const response = await offerDetails.save();
        console.log(response);
        resolve(response);
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  },

  updateProOffer: (proId, offerId) => {
    return new Promise(async (resolve, reject) => {
      try {
        await db.products
          .updateOne({ _id: proId }, { $set: { offer: offerId } })
          .then((response) => {
            resolve();
          });
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  },
};
