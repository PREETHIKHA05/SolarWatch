import clientPromise from "@/lib/mongo";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const buildings = await db.collection("buildings").find({}).toArray();
    res.status(200).json(buildings);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch buildings" });
  }
}
