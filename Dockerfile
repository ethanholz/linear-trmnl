FROM denoland/deno:latest

# Create working directory
WORKDIR /app

# Copy source
COPY deno.json .
COPY deno.lock .
COPY main.ts .
COPY api api/
COPY middleware middleware/
COPY utils utils/

# Compile the main app
RUN deno cache main.ts

# Run the app
CMD ["deno", "run", "--allow-net", "--allow-read", "--allow-env", "--unstable-kv", "main.ts"]
