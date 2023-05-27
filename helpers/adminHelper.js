const db = require("../model/connection");
const voucher_codes = require("voucher-code-generator");

module.exports = {
  //list the users
  listUsers: () => {
    let userData = [];
    return new Promise(async (resolve, reject) => {
      await db.user
        .find()
        .exec()
        .then((result) => {
          userData = result;
        });
      console.log(userData);
      resolve(userData);
    });
  },

  //block users
  blockUser: (userId) => {
    console.log(userId);
    return new Promise(async (resolve, reject) => {
      await db.user
        .updateOne({ _id: userId }, { $set: { blocked: true } })
        .then((data) => {
          console.log("user blocked success");
          resolve();
        });
    });
  },

  //unblock users
  UnblockUser: (userId) => {
    return new Promise(async (resolve, reject) => {
      await db.user
        .updateOne({ _id: userId }, { $set: { blocked: false } })
        .then((data) => {
          console.log("user unblocked success");
          resolve();
        });
    });
  },

  getOrderByDate: async () => {
    try {
      const startDate = new Date("2022-01-01");
      let orderDate = await db.order.find({ date: { $gte: startDate } });
      return orderDate;
    } catch (err) {
      console.log(err);
    }
  },

  //for finding all catagories available and making them to passable object
  findAllcategories: () => {
    return new Promise(async (resolve, reject) => {
      await db.category
        .find()
        .exec()
        .then((response) => {
          resolve(response);
        });
    });
  },

  //post the add products
  postAddProduct: (userData, image) => {
    return new Promise((resolve, reject) => {
      uploadedImage = new db.products({
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
    });
  },

  //get the view products
  getViewProducts: (pageNum, perPage) => {
    return new Promise(async (resolve, reject) => {
      await db.products
        .find()
        .skip((pageNum - 1) * perPage)
        .limit(perPage)
        .then((response) => {
          resolve(response);
        });
    });
  },

  //add the category
  addCategory: (data) => {
    console.log(data);
    return new Promise(async (resolve, reject) => {
      let existingCat = await db.category.findOne({
        CategoryName: { $regex: new RegExp(data.category, "i") },
      });
      if (existingCat) {
        resolve(existingCat);
        return;
      }
      const catData = new db.category({ CategoryName: data.category });
      console.log(catData);
      await catData.save().then((data) => {
        resolve(data);
      });
    });
  },

  //view the add category
  viewAddCategory: () => {
    return new Promise(async (resolve, reject) => {
      await db.category
        .find()
        .exec()
        .then((response) => {
          resolve(response);
        });
    });
  },

  //delete the category
  delCategory: (delete_id) => {
    console.log(delete_id);
    return new Promise(async (resolve, reject) => {
      await db.category.deleteOne({ _id: delete_id }).then((response) => {
        resolve(response);
      });
    });
  },

  //edit the products
  editProduct: (productId) => {
    return new Promise(async (resolve, reject) => {
      await db.products
        .findOne({ _id: productId })
        .exec()
        .then((response) => {
          resolve(response);
        });
    });
  },
  postEditProduct: (productId, editedData, filename) => {
    return new Promise(async (resolve, reject) => {
      let products = await db.products.findOne({ _id: productId });
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
    });
  },

  //delete the products
  deleteProduct: (productId) => {
    return new Promise(async (resolve, reject) => {
      await db.products.deleteOne({ _id: productId }).then((response) => {
        resolve(response);
      });
    });
  },

  //edit category first
  findOneCategory: (categoryId) => {
    return new Promise(async (resolve, reject) => {
      await db.category.findOne({ _id: categoryId }).then((response) => {
        resolve(response);
      });
    });
  },

  //second
  editPostTheCategory: (categoryId, data) => {
    return new Promise(async (resolve, reject) => {
      await db.category
        .updateOne(
          { _id: categoryId },
          { $set: { CategoryName: data.categoryname } }
        )
        .then((response) => {
          resolve(response);
        });
    });
  },

  getUserOrdersall: (pageNum, perPage) => {
    return new Promise(async (resolve, reject) => {
      await db.order
        .find({})
        .skip((pageNum - 1) * perPage)
        .limit(perPage)
        .sort({ date: -1 })
        .exec()
        .then((response) => {
          console.log(response, "i miss you oj");
          resolve(response);
        });
    });
  },

  getOrderDetails: async (id) => {
    let order = await userhelpers.getShipProducts(req.params.id);
  },

  updateStatus: (orderid, orderDetails) => {
    return new Promise(async (resolve, reject) => {
      await db.order
        .updateOne({ _id: orderid }, { $set: { status: orderDetails.status } })
        .then((response) => {
          console.log(response);
          resolve();
        })
        .catch((error) => {
          console.error(`the operation failed with error`);
        });
    });
  },

  //coupon
  addNewCoupon: (data) => {
    return new Promise((resolve, reject) => {
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
    });
  },

  getViewCoupon: () => {
    return new Promise(async (resolve, reject) => {
      await db.coupon
        .find()
        .exec()
        .then((response) => {
          resolve(response);
        });
    });
  },

  editCoupon: (Id) => {
    return new Promise(async (resolve, reject) => {
      await db.coupon
        .findOne({ _id: Id })
        .exec()
        .then((response) => {
          resolve(response);
        });
    });
  },

  postEditCoupon: (id, editedData) => {
    return new Promise(async (resolve, reject) => {
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
    });
  },

  deleteCoupon: (id) => {
    return new Promise(async (resolve, reject) => {
      await db.coupon.deleteOne({ _id: id }).then((response) => {
        resolve(response);
      });
    });
  },

  totalRevenue: () => {
    return new Promise(async (resolve, reject) => {
      let revenue = await db.order.aggregate([
        {
          $match: {
            status: "Delivered",
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
    });
  },

  //order count
  countOfOrder: () => {
    return new Promise((resolve, reject) => {
      db.order.countDocuments({}, (error, ordersCount) => {
        if (error) {
          reject(error);
        } else {
          resolve(ordersCount);
        }
      });
    });
  },

  //count of products
  countOfProducts: () => {
    return new Promise((resolve, reject) => {
      db.products.countDocuments().then((response) => {
        resolve(response);
      });
    });
  },

  //montly revenue
  monthlyRevenue: () => {
    return new Promise(async (resolve, reject) => {
      let monthly = await db.order.aggregate([
        {
          $match: {
            status: "Delivered",
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
    });
  },

  showChart: () => {
    return new Promise(async (resolve, reject) => {
      let chart = await db.order.aggregate([
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
    });
  },

  //payment method
  paymentMethod: () => {
    return new Promise(async (resolve, reject) => {
      let count = await db.order.aggregate([
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
    });
  },

  categoryGroup: () => {
    return new Promise(async (resolve, reject) => {
      let res = await db.products.aggregate([
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
    });
  },
};
