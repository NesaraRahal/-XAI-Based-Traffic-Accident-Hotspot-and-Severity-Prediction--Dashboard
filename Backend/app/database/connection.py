from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorCollection
from app.config import settings

client: AsyncIOMotorClient | None = None


async def connect_to_mongo() -> None:
    global client
    client = AsyncIOMotorClient(settings.mongo_uri)
    await client.admin.command("ping")  # fails fast if URI/creds are bad


async def close_mongo_connection() -> None:
    if client is not None:
        client.close()


def get_collection(name: str) -> AsyncIOMotorCollection:
    if client is None:
        raise RuntimeError("Mongo client not initialised. Call connect_to_mongo() first.")
    return client[settings.mongo_db][name]


def get_dashboard_collection() -> AsyncIOMotorCollection:
    return get_collection(settings.predictions_collection)