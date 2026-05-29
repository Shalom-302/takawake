"use client";

import { BookmarkIcon, HeartIcon, MessageCircleTwoIcon } from "../icons";

export default function LikeCommentSaveBar({
    like,
    comment,
    time,
}: {
    like: number;
    comment: number;
    article_id: string;
    time: string;
}) {
    return (
        <>
            <div className="flex items-center gap-4 text-(--black-tekawake-200) ">
                <span className="font-medium inline-block text-sm">{time}</span>
                <div className="flex items-center gap-1">
                    <div className="h-6 w-6 shrink-0 flex items-center justify-center ">
                        <HeartIcon size={20} />
                    </div>
                    <span className="font-medium inline-block text-sm">{like}</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="h-6 w-6 shrink-0 flex items-center justify-center ">
                        <MessageCircleTwoIcon size={20} />
                    </div>
                    <span className="font-medium inline-block text-sm">{comment}</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="h-6 w-6 shrink-0 flex items-center justify-center ">
                        <BookmarkIcon size={20} />
                    </div>
                </div>
            </div>
        </>
    );
}
