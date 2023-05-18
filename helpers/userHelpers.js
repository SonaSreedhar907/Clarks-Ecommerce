const bcrypt = require('bcrypt')
const { isObjectIdOrHexString } = require('mongoose')
const { user, cart } = require('../model/connection')
const db = require('../model/connection')
const ObjectId=require('mongodb').ObjectId
const Razorpay=require('razorpay')
var instance = new Razorpay({
  key_id: 'rzp_test_djEP5tFIiP8WlG',
  key_secret: 'vliziyibhkalnlLPHrWpC0eQ',
});

module.exports = {



    doSignUp: (userData)=>{
        let response= {}
        return new Promise(async(resolve,reject)=>{
            

            try{
                email= userData.email;
                existingUser=  await db.user.findOne({email:email})
                if (existingUser)
                {
                    response= {status:false}
                    return resolve(response)
                }
                else{
                    var hashPassword= await bcrypt.hash(userData.password,10);
                    const data = {
                        username:userData.username,
                        Password:hashPassword,
                        email:userData.email,
                        phoneNumber:userData.phonenumber
                    }
                    console.log(data);
                    await db.user.create(data).then((data)=>{
                        resolve({data,status:true})
                    })

                }

            }
            catch(err){
                console.log(err)
            }
        })
    },

    dologin:(userData)=>{   
        return new Promise (async(resolve,reject)=>{
            try{
                let response={}
                let users= await db.user.findOne({email:userData.email})
                if(users){
                    if(users.blocked==false){
                        await bcrypt.compare(userData.password,users.Password).then((status)=>{
                            if(status){
                                response.user= users;
                                resolve({response,status:true})
                                
                            }else{
                                resolve({blockedStatus:false,status:false})
                            }
                        })

                    }else{
                        resolve({blockedStatus:true,status:false})
                            }

                }else{
                    resolve({blockedStatus:false,status:false})


                    }
                    
            }
            catch(err){
                console.log(err);
            }

            })
        

    },
    zoomlistProductShop:(productId)=>{
        return new Promise(async(resolve, reject) => {
          await db.products.findOne({_id:productId}).exec().then((response)=>{
            resolve(response)
         })
        })
      },

    listProductShop:(search,page,limit)=>{
        return new Promise(async(resolve, reject) => {
          await db.products.find({$or:[{Productname:{$regex:'.*'+search+'.*',$options:'i'}},{category:{$regex:'.*'+search+'.*',$options:'i'}},{ProductDescription :{$regex:'.*'+search+'.*',$options:'i'}}]}).sort({Price:1}).limit(limit*1).skip((page-1)*limit).then((response)=>{
            console.log(response,'bad')
            resolve(response)
         })
        })
      },

    

      otpverification:(otpvariable)=>{
        return new Promise(async(resolve, reject) => {
            await db.products.findOne({
                phoneNumber:otpvariable  }).then((response)=>{
                resolve(response)
            })
           })
         },
      


         addToCarts:(proId,userId)=>{
            return new Promise(async(resolve,reject)=>{
                let proobj={
                    product:ObjectId(proId),
                    quantity:1
                    
                }
                let obj={
                    userid:userId,
                    products:proobj
                }
                let usercart=await db.cart.find({userid:userId})
                if(usercart.length<1){
                    db.cart.create(obj)
                    
                }else{
                    let proExist=await db.cart.findOne({userid:userId,"products.product":ObjectId(proId)})
                    console.log(proExist+"PRO EXIST TTT TTT")
                    if(proExist){
                        db.cart.findOneAndUpdate({userid:userId,"products.product":ObjectId(proId)},{$inc:{"products.$.quantity":1}},function(err){
                            if(err){
                                console.log(err);
                            }
                        })
                    }
                    else{
                        db.cart.findOneAndUpdate({userid:userId},{$push:{products:proobj}},function(err){
                            if(err){
                                console.log(err);
                            }
                        
                        resolve({status:true})
                      })
                    }
                }resolve()
            })
         },

      


        //cart display 
        displayProducts: (usersId) => {
            return new Promise(async (resolve, reject) => {
              try {
              let  userId = new ObjectId(usersId);
                let cartItems = await db.cart
                .aggregate(
                  [
                    {
                      '$match': {
                        'userid': userId
                      }
                    }, {
                      '$unwind': {
                        'path': '$products'
                      }
                    }, {
                      '$lookup': {
                        'from': 'products', 
                        'localField': 'products.product', 
                        'foreignField': '_id', 
                        'as': 'proDetails'
                      }
                    }, {
                      '$project': {
                        'proDetails': 1, 
                        'products.quantity': '$products.quantity', 
                        'product': '$products.product', 
                        'sample': {
                          '$arrayElemAt': [
                            '$proDetails', 0
                          ]
                        }
                      }
                    }, {
                      '$project': {
                        'product': 1, 
                        'proDetails': 1, 
                        'products.quantity': 1, 
                        'price': '$sample.Price'
                      }
                    }, {
                      '$project': {
                        'proDetails': 1, 
                        'products.quantity': 1, 
                        '_id':1,
                        'subtotal': {
                          '$multiply': [
                            {
                              '$toInt': '$products.quantity'
                            }, {
                              '$toInt': '$price'
                            }
                          ]
                        }
                      }
                    }
                  ]
                  )
                 
                  resolve(cartItems);
                
              } catch {
                resolve(null);
              }
            });
          },

        

        getCartCount:(userId)=>{
          let count=0
          return new Promise(async(resolve,reject)=>{
            let cart=await db.cart.findOne({user:ObjectId(userId)})
            if(cart){
              count=cart.products.length
            }
            console.log(count)
            resolve(count)
           
          })
        },


        removeItem:(proId,userId)=>{
          return new Promise((resolve,reject)=>{
            db.cart.updateOne({userid:userId,"products.product":ObjectId(proId)},{$pull:{products:{product:ObjectId(proId)}}}).then((response)=>{
              resolve(response)
            })
          })
        },


        changeProductQuantity: (details) => {
          count = parseInt(details.count);
          quantity = parseInt(details.quantity);
          return new Promise((resolve, reject) => {
            if (count == -1 && quantity == 1) {
              db.cart
                .updateOne(
                  { _id: ObjectId(details.cart) },
                  {
                    $pull: { products: { item: ObjectId(details.product) } },
                  }
                )
                .then((response) => {
                  resolve({ removeProduct: true });
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
                });
            }
          });
        },

      change_Quantity : (details) => {

        details.count = parseInt(details.count)
        details.quantity = parseInt(details.quantity)
    
        return new Promise((resolve, reject) => {
            if (details.count == -1 && details.quantity == 1) {
                db.cart.findOneAndUpdate({
                    _id: details.cart
                }, {
                    $pull: {
                        products: {
                            product: ObjectId(details.product)
                        }
                    }
                }).then((response) => {
                    resolve({removeProduct: true})
                }).catch((error) => {
                    reject()
                })
            } else {
    
                db.cart.findOneAndUpdate({
                    _id: details.cart,
                    "products.product": ObjectId(details.product)
                }, {
                    $inc: {
                        "products.$.quantity": details.count
                    }
                }).then((response) => {
                    resolve({status: true})
                }).catch((error) => {
                    reject()
                })
            }
    
    
        })
    
    },

        
    displayProduct: (usersId) => {
      return new Promise(async (resolve, reject) => {
        try {
        let  userId = new ObjectId(usersId);
          let cartItems = await db.cart
          .aggregate(
            [
              {
                '$match': {
                  'userid': userId
                }
              }, {
                '$unwind': {
                  'path': '$products'
                }
              }, {
                '$lookup': {
                  'from': 'products', 
                  'localField': 'products.product', 
                  'foreignField': '_id', 
                  'as': 'proDetails'
                }
              }, {
                '$project': {
                  'proDetails': 1, 
                  'products.quantity': '$products.quantity', 
                  'product': '$products.product', 
                  'sample': {
                    '$arrayElemAt': [
                      '$proDetails', 0
                    ]
                  }
                }
              }, {
                '$project': {
                  'product': 1, 
                  'proDetails': 1, 
                  'products.quantity': 1, 
                  'price': '$sample.Price'
                }
              }, {
                '$project': {
                  'proDetails': 1, 
                  'products.quantity': 1, 
                  '_id':1,
                  'subtotal': {
                    '$multiply': [
                      {
                        '$toInt': '$products.quantity'
                      }, {
                        '$toInt': '$price'
                      }
                    ]
                  }
                }
              }
            ]
            )
           console.log(cartItems[0],'oooooooooooooppppppppptttttttttttt')
            resolve(cartItems);
          
        } catch {
          resolve(null);
        }
      });
    },


              

        getTotalAmount:(userId)=>{
            return new Promise(async (resolve, reject) => {
              try {
              let  uId =ObjectId(userId);
                let total = await db.cart
                .aggregate(
                  [
                    {
                      '$match': {
                        'userid': uId
                      }
                    }, {
                      '$unwind': {
                        path: '$products'
                      }
                     }, 
                     {
                      '$project': {
                        _id:0,
                       cart : '$products.product',
                        quantity: '$products.quantity'
                      }
                    },
                     {
                      '$lookup': {
                        'from': 'products', 
                        'localField': 'cart', 
                        'foreignField': '_id', 
                        'as': 'proDetails'
                      }
                    }, {
                      '$project': {
                        quantity: 1,
                        'prod': {
                          '$arrayElemAt': [
                            '$proDetails', 0
                          ]
                        }
                      }
                    },
                    {
                      '$project': {
                        _id:0,
                        price: '$prod.Price',
                        quantity:1 
                      }
                    }, 
                    {
                      $group: {
                        _id: null,
                        totalRevenue: { $sum: { $multiply: [ "$price", "$quantity" ] } }
                      }
                    }
                  ]
                  )
                resolve(total[0].totalRevenue );
                
              } catch {
                resolve(null);
              }
            });
          },

     
         
         


         getCartProductList:(userId)=>{
          return new Promise(async(resolve,reject)=>{
            let cart=await db.cart.findOne({userid:ObjectId(userId)})
            resolve(cart.products)
          })
         },

         getTotalAmounts:(userId)=>{
          return new Promise(async (resolve, reject) => {
            try {
              console.log(userId);
            let  uId =ObjectId(userId);
              let total = await db.cart
              .aggregate(
                [
                  {
                    '$match': {
                      'userid': uId
                    }
                  }, {
                    '$unwind': {
                      path: '$products'
                    }
                   }, 
                   {
                    '$project': {
                      _id:0,
                     cart : '$products.product',
                      quantity: '$products.quantity'
                    }
                  },
                   {
                    '$lookup': {
                      'from': 'products', 
                      'localField': 'cart', 
                      'foreignField': '_id', 
                      'as': 'proDetails'
                    }
                  }, {
                    '$project': {
                      quantity: 1,
                      'prod': {
                        '$arrayElemAt': [
                          '$proDetails', 0
                        ]
                      }
                    }
                  },
                  {
                    '$project': {
                      _id:0,
                      price: '$prod.Price',
                      quantity:1 
                    }
                  }, 
                  {
                    $group: {
                      _id: null,
                      totalRevenue: { $sum: { $multiply: [ "$price", "$quantity" ] } }
                    }
                  }
                ]
                )
            
              resolve(total[0].totalRevenue);
            } catch {
              resolve(null);
            }
          });
        },
      


      

        getOrderTheProducts:(orderId)=>{
          return new Promise(async (resolve, reject) => {
            try {
            let orderItems = await db.order.aggregate([
              {
                $match: { _id: ObjectId(orderId) }
              },
              {
                $unwind: '$products'
              },
              {
                $lookup: {
                  from: 'products',
                  localField: 'products.product',
                  foreignField: '_id',
                  as: 'productDetails'
                }
              },
              {
                $project: {
                  product: '$products.product',
                  quantity: '$products.quantity',
                  productDetails: '$productDetails'
                }
              }
            ])
              resolve(orderItems[0].productDetails[0]);
            } catch {
              resolve(null);
            }
          });
        },


        //profile

        addAddress:(data,id)=>{
            return new Promise((resolve,reject)=>{
              const address=new db.address({
                 owner:id,
                 name:data.name,
                 phone:data.phone,
                 billing_address:data.billing_address,
                 billing_address2:data.billing_address2,
                 city:data.city,
                 state:data.state,
                 zipcode:data.zipcode
              })
              address.save().then((data)=>{
                resolve(data)
              })
            })
        },

        getAllAddress:(id)=>{
          return new Promise(async(resolve,reject)=>{
            await db.address.find({owner:ObjectId(id)}).exec().then((response)=>{
              resolve(response)

            })
          })

        },

        getUserDetails:(id)=>{
            return new Promise(async(resolve,reject)=>{
              await db.user.find({_id:ObjectId(id)}).exec().then((response)=>{
                resolve(response[0])
              })
            })
        },

        deleteTheAddress: (id) => {
          return new Promise((resolve, reject) => {
            db.address.deleteOne({ _id: id }, (err) => {
              if (err) {
                console.error(err);
              } else {
                console.log('User deleted successfully');
              }
            });
          });
        },

        getAddressDetails:(id)=>{
             return new Promise(async(resolve,reject)=>{
                await db.address.findOne({_id:ObjectId(id)}).then((address)=>{
                resolve(address)
              })
              .catch(error=>{
                console.error(`the operation failed with error`)
              })
             })
        },

        updateAddress:(addressId,data)=>{
          return new Promise(async(resolve,reject)=>{
            await db.address.updateOne({_id:ObjectId(addressId)},{
              $set:{
                name:data.name,
                phone:data.phone,
                billing_address:data.billing_address,
                billing_address2:data.billing_address2,
                city:data.city,
                state:data.state,
                zipcode:data.zipcode,
              }
            })
            .then((response)=>{
              resolve()
            })
            .catch(error=>{
              console.error(`the operation failed with error`)
            })
          })
        },




        changePassword:(userid,body)=>{
          console.log('hai hello')
          return new Promise(async(resolve,reject)=>{
            try{
              const saltRounds=10;
              const hashPassword=await bcrypt.hash(body.npassword,saltRounds) 
              // console.log(hashPassword,'haiiii')
              const updateuser=await db.user.updateOne({_id:userid},{Password:hashPassword})
              console.log(updateuser,"hakuna matata")
              resolve(updateuser)
              return updateuser.nModified === 1;
            }catch(error){
                   reject(error)
            }
          })
             
        },
        
        placeOrder:(order,products,totalPrice,discountamt)=>{
          
          return new Promise((resolve,reject)=>{
                 let status=order.paymentMethod==='COD'?'placed':'pending'
                let orderObj= new db.order({
                  _id:ObjectId(),
                  userid:order.userId,
                  Name:order.Name,
                  phone:order.phone, 
                  address:order.address,
                  Email:order.Email,      
                  paymentMethod:order.paymentMethod,            
                  total:totalPrice,
                  products:products,
                  status:status,
                  date:new Date()
                })
               //console.log(orderObj.products)
                orderObj.save().then(async(response)=>{
                  db.cart.deleteOne({ userId: ObjectId(order.userId) }, (error) => {
                    if (error) {
                      console.log(error);
                    } else {
                      console.log('Cart item deleted successfully.');

                    }
                  });
                  resolve(response);
                })  

          })
         },    
         

         generateRazorpay:(orderId,total)=>{
          console.log(orderId,'9987')
          console.log(total,'6666666')
             return new Promise((resolve,reject)=>{
              const Razorpay = require('razorpay');
              var options = {
                amount: total*100,  // amount in the smallest currency unit
                currency: "INR",
                receipt: ""+orderId
              };
              instance.orders.create(options,function(err,order){
                console.log("new order :",order)
                resolve(order)
              })
             })
         },

         verifyPayment:(details)=>{
              return new Promise((resolve,reject)=>{
                   const crypto=require('crypto')
                   let hmac=crypto.createHmac('sha256','vliziyibhkalnlLPHrWpC0eQ')
                   hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]'])
                   hmac=hmac.digest('hex')
                   if(hmac==details['payment[razorpay_signature]']){
                    resolve()
                   }else{
                    reject()
                   }
              })
         },

         changePaymentStatus:(orderId)=>{
                return new Promise((resolve,reject)=>{
                  db.order.updateOne({_id:ObjectId(orderId)},{$set:{status:'placed'}}).then(()=>{
                               resolve()
                  })

                })
         },

         getbalanceWallet:(userid)=>{
           return new Promise(async(resolve,reject)=>{
            let wallet=await db.wallet.find({user:ObjectId(userid)})
            resolve(wallet[0])
           })
         },

         gethistory:(userId)=>{
          return new Promise(async(resolve,reject)=>{
            let wallet=await db.wallethistory.find({user:ObjectId(userId)})
            resolve(wallet)
           })

         },

         getUserOrders:(userId)=>{
          return new Promise(async(resolve,reject)=>{
            let orders=await db.order.find({userid:ObjectId(userId)}).sort({date:-1})
            resolve(orders)
          })
        },
        
        getShipAddress:(orderId)=>{

          return new Promise(async (resolve, reject) => {
            try {
            let orderItems = await db.order.aggregate([
              {
                $match: { _id: ObjectId(orderId) }
              },
              
              {
                $lookup: {
                  from: 'addresses',
                  localField: 'address',
                  foreignField: '_id',
                  as: 'address'
                }
              },

            ])
            
              let response=orderItems[0].address
              resolve(response);
            } catch {
              resolve(null);
            }
          });
        },

        getShipProducts:(id)=>{
          return new Promise(async(resolve,reject)=>{
            let orders=await db.order.find({_id:ObjectId(id)})
            //console.log(orders[0],'mazhaaaaaaaaaaaaaa')
            resolve(orders)
          })
        },


        getOrder:(id)=>{
          return new Promise(async(resolve,reject)=>{
            let orders=await db.order.find({_id:ObjectId(id)})
            console.log(orders[0],'mazhaaaaaaaaaaaaaa')
            resolve(orders[0])
          })
        },

      cartOrder :async(userId)=>{
        try {
            return new Promise(async (resolve, reject) => {
                const cartItems =await db.cart.aggregate([
                    { $match: { userid: ObjectId(userId) } },
                    { $unwind: "$products" },
                    {
                      $lookup: {
                        from: "products",
                        localField: "products.product",
                        foreignField: "_id",
                        as: "products.product"
                      }
                    },
                    { $unwind: "$products.product" },
                    {
                      $group: {
                        _id: "$_id",
                        userid: { $first: "$userid" },
                        products: { $push: "$products" }
                      }
                    },
                    {
                      $project: {
                        _id: 0,
                        userid: 1,
                        products: {
                          product: {
                            _id: 1,
                            Productname: 1,
                            ProductDescription:1,
                            Price: 1,
                            Image:1
                            // include any other fields you want from the product collection
                          },
                          quantity: 1
                        }
                      }
                    }
                  ]);     
                  //console.log(cartItems)
                  //console.log(cartItems[0].products)
                  resolve(cartItems[0]?.products)  
      
            })
      
        } catch (error) {
            console.log(error)
        }
      
      },
      addToWallet: async (refund, userId) => {
        try {
          const amount = Number(refund);
          const userWallet = await db.wallet.findOne({ user: userId });
      
          if (userWallet) {
            // Update the balance in the wallet
            // await db.wallet.updateOne({ user: userId }, { $inc: { balance: amount } }, { upsert: true });
           const response= await db.wallet.updateOne({ user: userId }, { $inc: { balance: amount } });
            // Create a new document in the wallethistory collection
            const historywallet = {
              user: userId,
              balance: amount,
             
              date: Date.now()
            }
            await db.wallethistory.create(historywallet);
      
          } else {
            const balanceObj = { user: userId, balance: amount };
            await db.wallet.create(balanceObj);
      
            // Create a new document in the wallethistory collection
            const historywallet = {
              user: userId,
              balance: amount,
              
              date: Date.now()
            };
            await db.wallethistory.create(historywallet);
          }
          resolve(response)
          console.log('Balance updated successfully.');
      
        } catch (error) {
          console.error(error);
        }
      },
      
     
      // addToWallet:async(refund, userId) => {
      //   let amount = parseInt(refund)
      //   try {
      //     let userWallet = await db.wallet.findOne({ user: userId })
      //     if (userWallet) {
      //       await db.wallet.updateOne({ user: userId }, { $inc: { balance: amount } })
      //       const historywallet={
      //         user:userId,
      //         balance:refund,
      //         date: Date.now()
      //       }
      //       await db.wallethistory.create(historywallet)
            
      //     } else {
      //       let balanceObj = { user: userId, balance: amount }
      //       await db.wallet.create(balanceObj)
      //       const historywallet = {
      //         user: userId,
      //         balance: amount,
      //         date: Date.now()
      //       };
      //       await db.wallethistory.create(historywallet);
      //     }
      //     }
      
      //     console.log('Balance updated successfully.')
      //   } catch (error) {
      //     console.error(error)
      //   }
      // },

      cancelOrder:(orderId)=>{
        return new Promise(async(resolve,reject)=>{
          await db.order.updateOne({_id:ObjectId(orderId)},{$set:{status:'Cancelled'}}).then(()=>{
          resolve()
          })
          })
      
      },

      returnOrder:(orderId)=>{
        console.log(orderId)
        return new Promise(async(resolve,reject)=>{
          await db.order.updateOne({_id:ObjectId(orderId)},{$set:{status:'Return'}}).then(()=>{
            resolve()
          })
        })
      },

     
      getAllSales : () => {
        return new Promise(async(resolve,reject)=>{
          let sales=await db.order.find({status:"Delivered"}).sort({date:-1})
          resolve(sales)
        })

      },


      getAllSalesInDateRange: (date1, date2) => {
        return new Promise(async (resolve, reject) => {
          try {
            const sales = await db.order.aggregate([
                {
                  $match: {
                    status: 'Delivered',
                    date: {
                      $gte: new Date(date1),
                      $lte: new Date(date2)
                    },
                  },
                }
              ])         
            console.log("Sales---", sales);
            resolve(sales);
          } catch (error) {
            console.log("Error fetching sales: ", error);
            reject(error);
          }
        });
      },


       //category separation shop
       getFilerCategory:(catName)=>{
        console.log(catName,'sana sona sayooj')
        return new Promise((resolve,reject)=>{
            db.products.find({category:catName}).then((response)=>{
              console.log('haiii')
              console.log(response)
              resolve(response)
            })
        })
       },

       ///wishlist


       getWishlistCount:(userId)=>{
        let count=0
        return new Promise(async(resolve,reject)=>{
          let wishlist=await db.wishlist.findOne({user:ObjectId(userId)})
          if(wishlist){
            count=wishlist.products.length
          }
          console.log(count,'hai hellooo')
          resolve(count)
          
        })
      },

       addToWishlist:(proId,userId)=>{
        return new Promise(async(resolve,reject)=>{
          let proobj={
              product:ObjectId(proId),
              quantity:1
          }
          let obj={
              userid:userId,
              products:proobj
          }
          let usercart=await db.wishlist.find({userid:userId})
          if(usercart.length<1){
              db.wishlist.create(obj)
              
          }else{
              let proExist=await db.wishlist.findOne({userid:userId,"products.product":ObjectId(proId)})
              console.log(proExist+"PRO EXIST TTT TTT")
              if(proExist){
                  db.wishlist.findOneAndUpdate({userid:userId,"products.product":ObjectId(proId)},{$inc:{"products.$.quantity":1}},function(err){
                      if(err){
                          console.log(err);
                      }
                  })
              }
              else{
                  db.wishlist.findOneAndUpdate({userid:userId},{$push:{products:proobj}},function(err){
                      if(err){
                          console.log(err);
                      }
                  
                  resolve({status:true})
                })
              }
          }resolve()
      })
   },


   displaywishlist:(usersId)=>{
      return new Promise(async (resolve, reject) => {
        try {
        let  userId = new ObjectId(usersId);
          let wishlistItems = await db.wishlist
          .aggregate(
            [
              {
                '$match': {
                  'userid': userId
                }
              }, {
                '$unwind': {
                  'path': '$products'
                }
              }, {
                '$lookup': {
                  'from': 'products', 
                  'localField': 'products.product', 
                  'foreignField': '_id', 
                  'as': 'proDetails'
                }
              }, {
                '$project': {
                  'proDetails': 1, 
                  'products.quantity': '$products.quantity', 
                  'product': '$products.product', 
                  'sample': {
                    '$arrayElemAt': [
                      '$proDetails', 0
                    ]
                  }
                }
              }, {
                '$project': {
                  'product': 1, 
                  'proDetails': 1, 
                  'products.quantity': 1, 
                  'price': '$sample.Price'
                }
              }, {
                '$project': {
                  'proDetails': 1, 
                  'products.quantity': 1, 
                  '_id':1,
                  'subtotal': {
                    '$multiply': [
                      {
                        '$toInt': '$products.quantity'
                      }, {
                        '$toInt': '$price'
                      }
                    ]
                  }
                }
              }
            ]
            )
            console.log(wishlistItems,'999999999999999999999999')
            resolve(wishlistItems);
          
        } catch {
          resolve(null);
        }
      });
    },

    removeWishlistItem:(proId,userId)=>{
      return new Promise((resolve,reject)=>{
        db.wishlist.updateOne({userid:userId,"products.product":ObjectId(proId)},{$pull:{products:{product:ObjectId(proId)}}}).then((response)=>{
          resolve(response)
        })
      })

    },
   



    getsubTotal: (userId) => {
      return new Promise(async (resolve, reject) => {
        try {
          console.log(userId);
          // let uId = ObjectId(userId);
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
              '$project': {
                'result': {
                  '$multiply': [
                    '$quantity', '$price'
                  ]
                }
              }
            }
          ]);
          console.log(subtotal,"<------>");
          resolve(subtotal);
        } catch {
          resolve(null);
        }
      });
    },


    documentCount: () => {
      return new Promise(async (resolve, reject) => {
        await db.products.find().countDocuments().then((documents) => {
          resolve(documents);
        })
      })
    },
       
  documentCounts:()=>{
    return new Promise(async(resolve,reject)=>{
      await db.order.find().countDocuments().then((documents)=>{
        resolve(documents)
      })
    })
  },

  documentcount:()=>{
    return new Promise(async(resolve,reject)=>{
      await db.coupon.find().countDocuments().then((documents)=>{
        console.log(documents,"havvuu")
        resolve(documents)
      })
    })
  },


  couponMatch:(couponCode)=>{
    try {
      console.log("inside coupon,atch");
      return new Promise(async (resolve, reject) => {
        const couponExist = await db.coupon.findOne({ code: couponCode })
         if (couponExist) {

           resolve(couponExist);
         } else {
           reject(new Error("Invalid coupon"));
         }
        
      })
    } catch (error) {
      console.log(error);
       throw new Error("Error fetching coupon");
    }
  },



addToWishList: (proId, userId) => {
  let proObj = {
    productId: proId,
  };

  return new Promise(async (resolve, reject) => {
    let wishlist = await db.wishlist.findOne({ user: userId });
    if (wishlist) {
      let productExist = wishlist.wishitems.findIndex(
        (item) => item.productId == proId
      );
      if (productExist == -1) {
        db.wishlist
          .updateOne(
            { user: userId },
            {
              $addToSet: {
                wishitems: proObj,
              },
            }
          )
          .then(() => {
            resolve({ status: true });
          });
      }
    } else {
      const newWishlist = new db.wishlist({
        user: userId,
        wishitems: proObj,
      });

      await newWishlist.save().then(() => {
        resolve({ status: true });
      });
    }
    resolve();
  });
},

ListWishList: (userId) => {
  console.log(userId, "this is user Id view wishlist");
  return new Promise(async (resolve, reject) => {
    await db.wishlist
      .aggregate([
        {
          $match: {
            // user: ObjectId(userId)
            user: new ObjectId(userId),
          },
        },
        {
          $unwind: {
            path: "$wishitems",
            includeArrayIndex: "string",
          },
        },
        {
          $project: {
            // item: '$wishitems.productId',
            item: "$wishitems.productId",
          },
        },
        {
          $lookup: {
            // from: 'product',
            // localField: "item",
            // foreignField: "_id",
            // as: 'wishlist'

            from: "products",
            localField: "item",
            foreignField: "_id",
            as: "wishlist",
          },
        },
        {
          $unwind: "$wishlist",
        },

        {
          $project: {
            item: 1,
            //  wishlist: { $arrayElemAt: ['$wishlist', 0] }

            Productname: "$wishlist.Productname",
            Price: "$wishlist.Price",
            Image: "$wishlist.Image",
          },
        },

    
      ])
      .then((wishlist) => {
        console.log(wishlist);
        console.log("hhhhhhhhhhhhhhhhh");
        resolve(wishlist);
      });
  });
},

getWishCount: (userId) => {
  return new Promise(async (resolve, reject) => {
    let count = 0;
    let wishlist = await db.wishlist.findOne({ user: userId });
    if (wishlist) {
      count = wishlist.wishitems.length;
    }

    resolve(count);
  });
},

getDeleteWishList: (body) => {
  console.log(body);

  return new Promise(async (resolve, reject) => {
    await db.wishlist
      .updateOne(
        { _id: body.wishlistId },
        {
          $pull: { wishitems: { productId: body.productId } },
        }
      )
      .then(() => {
        resolve({ removeProduct: true });
      });
  });
},



}
      
 

 
 
