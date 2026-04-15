import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return <main className="page-wrap px-4 py-16 sm:py-24">Home page</main>;
}
