import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const baseurl = process.env.baseurl;


export const getBookList = async (req, res) => {
  try {
     const books = await prisma.book.findMany();
  const categories = await prisma.category.findMany();

  const booksWithProxyCover = books.map((book) => {
    if (book.coverUrl) {
      book.coverUrl = `${baseurl}/api/v1/google-image/${book.coverUrl}`;
    }
    if (book.fileUrl) {
      book.fileUrl = `https://drive.google.com/file/d/${book.fileUrl}/edit`;
    }
    return book;
  });

  res.status(200).json({
    books: booksWithProxyCover,   // array of books
    categories: categories        // array of categories
  });
  } catch (err) {
    console.error("Error fetching books:", err);
    res.status(500).json({ error: "Internal server error while fetching books" });
  }
};

export const serchedBook = async (req, res) => {
  try {
    const {title, author ,categoryId ,description} = req.params;
    console.log("Params received in getBookList:", title, author ,categoryId ,description);
    const books = await prisma.book.findMany({
      where: {
        OR: [title ? { title: { contains: title, mode: 'insensitive' } } : {},
              author ? { author: { contains: author, mode: 'insensitive' } } : {},
              categoryId ? { categoryId: { equals: parseInt(categoryId) } } : {},
              
        ]
      }
    });
    const params = req.params;
    console.log("Params received:", params);
    const booksWithProxyCover = books.map((book) => {
      if (book.coverUrl) {
          book.coverUrl   ?book.coverUrl = `${baseurl}/api/v1/google-image/${book.coverUrl}`
          : null;
      }
      if (book.fileUrl) {
          book.fileUrl = `https://drive.google.com/file/d/${book.fileUrl}/edit`
      }
      return book;
    });

    res.status(200).json(booksWithProxyCover);
  } catch (err) {
    console.error("Error fetching books:", err);
    res.status(500).json({ error: "Internal server error while fetching books" });
  }
};

// get hero books
export const getAllHeroes = async (req, res) => {
  try {

    const heroes = await prisma.hero.findMany({
      include: { book: true },
    });
    console.log(heroes)

    const heroesWithUpdatedBooks = heroes.map((hero) => {
      const updatedBook = { ...hero.book };

      if (updatedBook.coverUrl) {
        updatedBook.coverUrl = `${baseurl}/api/v1/google-image/${updatedBook.coverUrl}`;
      }
      if (updatedBook.fileUrl) {
        updatedBook.fileUrl = `https://drive.google.com/file/d/${updatedBook.fileUrl}/edit`;
      }

      return {
        ...hero,
        book: updatedBook,
      };
    });

    res.status(200).json(heroesWithUpdatedBooks);
  } catch (err) {
    console.error("Error fetching heroes:", err);
    res
      .status(500)
      .json({ error: "Internal server error while fetching heroes" });
  }
};
