import { serve } from "bun";

serve({
  port: 3000,
  fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/") {
      return new Response(Bun.file("index.html"));
    }

    if (url.pathname === "/game.js") {
      return new Response(Bun.file("game.js"));
    }

    return new Response("Not found", { status: 404 });
  },
});

console.log("Server running on http://localhost:3000");
