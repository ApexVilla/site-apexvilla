ARG BASE_IMAGE
FROM ${BASE_IMAGE}
WORKDIR /app
COPY server.mjs client-ip.mjs storage.mjs ./
EXPOSE 8099
CMD ["node", "server.mjs"]
