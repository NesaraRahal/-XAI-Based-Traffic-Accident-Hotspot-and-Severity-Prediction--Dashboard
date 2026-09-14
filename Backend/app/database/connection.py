from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

client: AsyncIOMotorClient = None

async def connect_to_mongo():
    global client
    client = AsyncIOMotorClient(settings.mongo_uri)
    await client.admin.command("ping")  # fails fast if URI/creds are bad

async def close_mongo_connection():
    client.close()

def get_collection():
    return client[settings.mongo_db][settings.collection_name]  # was settings.db_name — didn't exist on Settings