import KashkaMarkdown from '@/components/ui/kashka-markdown';

export default function Home() {
    let markdown = "# Nothing found"

    if (typeof process.env["kashkaImprint"] === "string")
        markdown = process.env["kashkaImprint"]
    else
        console.warn("No imprint found in process.env",  process.env["kashkaImprint"])

    return (
        <section className="flex flex-col gap-4">
            <KashkaMarkdown>{markdown}</KashkaMarkdown>
        </section>
    );
}

export const dynamic = 'force-dynamic'