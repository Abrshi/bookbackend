import { PrismaClient } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
const prisma = new PrismaClient();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 


export const finedBookByAi = async (req, res) => {
  try {
    const { userPrompt } = req.body;
    // 1. Fetch Title, Author, AND Description/Genre
    // The AI needs context to be "smart"
    const books = await prisma.book.findMany({
        select: { 
            id: true, 
            title: true, 
            author: true, 
            description: true, 
            categoryId: true,
            fileUrl: true,
            coverUrl: true 
        },
    });

    // 2. The "Smart" Prompt
    const prompt = `
      You are an expert librarian AI. 
      A user is asking for a recommendation based on this input: "${userPrompt}"

      Here is our library catalog: 
      ${JSON.stringify(books)}

      Tasks:
      1. Analyze the user's intent (e.g., are they sad? do they want adventure? do they want to learn?).
      2. Match their intent to the 'description' and 'genre' of our books.
      3. Select the SINGLE best match.
      
      Return ONLY this JSON format:
      {
        "id": number | null,
        "reason": "A short sentence explaining WHY this fits the user's request.but thes is directly desplayed to user so human friendly language. i needto to make the user to fell like heuman tokqking to them."
      }
      
      If nothing fits well, set id to null and explain why in the reason.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    // Clean and parse
    let text = response.text().replace(/```json/g, "").replace(/```/g, "").trim();
    const suggestion = JSON.parse(text);

    if (suggestion.id) {
        // Find the full book object to send back
        const bookDetails = books.find(b => b.id === suggestion.id);
        
        return res.status(200).json({
            success: true,
            book: bookDetails,
            // 3. This is the "Magic": The AI explains its choice to the user
            ai_reasoning: suggestion.reason 
        });
    } else {
        return res.status(200).json({ 
            success: false, 
            message: "We couldn't find a perfect match.",
            ai_reasoning: suggestion.reason 
        });
    }
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};


// bookrereview
export const revewBookByAi = async (req, res) => {
  try {
    const { id } = req.body.id;
    if (!id) {
      return res.status(400).json({ message: "Book ID missing" });
    }
    else if (isNaN(Number(id))) {
        console.log("Book ID is not valid" , id);
      return res.status(400).json({ message: "Book ID is not valid" }); 
    }

    // 1. Fetch single book
    const book = await prisma.book.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        title: true,
        author: true,
        description: true,
        categoryId: true,
        fileUrl: true,
        coverUrl: true,
      }
    });
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // 2. AI Prompt
    const prompt = `
You are an expert librarian AI. Write a review for the following book:
${JSON.stringify(book, null, 2)}
  Instructions:
- dont mention its AI generated
- Use a friendly and engaging tone.
- dont relay only on description,title and author but the achual google driv file to infer themes and style.
- Keep the review 5–8 sentences.
- Mention themes, writing style, and who would enjoy the book.
- Be friendly and helpful.
  If description or details are missing, create a general but meaningful review.
    `;
    // 3. Call AI Model (OpenAI official)
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const reviewText = response.text().trim();
    // 4. Send review to frontend
    return res.status(200).json({
      success: true,
      review: reviewText,
    });
  } catch (err) {
    console.error("AI Review Error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
