import { Shell } from "@/components/layout/Shell";

export default function VerificationLayout({
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
