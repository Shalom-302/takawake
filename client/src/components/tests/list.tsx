"use client";

import useSWR from "swr";
import testService from "@/lib/services/test-service";

// SWR fetcher using testService
const fetchTests = async () => {
    return await testService.getTests();
};

export default function TestList() {
    const { data: tests, error, isLoading } = useSWR("tests", fetchTests);

    if (isLoading) return <p>Loading tests...</p>;
    if (error) return <p className="text-red-500">Failed to load tests.</p>;

    console.log("hehehe", tests);
    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">Test List</h1>

            {tests?.length === 0 ? (
                <p>No tests available.</p>
            ) : (
                <ul className="space-y-2">
                    {tests?.map(test => (
                        <li key={test.id} className="border p-4 rounded shadow-sm">
                            <h2 className="font-semibold">{test.name}</h2>
                            {test.description && (
                                <p className="text-sm text-gray-600">{test.description}</p>
                            )}
                            <p className="text-xs text-gray-400">
                                Created at: {new Date(test.created_at).toLocaleString()}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
