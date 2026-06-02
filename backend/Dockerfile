FROM node:20-slim

# Instala FFmpeg, yt-dlp e dependências do canvas (para bgutil PO token)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    python3-pip \
    curl \
    unzip \
    git \
    libcairo2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libjpeg62-turbo \
    libgif7 \
    librsvg2-2 \
    libfontconfig1 \
    fonts-liberation \
    fonts-dejavu-core \
    && pip3 install -U yt-dlp bgutil-ytdlp-pot-provider --break-system-packages \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Instala Bun (runtime JS para yt-dlp resolver n-challenge / JSC)
RUN curl -fsSL https://bun.sh/install | bash && \
    ln -sf /root/.bun/bin/bun /usr/local/bin/bun
ENV PATH="/root/.bun/bin:/usr/local/bin:$PATH"

# Clona e builda o servidor bgutil (gerador de PO tokens para yt-dlp)
RUN git clone --depth 1 --branch 1.3.1 \
    https://github.com/Brainicism/bgutil-ytdlp-pot-provider.git /bgutil \
    && cd /bgutil/server \
    && npm ci \
    && npx tsc

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY . .

RUN mkdir -p temp output uploads

EXPOSE 3001

COPY start.sh /start.sh
RUN sed -i 's/\r$//' /start.sh && chmod +x /start.sh

CMD ["/start.sh"]
