"use client";

import { useState } from "react";
import { Button } from "@/components/ui/buttons/button";
import { Plus } from "lucide-react";
import { ManageTestDialog, TestList } from "@/components/tests";

export default function TestPage() {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    return (
        <div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New test
            </Button>

            <TestList />

            <ManageTestDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
        </div>
    );
}
