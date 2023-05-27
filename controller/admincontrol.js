const adminHelper = require("../helpers/adminHelper");
const userhelpers = require("../helpers/userHelpers");
const db = require("../model/connection");
const multer = require("multer");

const adminCredential = {
  name: "adminSona",
  email: "admin@gmail.com",
  password: "admin123",
};
let adminStatus;

module.exports = {
  //dashboard admin
  displayDashboard: async (req, res) => {
    try {
      const adminStatus = req.session.admin;
      if (adminStatus) {
        const [revenue, value, result, income, chart, catGroup, payment] =
          await Promise.all([
            adminHelper.totalRevenue(),
            adminHelper.countOfOrder(),
            adminHelper.countOfProducts(),
            adminHelper.monthlyRevenue(),
            adminHelper.showChart(),
            adminHelper.categoryGroup(),
            adminHelper.paymentMethod(),
          ]);
        const arrayCate = catGroup.map((group) => group._id);
        const arrayCount = catGroup.map((group) => group.total);
        const newArry = chart.map((chart) => chart.totalnum);
        const paymentCate = payment.map((group) => group._id);
        const paymentCount = payment.map((group) => group.count);
        let days = [];
        let ordersPerDay = {};
        adminHelper.getOrderByDate().then((response) => {
          if (response.length > 0) {
            let result = response;
            for (let i = 0; i < result.length; i++) {
              let ans = {};
              ans["createdAt"] = result[i].date;
              days.push(ans);
              ans = {};
            }
            console.log(days, "days");
          }
          days.forEach((order) => {
            const day = order.createdAt.toLocaleDateString("en-US", {
              weekday: "long",
            });
            ordersPerDay[day] = (ordersPerDay[day] || 0) + 1;
          });
          console.log(ordersPerDay, "kii");
          console.log(ordersPerDay, "teeeeses");

          res.render("admin/admin-dash", {
            layout: "adminLayout",
            check: req.session.admin,
            adminStatus,
            revenue,
            value,
            result,
            income,
            newArry,
            catGroup,
            arrayCate,
            arrayCount,
            payment,
            paymentCate,
            paymentCount,
            ordersPerDay,
          });
        });
      } else {
        res.redirect("/admin/login", { layout: "adminLayout", adminStatus });
      }
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    }
  },

  //admin login
  getAdminLogin: (req, res) => {
    if (req.session.adminloggedIn) {
      console.log(adminloggedIn, "shaksjaksjaslkjaska");
      res.render("admin/admin-dash", { layout: "adminLayout", adminStatus });
    } else {
      let loginerr = req.session.adminloginErr;
      res.render("admin/login", {
        layout: "adminLayout",
        adminStatus,
        loginerr,
      });
      req.session.adminloginErr = false;
    }
  },

  //post admin login
  postAdminLogin: (req, res) => {
    if (
      req.body.email == adminCredential.email &&
      req.body.password == adminCredential.password
    ) {
      req.session.admin = adminCredential;
      req.session.adminIn = true;
      adminStatus = req.session.adminIn;

      res.redirect("/admin");
    } else {
      req.session.adminloginErr = true;
      res.redirect("/admin/login");
    }
  },

  //admin logout
  adminLogout: (req, res) => {
    req.session.admin = null;
    adminStatus = false;
    req.session.adminIn = false;
    res.render("admin/login", { layout: "adminLayout", adminStatus });
  },

  //user list
  getUserlist: (req, res) => {
    adminHelper.listUsers().then((user) => {
      res.render("admin/view-users", {
        layout: "adminLayout",
        user,
        adminStatus,
      });
    });
  },

  //products add
  addProducts: (req, res) => {
    adminHelper.findAllcategories().then((availCategory) => {
      res.render("admin/add-product", {
        layout: "adminLayout",
        adminStatus,
        availCategory,
      });
    });
  },

  //post the products
  postProducts: (req, res) => {
    console.log(req.body);
    let images = req.files.map((files) => files.filename);
    adminHelper.postAddProduct(req.body, images).then((response) => {
      console.log(response, "oh my god");
      res.redirect("/admin/view-product");
    });
  },

  //view the products
  viewProducts: async (req, res) => {
    const pageNum = req.query.page;
    const currentPage = pageNum;
    const perPage = 5;
    const documentCount = await userhelpers.documentCount();
    let pages2 = Math.ceil(parseInt(documentCount) / perPage);
    adminHelper.getViewProducts(pageNum, perPage).then((response) => {
      res.render("admin/view-product", {
        layout: "adminLayout",
        response,
        adminStatus,
        response,
        pages2,
      });
    });
  },

  //category get
  getCategory: (req, res) => {
    adminHelper.viewAddCategory().then((response) => {
      let viewCategory = response;
      res.render("admin/add-category", {
        layout: "adminLayout",
        viewCategory,
        adminStatus,
      });
    });
  },

  //post the category
  postCategory: (req, res) => {
    adminHelper.addCategory(req.body).then((response) => {
      res.redirect("/admin/add-category");
    });
  },

  //delete the category
  deleteCategory: (req, res) => {
    adminHelper.delCategory(req.params.id).then((response) => {
      res.redirect("/admin/add-category");
    });
  },

  //edit product
  editProduct: (req, res) => {
    adminHelper.viewAddCategory().then((response) => {
      var procategory = response;
      adminHelper.editProduct(req.params.id).then((response) => {
        editproduct = response;

        console.log(editproduct);
        console.log(procategory);
        res.render("admin/edit-viewproduct", {
          layout: "adminLayout",
          editproduct,
          procategory,
          adminStatus,
        });
      });
    });
  },

  //post edit addproduct
  post_EditProduct: (req, res) => {
    console.log(req.body);
    console.log(req.file);

    adminHelper
      .postEditProduct(req.params.id, req.body, req?.files?.filename)
      .then((response) => {
        console.log(response);
        res.redirect("/admin/view-product");
      });
  },

  //delete view product
  deleteTheProduct: (req, res) => {
    console.log("ooooooooooooy");
    console.log(req.params.id, "soooooaa");
    adminHelper.deleteProduct(req.params.id).then((response) => {
      res.redirect("/admin/view-product");
    });
  },

  // block user
  blockTheUser: (req, res) => {
    adminHelper.blockUser(req.params.id).then((response) => {
      res.redirect("/admin/view-users");
    });
  },

  //unblock the user
  unblockTheUser: (req, res) => {
    adminHelper.UnblockUser(req.params.id).then((response) => {
      res.redirect("/admin/view-users");
    });
  },

  //first
  editTheCategory: (req, res) => {
    adminHelper.findOneCategory(req.params.id).then((response) => {
      let editCat = response;
      res.render("admin/edit-category", {
        layout: "adminLayout",
        editCat,
        adminStatus,
      });
    });
  },

  //second
  postEditCategory: (req, res) => {
    adminHelper
      .editPostTheCategory(req.params.id, req.body)
      .then((response) => {
        res.redirect("/admin/add-category");
      });
  },

  //orders view in admin
  orders: async (req, res) => {
    const pageNum = req.query.page;
    const currentPage = pageNum;
    const perPage = 5;
    const documentCounts = await userhelpers.documentCounts();
    let pages2 = Math.ceil(parseInt(documentCounts) / perPage);
    adminHelper.getUserOrdersall(pageNum, perPage).then((orders) => {
      res.render("admin/orders", {
        layout: "adminLayout",
        adminStatus,
        orders,
        documentCounts,
        pages2,
        currentPage,
      });
    });
  },

  //display the products in orders
  getOrderProducts: async (req, res) => {
    let order = await userhelpers.getShipProducts(req.params.id);
    userhelpers.getShipAddress(req.params.id).then(async (response) => {
      res.render("admin/order-details", {
        layout: "adminLayout",
        adminStatus,
        order,
        response,
      });
    });
  },

  //status of products in orders
  postEditStatus: (req, res) => {
    adminHelper
      .updateStatus(req.params.id, req.body)
      .then(() => {
        res.redirect("/admin/orders");
      })
      .catch((error) => {
        console.error(`the operation failed with error`);
      });
  },

  //coupon
  addCoupons: (req, res) => {
    res.render("admin/add-coupons", { layout: "adminLayout", adminStatus });
  },

  //add new coupon
  addNewCoupon: (req, res) => {
    adminHelper.addNewCoupon(req.body).then((response) => {
      console.log(response, "oomg");
      res.redirect("/admin/view-coupons");
    });
  },

  //view the coupon
  viewCoupon: async (req, res) => {
    const pageNum = req.query.page;
    const currentPage = pageNum;
    const perPage = 6;
    const documentcount = await userhelpers.documentcount();
    let pages2 = Math.ceil(parseInt(documentcount) / perPage);
    adminHelper.getViewCoupon(pageNum, perPage).then((response) => {
      res.render("admin/view-coupons", {
        layout: "adminLayout",
        adminStatus,
        response,
        pages2,
        documentcount,
        currentPage,
      });
    });
  },

  getViewproduct: async (req, res) => {
    const pageNum = req.query.page;
    const currentPage = pageNum;
    const perPage = 10;
    const documentCount = await userhelpers.documentCount();
    let pages2 = Math.ceil(parseInt(documentCount) / perPage);
    adminHelper.ViewProduct(pageNum, perPage).then((response) => {
      res.render("admin/view-product", {
        layout: "adminLayout",
        adminStatus,
        response,
        currentPage,
        documentCount,
        pages2,
      });
    });
  },

  editCoupon: (req, res) => {
    adminHelper.editCoupon(req.params.id).then((response) => {
      res.render("admin/edit-coupon", {
        layout: "adminLayout",
        adminStatus,
        response,
      });
    });
  },

  postEditCoupon: (req, res) => {
    adminHelper.postEditCoupon(req.params.id, req.body).then((response) => {
      console.log(response);
      res.redirect("/admin/view-coupons");
    });
  },

  deleteCoupon: (req, res) => {
    adminHelper.deleteCoupon(req.params.id).then((response) => {
      res.redirect("/admin/view-coupons");
    });
  },

  //sales
  getSales: async (req, res) => {
    userhelpers
      .getAllSales()
      .then((sales) => {
        console.log(sales, "sayooj sreedhar");
        adminIn = req.session.loggedIn;
        res.render("admin/sales", {
          layout: "adminLayout",
          adminStatus,
          adminIn: true,
          sales,
        });
      })
      .catch((error) => {
        console.error(`The operation failed with error: ${error.message}`);
      });
  },

  //sales filter
  getSalesFilter: async (req, res) => {
    console.log("Date details", req.body);
    const date1 = new Date(req.body.startDate);
    const date2 = new Date(req.body.endDate);
    let sales = userhelpers
      .getAllSalesInDateRange(date1, date2)
      .then((sales) => {
        adminIn = req.session.loggedIn;
        res.render("admin/sales", {
          layout: "adminLayout",
          adminStatus,
          admin: true,
          adminIn: true,
          sales,
        });
      })
      .catch((error) => {
        console.error(`The operation failed with error: ${error.message}`);
      });
  },
};
