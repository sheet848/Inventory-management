import Link from "next/link";
import { cn } from "@/lib/utils";

interface PaginationProps {
    page: number;
    totalPages: number;
    baseUrl: string;
}

export default function Pagination({ page, totalPages, baseUrl }: PaginationProps) {
    return (
        <div className="flex items-center justify-between mt-6">
            {/* Previous */}
            <Link
                href={`${baseUrl}?page=${page - 1}`}
                className={cn(
                    "px-4 py-2 rounded border text-sm",
                    page <= 1
                        ? "pointer-events-none opacity-50"
                        : "hover:bg-muted"
                )}
            >
                Previous
            </Link>
            {/* Page Numbers */}
            <div className="flex gap-1">
                {Array.from({ length: totalPages }).map((_, i) => {
                    const p = i + 1;
                    return (
                        <Link
                            key={p}
                            href={`${baseUrl}?page=${p}`}
                            className={cn(
                                "px-3 py-2 rounded border text-sm",
                                p === page
                                    ? "bg-primary text-primary-foreground"
                                    : "hover:bg-muted"
                            )}
                        >
                            {p}
                        </Link>
                    );
                })}
            </div>

            {/* Next */}
            <Link
                href={`${baseUrl}?page=${page + 1}`}
                className={cn(
                    "px-4 py-2 rounded border text-sm",
                    page >= totalPages
                        ? "pointer-events-none opacity-50"
                        : "hover:bg-muted"
                )}
            >
                Next
            </Link>
        </div>
    );
}
