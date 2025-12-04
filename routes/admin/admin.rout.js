import express from "express";
import { addBook, addBookCatagory, addHero, deleteBookCategory, deleteHero, getAllBook, getAllBookCatagories, getAllHeroes, getUserList, updateBookCategory } from "../../controllers/admin/admin.controller.js";

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

router.post("/addbook", upload.fields([
                                        { name: "file", maxCount: 1 },
                                        { name: "cover", maxCount: 1 }
                                      ]),addBook);

router.get("/getAllBook" , getAllBook);
router.post("/addHero" , addHero);
router.get("/getAllHeroes", getAllHeroes);
router.delete("/deleteHero/:id", deleteHero);


export default router;
