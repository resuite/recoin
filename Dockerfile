FROM golang:1.21-alpine

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache gcc musl-dev

# Copy go mod files
COPY apps/api/go.mod apps/api/go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY apps/api .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

# Run the binary
CMD ["./main"]
