from .stream import Stream
from sse_starlette import ServerSentEvent
from fastapi import Depends


async def send_event(data: dict, stream: Stream):
    """
    Send event to specific client.

    :param data: event data
    :param stream: event stream
    :return:
    """
    await stream.asend(
        ServerSentEvent(data=data)
    )