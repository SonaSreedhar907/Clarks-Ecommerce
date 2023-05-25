module.exports = {
  //user middleware
  userAuth: (req, res, next) => {
    if (req.session.userIn) next();
    else {
      res.redirect("/login");
    }
  },
  //admin middleware
  adminAuth: (req, res, next) => {
    if (req.session.adminIn) {
      next();
    } else {
      res.redirect("/admin/login");
    }
  },
};
