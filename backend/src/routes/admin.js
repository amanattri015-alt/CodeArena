const express = require("express");
const router = express.Router();
const adminMiddleware = require("../middleware/adminMiddlware");
const { dashboard,getUsers,getUser,deleteUser,getSubmissions,getSubmission,getProblem } = require("../controller/adminController");

router.use(adminMiddleware);
router.get("/dashboard", dashboard);
router.get("/problems/:id", getProblem);
router.get("/users", getUsers);
router.get("/users/:id", getUser);
router.delete("/users/:id", deleteUser);
router.get("/submissions", getSubmissions);
router.get("/submissions/:id", getSubmission);

module.exports = router;
