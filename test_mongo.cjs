const { MongoClient } = require("mongodb");
require("dotenv").config();

async function run() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.log("No MONGODB_URI found.");
        return;
    }
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const database = client.db();

        console.log("USERS:");
        const users = await database.collection("users").find({}).toArray();
        users.forEach(u => console.log(`${u._id} | ${u.email} | ${u.role} | activo: ${u.activo}`));

        console.log("NOTIFICATIONS:");
        const notifs = await database.collection("notifications").find({}).sort({ createdAt: -1 }).limit(5).toArray();
        console.log("Total length:", await database.collection("notifications").countDocuments());
        notifs.forEach(n => console.log(`${n._id} | usuario: ${n.usuario} | tipo: ${n.tipo}`));
    } finally {
        await client.close();
    }
}
run().catch(console.dir);
