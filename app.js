const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const router = express.Router();
const cors = require("cors");
const fs = require("fs");
const multer = require("multer");
const { createWorker } = require("tesseract.js");
const worker = createWorker();

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
    const { data: { text } } = await worker.recognize(`./${req.file.originalname}`);
    const temp = []
    const exc = ['=', '!', '\n']
    text.split('').map((data) => {
        if(data !== '=') temp.push(data)
    })
    console.log(text);
    return res.send(text)
  } catch (error) {
    console.log(error);
  }
  // fs.readFile(`./${req.file.originalname}`, (err, data) => {
  //     if(err) return console.log(err);
  //     console.log(data);
  // })
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.listen(2000, () => console.log("running"));
