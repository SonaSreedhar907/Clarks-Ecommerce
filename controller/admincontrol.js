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
  //display dashboard
  displayDashboard: async (req, res) => {
    try {
      const adminStatus = req.session.admin;
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
      if (adminStatus) {
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
        });
      } else {
        res.redirect("/admin/login", { layout: "adminLayout", adminStatus });
      }
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    }
  },

  //get admin login
  getAdminLogin: async (req, res) => {
    try {
      if (req.session.adminloggedIn) {
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
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    }
  },

  //post login
  postAdminLogin: async (req, res) => {
    try {
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
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    }
  },

  //admin logout
  adminLogout: async (req, res) => {
    try {
      req.session.admin = null;
      adminStatus = false;
      req.session.adminIn = false;
      res.render("admin/login", { layout: "adminLayout", adminStatus });
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    }
  },

  //get admin user-list
  getUserlist: async (req, res) => {
    try {
      const user = await adminHelper.listUsers();
      res.render("admin/view-users", {
        layout: "adminLayout",
        user,
        adminStatus,
      });
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    }
  },

  //admin add-products
  addProducts: async (req, res) => {
    try {
      const availCategory = await adminHelper.findAllcategories();
      res.render("admin/add-product", {
        layout: "adminLayout",
        adminStatus,
        availCategory,
      });
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    }
  },

  //admin post-products
  postProducts: async (req, res) => {
    try {
      console.log(req.body);
      let images = req.files.map((files) => files.filename);
      const response = await adminHelper.postAddProduct(req.body, images);
      console.log(response, "oh my god");
      res.redirect("/admin/view-product");
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    }
  },

  //admin view-products
  viewProducts: async (req, res) => {
    try {
      const pageNum = req.query.page;
      const currentPage = pageNum;
      const perPage = 5;
      const documentCount = await userhelpers.documentCount();
      let pages2 = Math.ceil(parseInt(documentCount) / perPage);
      const response = await adminHelper.getViewProducts(pageNum, perPage);
      res.render("admin/view-product", {
        layout: "adminLayout",
        response,
        adminStatus,
        pages2,
      });
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    }
  },

  //admin get-category
  getCategory: (req, res) => {
    try {
      adminHelper.viewAddCategory().then((response) => {
        let viewCategory = response;
        res.render("admin/add-category", {
          layout: "adminLayout",
          viewCategory,
          adminStatus,
        });
      });
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    }
  },

  //admin post-category
  postCategory: (req, res) => {
    try {
      adminHelper.addCategory(req.body).then((response) => {
        res.redirect("/admin/add-category");
      });
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    }
  },

  //admin delete-category
  deleteCategory: (req, res) => {
    try {
      adminHelper.delCategory(req.params.id).then((response) => {
        res.redirect("/admin/add-category");
      });
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    }
  },

  //admin edit the add-product
  editProduct: (req, res) => {
    try {
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
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    }
  },

  //post the admin add-product
  post_EditProduct: (req, res) => {
    try {
      console.log(req.body);
      console.log(req.file);

      adminHelper
        .postEditProduct(req.params.id, req.body, req?.files?.filename)
        .then((response) => {
          console.log(response);
          res.redirect("/admin/view-product");
        });
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    }
  },

  //delete the admin view product
  deleteTheProduct: (req, res) => {
    try {
      console.log("ooooooooooooy");
      console.log(req.params.id, "soooooaa");
      adminHelper.deleteProduct(req.params.id).then((response) => {
        res.redirect("/admin/view-product");
      });
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    }
  },

  // block the user
  blockTheUser: (req, res) => {
    try {
      adminHelper.blockUser(req.params.id).then((response) => {
        res.redirect("/admin/view-users");
      });
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    }
  },

  //unblock the user
  unblockTheUser: (req, res) => {
    try {
      adminHelper.UnblockUser(req.params.id).then((response) => {
        res.redirect("/admin/view-users");
      });
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    }
  },

  //edit the category
  editTheCategory: (req, res) => {
    try {
      adminHelper.findOneCategory(req.params.id).then((response) => {
        let editCat = response;
        res.render("admin/edit-category", {
          layout: "adminLayout",
          editCat,
          adminStatus,
        });
      });
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    }
  },

  //post the edit category
  postEditCategory: (req, res) => {
    try {
      adminHelper
        .editPostTheCategory(req.params.id, req.body)
        .then((response) => {
          res.redirect("/admin/add-category");
        });
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    }
  },

  //orders display
  orders: async (req, res) => {
    try {
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
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    }
  },

  //display the order products
  getOrderProducts: async (req, res) => {
    try {
      let order = await userhelpers.getShipProducts(req.params.id);
      userhelpers.getShipAddress(req.params.id).then(async (response) => {
        res.render("admin/order-details", {
          layout: "adminLayout",
          adminStatus,
          order,
          response,
        });
      });
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    }
  },

  //post the status of the product
  postEditStatus: (req, res) => {
    try {
      adminHelper
        .updateStatus(req.params.id, req.body)
        .then(() => {
          res.redirect("/admin/orders");
        })
        .catch((error) => {
          console.error("The operation failed with error:", error);
          res.status(500).send("Internal Server Error");
        });
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    }
  },

  //add the coupon page
  addCoupons: (req, res) => {
    try {
      res.render("admin/add-coupons", { layout: "adminLayout", adminStatus });
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    }
  },

  //add the new coupon
  addNewCoupon: (req, res) => {
    try {
      adminHelper.addNewCoupon(req.body).then((response) => {
        console.log(response, "oomg");
        res.redirect("/admin/view-coupons");
      });
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    }
  },

  //view the coupon
  viewCoupon: async (req, res) => {
    try {
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
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    }
  },

  getViewproduct: async (req, res) => {
    try {
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
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    }
  },

  //edit the coupon page
  editCoupon: (req, res) => {
    try {
      adminHelper.editCoupon(req.params.id).then((response) => {
        res.render("admin/edit-coupon", {
          layout: "adminLayout",
          adminStatus,
          response,
        });
      });
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    }
  },

  //post the edited coupon
  postEditCoupon: (req, res) => {
    try {
      console.log("ooooooooooooooooooooooooo");
      console.log(req.params.id);
      console.log(req.body);
      adminHelper.postEditCoupon(req.params.id, req.body).then((response) => {
        console.log(response);
        res.redirect("/admin/view-coupons");
      });
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    }
  },

  //delete the coupon
  deleteCoupon: (req, res) => {
    try {
      adminHelper.deleteCoupon(req.params.id).then((response) => {
        console.log(req.params.id, "888888888888888888");
        res.redirect("/admin/view-coupons");
      });
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    }
  },

  //sales display
  getSales: async (req, res) => {
    try {
      const sales = await userhelpers.getAllSales();
      console.log(sales, "sayooj sreedhar");
      adminIn = req.session.loggedIn;
      res.render("admin/sales", {
        layout: "adminLayout",
        adminStatus,
        adminIn: true,
        sales,
      });
    } catch (error) {
      console.error(`The operation failed with error: ${error.message}`);
      res.status(500).send("Internal Server Error");
    }
  },

  //sales filter
  getSalesFilter: async (req, res) => {
    try {
      console.log("Date details", req.body);
      const date1 = new Date(req.body.startDate);
      const date2 = new Date(req.body.endDate);
      const sales = await userhelpers.getAllSalesInDateRange(date1, date2);
      adminIn = req.session.loggedIn;
      res.render("admin/sales", {
        layout: "adminLayout",
        adminStatus,
        admin: true,
        adminIn: true,
        sales,
      });
    } catch (error) {
      console.error(`The operation failed with error: ${error.message}`);
      res.status(500).send("Internal Server Error");
    }
  },
};
