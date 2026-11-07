# Imagem de desenvolvimento do app (next dev com hot reload).
#
# Só instala as dependências: o código-fonte NÃO é copiado para a imagem. O
# compose.yaml monta a pasta do projeto em /app, então qualquer arquivo salvo
# no host aparece no container na hora e o Next recompila sozinho.
#
# node_modules fica num volume próprio do container (ver compose.yaml): os
# binários nativos são os do Alpine, não os da máquina de quem roda.
#
# Build: docker compose build app

FROM node:22-alpine
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./
RUN npm ci

# Pastas que viram volume precisam existir com o dono certo antes do USER node,
# senão o Docker as cria como root e o next dev não consegue escrever nelas.
RUN mkdir -p .next && chown -R node:node /app

USER node
EXPOSE 3000
# -H 0.0.0.0: sem isso o next dev só escuta dentro do container e nem o
# localhost do host nem o celular alcançam.
CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0"]
