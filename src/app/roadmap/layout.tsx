import { Shell } from "@/components/layout/Shell";

export default function RoadmapLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Shell>
            {children}
        </Shell>
    );
}
