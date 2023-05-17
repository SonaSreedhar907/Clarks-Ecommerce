// const multer= require('multer');

// const Storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/uploads')
//     },
//     filename: (req, file, cb) => {
//         cb(null, file.originalname)
//     }
// });
  

//   const editedStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/uploads')
//     },
//     filename: (req, file, cb) => {
//         cb(null, file.originalname)
//     }
// });


// module.exports={
//     uploads:multer({storage:Storage}).array('Image',4),
//     editeduploads:multer({storage:editedStorage}).fields([
//         {name:'file1',maxCount:1},
//         {name:'file2',maxCount:1},
//         {name:'file3',maxCount:1},
//         {name:'file4',maxCount:1}

//     ])

// }


const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/products');
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  // Accept only jpeg and png files
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const uploads = multer({
  storage: storage,
  fileFilter: fileFilter,
});

module.exports = { uploads }