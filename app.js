const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const router = express.Router();
const cors = require("cors");
const fs = require("fs");
const multer = require("multer");
const { createWorker } = require("tesseract.js");
const worker = createWorker();

app.use(cors());
const filter = (req, file, cb) => {
  if (file.mimetype.includes("jpg")) {
    cb(null, true);
  } else {
    cb("Please upload only excel file.", false);
  }
};

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });
app.use(router);
router.get("/", (req, res) => res.send("halo"));
router.post("/", upload.single("file"), async (req, res) => {
  try {
    await worker.load();
    await worker.loadLanguage("eng");
    await worker.initialize("eng");
    const {
      data: { text },
    } = await worker.recognize(`./${req.file.originalname}`);
    const result = [];
    const temp = req.body.key.split(',')
    temp.map((tempp) =>
      result.push({ key: tempp.trim(), value: text.toUpperCase().includes(tempp.trim().toUpperCase()) })
    );
    const findTrue = result.filter((e) => e.value === true);
    let msg = ''
    for (let i = 0; i < result.length; i++) {
      msg += result[i].key + ' = ' + result[i].value;
      if(i < result.length - 1) msg += ', '
      
    }
    if(findTrue.length < 1){
      fs.unlinkSync(`./${req.file.originalname}`)
      return res.status(400).json({msg: msg})
    }
    
    fs.unlinkSync(`./${req.file.originalname}`)
    return res.json({msg: msg})
  } catch (error) {
    console.log(error);
  }
});

app.use(bodyParser.urlencoded({ extended: true }));

app.listen(2000, () => console.log("running"));
