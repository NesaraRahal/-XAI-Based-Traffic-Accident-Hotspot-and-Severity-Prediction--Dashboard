import asyncio
from app.database.connection import connect_to_mongo, close_mongo_connection, get_collection

async def main():
    await connect_to_mongo()
    print("✅ Connected")

    collection = get_collection()
    count = await collection.count_documents({})
    print(f"Documents in collection: {count}")

    doc = await collection.find_one({})
    print("Sample doc:")
    print(doc)

    await close_mongo_connection()

asyncio.run(main())