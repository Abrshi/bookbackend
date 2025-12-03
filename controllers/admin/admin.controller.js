import { PrismaClient } from "@prisma/client";
import { uploadFileToDrive } from "../googleDrive.js";


const prisma = new PrismaClient();

export const addBookCatagory = async (req, res) => {
  const { catagory } = req.body;
  if (!catagory)
    return res.status(400).json({ error: "categoryis required" });

  try {
    const existing = await prisma.category.findFirst({
      where: { category: catagory },
    });

    if (existing)
      return res.status(409).json({ error: "This category already exists" });

    const createdCategory = await prisma.category.create({
      data: {
        category: catagory,
      },
    });

    return res.status(201).json({
      message: "Category created successfully!",
      category: createdCategory,
    });

  } catch (err) {
    console.error("category creation error:", err);
    return res
      .status(500)
      .json({ error: "Internal server error during category creation" });
  }
};


export const getAllBookCatagories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.status(200).json(categories);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ error: "Internal server error while fetching categories" });
  }
};

export const deleteBookCategory = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    if (!id) {
      return res.status(400).json({ error: "Category ID is required" });
    }
    const deleted = await prisma.category.delete({
      where: { id: Number(id) },
    });
    return res.status(200).json({
      message: "Category deleted successfully",
      deleted,
    });
  } catch (err) {
    console.error("Error deleting category:", err);

    if (err.code === "P2025") {
      return res.status(404).json({ error: "Category not found" });
    }

    return res.status(500).json({
      error: "Internal server error while deleting category",
    });
  }
};
export const updateBookCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { category } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Category ID is required" });
    }

    if (!category || category.trim() === "") {
      return res.status(400).json({ error: "Category name cannot be empty" });
    }

    const updated = await prisma.category.update({
      where: { id: Number(id) },
      data: { category },
    });

    return res.status(200).json({
      message: "Category updated successfully",
      updated,
    });
  } catch (err) {
    console.error("Error updating category:", err);

    if (err.code === "P2025") {
      return res.status(404).json({ error: "Category not found" });
    }

    return res.status(500).json({
      error: "Internal server error while updating category",
    });
  }
};

export const addBook = async (req, res) => {
  try {
    const { title, author, categoryId, description, publishedAt } = req.body;

    if (!title || !categoryId)
      return res.status(400).json({ error: "Missing required fields" });

    if (!req.files || !req.files.file)
      return res.status(400).json({ error: "No book file uploaded" });

    const category = parseInt(categoryId);
    if (isNaN(category))
      return res.status(400).json({ error: "Invalid categoryId" });

    // Validate publishedAt
    let pubDate = new Date(publishedAt);
    if (publishedAt && isNaN(pubDate.getTime()))
      return res.status(400).json({ error: "Invalid publishedAt date" });

    // Upload main file
    const fileUploaded = req.files.file[0];
    const fileUrl = await uploadFileToDrive(fileUploaded);
    console.log(fileUrl);
    if (!fileUrl)
      return res.status(500).json({ error: "File upload failed" });
    
    // Upload cover
    let coverUrl = null;
    if (req.files.cover && req.files.cover.length > 0) {
      const coverUploaded = req.files.cover[0];
      coverUrl = await uploadFileToDrive(coverUploaded);
    }
    const newBook = await prisma.book.create({
      data: {
        title,
        author: author || null,
        description: description || null,
        categoryId: category,
        fileUrl,
        coverUrl,
        publishedAt: publishedAt ? pubDate : new Date(),
      },
    });

    return res.status(201).json({
      message: "Book added successfully",
      book: newBook,
    });

  } catch (error) {
    console.error("Add book error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserList = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // passwordHash: false  // not needed when using select
      },
    });

    res.status(200).json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Internal server error while fetching users" });
  }
};
