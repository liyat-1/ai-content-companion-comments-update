import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/content/performance")({
  beforeLoad: () => { throw redirect({ to: "/content/results" }); },
});
