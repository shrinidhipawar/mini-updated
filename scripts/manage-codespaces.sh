#!/bin/bash

# Function to display usage
show_usage() {
    echo "Usage: $0 [command] [language]"
    echo "Commands:"
    echo "  start    - Start a codespace container"
    echo "  stop     - Stop a codespace container"
    echo "  restart  - Restart a codespace container"
    echo "  status   - Show status of all containers"
    echo "Languages:"
    echo "  python   - Python codespace"
    echo "  java     - Java codespace"
    echo "  cpp      - C++ codespace"
    echo "  all      - All codespaces"
}

# Function to get port for language
get_port() {
    case $1 in
        "python") echo "8081" ;;
        "java") echo "8082" ;;
        "cpp") echo "8083" ;;
        *) echo "0" ;;
    esac
}

# Function to get service name
get_service() {
    case $1 in
        "python") echo "python-codespace" ;;
        "java") echo "java-codespace" ;;
        "cpp") echo "cpp-codespace" ;;
        *) echo "" ;;
    esac
}

# Check if command and language are provided
if [ $# -lt 2 ]; then
    show_usage
    exit 1
fi

COMMAND=$1
LANGUAGE=$2

# Handle commands
case $COMMAND in
    "start")
        if [ "$LANGUAGE" = "all" ]; then
            docker-compose up -d
        else
            SERVICE=$(get_service $LANGUAGE)
            if [ -n "$SERVICE" ]; then
                docker-compose up -d $SERVICE
                PORT=$(get_port $LANGUAGE)
                echo "Started $LANGUAGE codespace at http://localhost:$PORT"
            else
                echo "Invalid language: $LANGUAGE"
                show_usage
                exit 1
            fi
        fi
        ;;
    "stop")
        if [ "$LANGUAGE" = "all" ]; then
            docker-compose down
        else
            SERVICE=$(get_service $LANGUAGE)
            if [ -n "$SERVICE" ]; then
                docker-compose stop $SERVICE
            else
                echo "Invalid language: $LANGUAGE"
                show_usage
                exit 1
            fi
        fi
        ;;
    "restart")
        if [ "$LANGUAGE" = "all" ]; then
            docker-compose restart
        else
            SERVICE=$(get_service $LANGUAGE)
            if [ -n "$SERVICE" ]; then
                docker-compose restart $SERVICE
            else
                echo "Invalid language: $LANGUAGE"
                show_usage
                exit 1
            fi
        fi
        ;;
    "status")
        docker-compose ps
        ;;
    *)
        echo "Invalid command: $COMMAND"
        show_usage
        exit 1
        ;;
esac 