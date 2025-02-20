from .conf import sio


async def task_notification(user_id: int, msg: str):
    """
    Send a notification about a task.

    :param msg:
    :return:
    """
    user_session_uuid = None
    # TODO: Get session_uuid from Redis and use it to identify the user
    await sio.emit('task_notification', {'msg': msg}, to=user_session_uuid)