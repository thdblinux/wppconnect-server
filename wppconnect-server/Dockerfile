# Use chainguard/node:latest-dev as builder stage
FROM node:lts-alpine3.18 as builder

# Set environment variables for ports
ENV PORT1=21465
ENV PORT2=21466
ENV PORT3=21467
ENV PORT4=21470
ENV PORT5=21475
ENV PORT6=21476
ENV PORT7=21477
ENV PORT8=21478
ENV PORT9=21479
ENV PORT10=21480
ENV PORT11=21481
ENV PORT12=21482
ENV PORT_HML=21483

# Install necessary packages and clean up cache
RUN apk update && \
    apk add --no-cache \
    wget \
    git \
    python3 \
    make \
    g++ \
    vips-dev \
    fftw-dev \
    build-base

# Install sharp module
RUN yarn add sharp --ignore-engines

# Set working directory and clone app repository
WORKDIR /home/node
RUN git clone https://github.com/wppconnect-team/wppconnect-server.git /home/node/app

# Set working directory to app and copy configuration file
WORKDIR /home/node/app
COPY ./config.ts ./src/config.ts

# Install npm dependencies with unsafe permissions
RUN npm install --unsafe-perm


# Start a new stage using chainguard/node:latest as base
FROM node:lts-alpine3.18

# Set environment variable to skip Chromium download for Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Set working directory
WORKDIR /home/node/app

# Copy built application from builder stage
COPY --from=builder /home/node/app/ .

# Expose the necessary ports
EXPOSE 21465 21466 21467 21470 21475 21476 21477 21478 21479 21480 21481 21482 21483

# Define the command to start the application
CMD ["node", "index.js"]