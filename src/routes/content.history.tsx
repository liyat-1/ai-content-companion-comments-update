import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/content/history")({
  beforeLoad: () => { throw redirect({ to: "/content/releases" }); },
});
