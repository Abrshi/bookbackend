import express from "express";
import { getAllHeroes, getBookList, serchedBook } from "../../controllers/user/getBook.controller.js";
import { finedBookByAi, revewBookByAi } from "../../controllers/user/aiBookSugestion.controller.js";


const router = express.Router();

// Get book list
router.get("/getBookList", getBookList);
router.get("/getBookList/:title/:author/:categoryId/:description", serchedBook);
router.post("/sugestBook" , finedBookByAi);
router.post("/reviewBookByAi" , revewBookByAi);
router.get("/getAllHeroes", getAllHeroes)
export default router;
