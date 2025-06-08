#!/bin/bash

# Function to display usage
show_usage() {
    echo "Usage: $0 [language] [workspace_path]"
    echo "Languages:"
    echo "  js       - JavaScript"
    echo "  python   - Python"
    echo "  java     - Java"
    echo "  cpp      - C++"
    echo ""
    echo "Example: $0 js /path/to/workspace"
}

# Check if language and workspace path are provided
if [ $# -lt 2 ]; then
    show_usage
    exit 1
fi

LANGUAGE=$1
WORKSPACE_PATH=$2

# Get port and image name based on language
case $LANGUAGE in
    "js")
        PORT=8081
        IMAGE_NAME="js-vscode"
        DOCKERFILE="Dockerfile-javascript"
        ;;
    "python")
        PORT=8082
        IMAGE_NAME="python-vscode"
        DOCKERFILE="Dockerfile-python"
        ;;
    "java")
        PORT=8083
        IMAGE_NAME="java-vscode"
        DOCKERFILE="Dockerfile-java"
        ;;
    "cpp")
        PORT=8084
        IMAGE_NAME="cpp-vscode"
        DOCKERFILE="Dockerfile-cpp"
        ;;
    *)
        echo "Invalid language: $LANGUAGE"
        show_usage
        exit 1
        ;;
esac

# Change to dockerfiles directory
cd "$(dirname "$0")/../dockerfiles" || exit

# Build the Docker image
echo "Building $LANGUAGE image..."
docker build -f "$DOCKERFILE" -t "$IMAGE_NAME" .

# Run the container
echo "Starting $LANGUAGE container..."
docker run -d \
    -p "$PORT:8080" \
    -v "$WORKSPACE_PATH:/home/coder/project" \
    --name "$IMAGE_NAME" \
    "$IMAGE_NAME"

echo "Container started! Access VS Code at http://localhost:$PORT" 