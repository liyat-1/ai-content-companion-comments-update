import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/marketing/ai-content")({
  beforeLoad: () => {
    throw redirect({ to: "/content" });
  },
});
