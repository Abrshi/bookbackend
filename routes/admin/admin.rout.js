import express from "express";
import {
  addBook,
  addBookCatagory,
  deleteBookCategory,
  getAllBookCatagories,
  getUserList,
  updateBookCategory
} from "../../controllers/admin/admin.controller.js";

import { upload } from "../../middlewares/upload.js";

const router = express.Router();
// user
router.get("/getUserList", getUserList);

// 
router.post("/addbookcatagory", addBookCatagory);
router.get("/getAllBookCatagories", getAllBookCatagories);

// FIXED (removed extra /admin)
router.delete("/deleteBookCategory/:id", deleteBookCategory);
router.put("/updateBookCategory/:id", updateBookCategory);

router.post(
  "/addbook",
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "cover", maxCount: 1 }
  ]),
  addBook
);

export default router;
