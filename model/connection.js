var mongoose = require("mongoose");
const db = mongoose
  .connect("mongodb://0.0.0.0:27017/ecommerce", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database connected!"))
  .catch((err) => console.log(err));

const { ObjectID } = require("bson");
const { ObjectId } = require("mongodb");

const userschema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  Password: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  access: {
    type: Boolean,
    default: false,
  },
  CreatedAt: {
    type: Date,
    default: Date.now,
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  blocked: {
    type: Boolean,
    default: false,
  },
});

const productSchema = new mongoose.Schema({
  Productname: {
    type: String,
  },
  ProductDescription: {
    type: String,
  },
  Quantity: {
    type: Number,
  },

  Image: {
    type: [],
  },
  Price: {
    type: Number,
  },
  category: {
    type: String,
  },
});

const categorySchema = new mongoose.Schema({
  CategoryName: {
    type: String,
  },
});

const cartSchema = new mongoose.Schema({
  userid: mongoose.SchemaTypes.ObjectId,
  products: [],
});

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
  },
  wishitems: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId },
    },
  ],
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const addressSchema = new mongoose.Schema({
  owner: mongoose.SchemaTypes.ObjectId,

  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  billing_address: {
    type: String,
    required: true,
  },
  billing_address2: {
    type: String,
    required: false,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  zipcode: {
    type: String,
    required: true,
  },
});

const walletSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  balance: { type: Number, required: true, default: 0 },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const walletHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  balance: { type: Number, required: true, default: 0 },

  date: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

const orderSchema = new mongoose.Schema(
  {
    userid: mongoose.SchemaTypes.ObjectId,

    Name: {
      type: String,
    },
    phone: {
      type: String,
    },
    address: mongoose.SchemaTypes.ObjectId,
    Email: {
      type: String,
    },
    total: {
      type: String,
    },
    products: [{}],
    paymentMethod: { type: String, enum: ["COD", "ONLINE"], required: true },
    status: {
      type: String,
      enum: ["placed", "pending", "shipped", "delivered"],
      required: true,
    },
    date: { type: Date, required: true },
  },
  { timestamps: true }
);

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  //  discountType: {
  //    type: String,
  //    enum: ["percent", "fixed"],
  //    required: true,
  //  },
  discountAmount: {
    type: Number,
    required: true,
  },
  //The minimum order amount required to use the coupon.
  minimumAmount: {
    type: Number,
    required: true,
  },
  // The maximum amount of discount
  maximumDiscount: {
    type: Number,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  used: {
    type: Array,
  },
});

module.exports = {
  user: mongoose.model("user", userschema),
  category: mongoose.model("category", categorySchema),
  products: mongoose.model("products", productSchema),
  cart: mongoose.model("cart", cartSchema),
  address: mongoose.model("address", addressSchema),
  order: mongoose.model("order", orderSchema),
  coupon: mongoose.model("coupon", couponSchema),
  wishlist: mongoose.model("wishlist", wishlistSchema),
  wallet: mongoose.model("wallet", walletSchema),
  wallethistory: mongoose.model("wallethistory", walletHistorySchema),
};
