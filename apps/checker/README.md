# OpenStatus Checker

The checker service to ping external service.

It pings the service and save thedata to the tinybird

## How to run

```bash
go run *.go
```

## How to build

```bash
go build -o checker *.go
```

## How to run in docker

```bash
docker build -t checker .
docker run -p 8080:8080 checker
```

## How to deploy

```bash
fly deploy
```
