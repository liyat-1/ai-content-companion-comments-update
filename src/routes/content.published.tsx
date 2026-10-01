import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/content/published")({
  beforeLoad: () => { throw redirect({ to: "/content/releases" }); },
});
