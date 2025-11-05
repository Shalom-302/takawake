"use client";

import React from "react";
import DOMPurify from "dompurify";

type Props = {
    html: string;
    className?: string;
};

export const RichTextDisplay: React.FC<Props> = ({ html, className }) => {
    const sanitized = DOMPurify.sanitize(html);

    return <div className={className} dangerouslySetInnerHTML={{ __html: sanitized }} />;
};

export default RichTextDisplay;
