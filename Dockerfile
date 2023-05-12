FROM denoland/deno

# The port that your application listens to.

WORKDIR /app

# These steps will be re-run upon each file change in your working directory:
# ADD . .
# Compile the main app so that it doesn't need to be compiled each startup/entry.
COPY . .
RUN deno cache main.ts
EXPOSE 5000
CMD ["run", "--allow-net", "main.ts"]