const express = require("express");
const PORT = 8001;
const app = express();
const { db, query } = require("./database");
const cors = require("cors");
const { authRoutes } = require("./routes");
const { body, validationResult } = require("express-validator");
const multer = require("multer");
const path = require("path");
const { error } = require("console");

app.use(cors());

app.use(express.json());
app.use(express.static("public"));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public");
  },
  filename: function (req, file, cb) {
    console.log();
    cb(
      null,
      path.parse(file.originalname).name +
        "-" +
        Date.now() +
        path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage });

// app.get('/user', async (req, res) => {
//     let fetchQuery = 'SELECT * FROM users'
//     db.query(fetchQuery, (err, result) => {
//         return res.status(200).send(result)
//     })
// })

app.post(
  "/validation",
  body("email").isEmail(),
  body("password").isLength({ min: 5 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }
    res.status(200).send(req.body);
  }
);

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    console.log(req.file);
    const { file } = req;
    const filePath = file ? "/" + file.filename : null;

    let data = JSON.parse(req.body.data);
    console.log(data);

    let response = await query(
      `UPDATE users SET imagePath = ${db.escape(
        filePath
      )} WHERE id_users = ${db.escape(data.id)}`
    );
    console.log(response);
    res.status(200).send({ filePath });
  } catch (e) {
    res.status(500).send(error);
  }
});

app.use("/auth", authRoutes);

app.listen(PORT, () => {
  console.log("Server is running on port: " + PORT);
});
