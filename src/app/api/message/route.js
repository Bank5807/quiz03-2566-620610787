import { DB, readDB, writeDB } from "@/app/libs/DB";
import { checkToken } from "@/app/libs/checkToken";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";

export const GET = async (request) => {
  const roomId = request.nextUrl.searchParams.get("roomId");

  readDB();

  if (roomId === null) {
    return NextResponse.json(
      {
        ok: false,
        message: `Room is not found`,
      },
      { status: 404 }
    );
  }

  if (roomId) {
    const messageIdlist = [];
    const messageTextlist = [];
    for (const ms of DB.messages) {
      if (ms.roomId == roomId) {
        messageIdlist.push(ms.messageId);
        messageTextlist.push(ms.messageText);
      }
    }

    const messages = [];
    for (const messageId of messageIdlist) {
      const message = DB.messages.find((x) => x.messageId === messageId);
      messages.push(message);
    }
  }
  {
    return NextResponse.json(
      {
        ok: true,
        messages: DB.messages,
      },
      { status: 200 }
    );
  }
};

export const POST = async (request) => {
  const body = await request.json();
  const { roomId } = body;

  readDB();

  const foundroomId = DB.rooms.find((x) => x.roomId === roomId);
  if (!foundroomId) {
    return NextResponse.json(
      {
        ok: false,
        message: `Room is not found`,
      },
      { status: 404 }
    );
  }

  const messageId = nanoid();

  writeDB();

  return NextResponse.json({
    ok: true,
    messageId: messageId,
    message: "Message has been sent",
  });
};

export const DELETE = async (request) => {
  const payload = checkToken();

  if (!payload) {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid token",
      },
      { status: 401 }
    );
  }

  const body = await request.json();
  const { messageId } = body;

  readDB();

  const foundmessageId = DB.messages.find((x) => x.messageId === messageId);

  if (!foundmessageId) {
    return NextResponse.json(
      {
        ok: false,
        message: "Message is not found",
      },
      { status: 404 }
    );
  }

  DB.messages.splice(DB.messages.messageId, 1);

  writeDB();

  return NextResponse.json({
    ok: true,
    message: "Message has been deleted",
  });
};
