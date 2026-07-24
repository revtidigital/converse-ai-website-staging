import asyncio

from fastapi import Request


async def watch_disconnect(request: Request, event: asyncio.Event) -> None:
    while not event.is_set():
        if await request.is_disconnected():
            event.set()
            return
        await asyncio.sleep(0.1)
