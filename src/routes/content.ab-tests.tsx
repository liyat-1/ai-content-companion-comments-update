import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/content/ab-tests")({
  beforeLoad: () => { throw redirect({ to: "/content/results" }); },
});
