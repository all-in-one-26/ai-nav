FROM node:18-alpine AS frontendbuilder
WORKDIR /app
COPY . .
RUN npm install -g pnpm
RUN cd /app && cd ui && pnpm install && CI=false pnpm build && cd ..
RUN cd /app && mkdir -p public
RUN cp -r ui/build/* public/

FROM golang:1.23-alpine AS binarybuilder
RUN apk --no-cache --no-progress add  git
WORKDIR /app
COPY . .
COPY --from=frontendbuilder /app/public /app/public
RUN cd /app && ls -la && go mod tidy && go build .


FROM alpine:latest
ENV TZ="Asia/Shanghai"
RUN apk --no-cache --no-progress add \
    ca-certificates \
    tzdata && \
    cp "/usr/share/zoneinfo/$TZ" /etc/localtime && \
    echo "$TZ" >  /etc/timezone

RUN adduser -D -u 1000 appuser

WORKDIR /app
COPY --from=binarybuilder /app/nav /app/
RUN mkdir -p /app/data && chown -R appuser:appuser /app

USER appuser

VOLUME ["/app/data"]
EXPOSE 7860
ENTRYPOINT [ "/app/nav", "-port", "7860" ]
