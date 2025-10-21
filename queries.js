// queries.js
const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://munde:munde@cluster0.deyeof3.mongodb.net/";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db("plp_bookstore");
    const books = db.collection("books");

    // 1️⃣ Find all books in a specific genre
    const fantasyBooks = await books.find({ genre: "Fantasy" }).toArray();
    console.log("Fantasy books:", fantasyBooks);

    // 2️⃣ Find books published after a certain year
    const recentBooks = await books.find({ published_year: { $gt: 2000 } }).toArray();
    console.log("Books published after 2000:", recentBooks);

    // 3️⃣ Find books by a specific author
    const orwellBooks = await books.find({ author: "George Orwell" }).toArray();
    console.log("Books by George Orwell:", orwellBooks);

    // 4️⃣ Update the price of a specific book
    const updatePrice = await books.updateOne(
      { title: "The Alchemist" },
      { $set: { price: 18.99 } }
    );
    console.log("Updated price:", updatePrice.modifiedCount > 0 ? "Success" : "No match");

    // 5️⃣ Delete a book by its title
    const deleteBook = await books.deleteOne({ title: "Moby Dick" });
    console.log("Deleted book:", deleteBook.deletedCount > 0 ? "Success" : "Not found");

    // 6️⃣ Find books that are in stock and published after 2010
    const modernStocked = await books.find({
      in_stock: true,
      published_year: { $gt: 2010 },
    }).toArray();
    console.log("In-stock books published after 2010:", modernStocked);

    // 7️⃣ Projection: show only title, author, and price
    const projection = await books.find({}, { projection: { title: 1, author: 1, price: 1, _id: 0 } }).toArray();
    console.log("Projection:", projection);

    // 8️⃣ Sort books by price ascending
    const sortedAsc = await books.find().sort({ price: 1 }).toArray();
    console.log("Books sorted by price (asc):", sortedAsc);

    // 9️⃣ Sort books by price descending
    const sortedDesc = await books.find().sort({ price: -1 }).toArray();
    console.log("Books sorted by price (desc):", sortedDesc);

    // 🔟 Pagination: limit and skip
    const page1 = await books.find().skip(0).limit(5).toArray();
    const page2 = await books.find().skip(5).limit(5).toArray();
    console.log("Page 1:", page1);
    console.log("Page 2:", page2);

    // 1️⃣1️⃣ Average price of books by genre
    const avgPriceByGenre = await books.aggregate([
      { $group: { _id: "$genre", averagePrice: { $avg: "$price" } } }
    ]).toArray();
    console.log("Average price by genre:", avgPriceByGenre);

    // 1️⃣2️⃣ Author with the most books
    const mostBooks = await books.aggregate([
      { $group: { _id: "$author", totalBooks: { $sum: 1 } } },
      { $sort: { totalBooks: -1 } },
      { $limit: 1 }
    ]).toArray();
    console.log("Author with the most books:", mostBooks);

    // 1️⃣3️⃣ Group books by publication decade
    const booksByDecade = await books.aggregate([
      {
        $project: {
          decade: {
            $concat: [
              { $toString: { $subtract: ["$published_year", { $mod: ["$published_year", 10] }] } },
              "s"
            ]
          },
          title: 1,
        },
      },
      { $group: { _id: "$decade", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]).toArray();
    console.log("Books by decade:", booksByDecade);

    // 1️⃣4️⃣ Create an index on title
    await books.createIndex({ title: 1 });
    console.log("Index created on title");

    // 1️⃣5️⃣ Create a compound index on author and published_year
    await books.createIndex({ author: 1, published_year: 1 });
    console.log("Compound index created");

    // 1️⃣6️⃣ Check performance using explain()
    const explain = await books.find({ title: "1984" }).explain("executionStats");
    console.log("Explain output:", explain.executionStats);

  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await client.close();
  }
}

run().catch(console.error);
