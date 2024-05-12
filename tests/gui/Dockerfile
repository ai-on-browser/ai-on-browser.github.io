FROM node:22.1-slim

RUN apt-get update \
 && apt-get install -y \
    libasound2 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libgbm-dev \
    libnss3 \
    libpangocairo-1.0-0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*
RUN mkdir /app

ADD package.json /app
ADD yarn.lock /app
WORKDIR /app

RUN yarn && yarn playwright install chromium && yarn cache clean

ENTRYPOINT ["yarn", "test:gui"]
