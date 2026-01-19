#!/bin/bash
# Environment Manager Script

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_DIR="$SCRIPT_DIR/../environments"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[✓]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

show_help() {
    cat << EOF
🏭 QA Environment Manager

Usage: $(basename $0) <command> [environment] [options]

Commands:
    up          Start environment
    down        Stop environment
    restart     Restart environment
    status      Show environment status
    logs        Show environment logs
    clean       Remove environment and volumes
    snapshot    Create environment snapshot
    restore     Restore environment from snapshot
    list        List available environments

Environments:
    dev         Development environment
    qa          QA/Testing environment
    staging     Staging environment

Examples:
    $(basename $0) up qa
    $(basename $0) logs qa app
    $(basename $0) snapshot qa my-snapshot
    $(basename $0) clean qa

EOF
}

env_up() {
    local env="$1"
    log_info "Starting $env environment..."
    docker compose -f "$ENV_DIR/docker-compose.$env.yml" up -d
    log_success "Environment $env started"
    env_status "$env"
}

env_down() {
    local env="$1"
    log_info "Stopping $env environment..."
    docker compose -f "$ENV_DIR/docker-compose.$env.yml" down
    log_success "Environment $env stopped"
}

env_restart() {
    local env="$1"
    env_down "$env"
    env_up "$env"
}

env_status() {
    local env="$1"
    echo -e "\n${BLUE}═══ Environment: $env ═══${NC}"
    docker compose -f "$ENV_DIR/docker-compose.$env.yml" ps
}

env_logs() {
    local env="$1"
    local service="$2"
    if [ -n "$service" ]; then
        docker compose -f "$ENV_DIR/docker-compose.$env.yml" logs -f "$service"
    else
        docker compose -f "$ENV_DIR/docker-compose.$env.yml" logs -f
    fi
}

env_clean() {
    local env="$1"
    log_warn "This will remove all containers and volumes for $env"
    read -p "Are you sure? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker compose -f "$ENV_DIR/docker-compose.$env.yml" down -v --remove-orphans
        log_success "Environment $env cleaned"
    fi
}

env_snapshot() {
    local env="$1"
    local name="$2"
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local snapshot_name="${name:-$env-$timestamp}"
    
    log_info "Creating snapshot: $snapshot_name"
    
    # Pause containers
    docker compose -f "$ENV_DIR/docker-compose.$env.yml" pause
    
    # Export volumes
    mkdir -p "$SCRIPT_DIR/../snapshots/$snapshot_name"
    for volume in $(docker compose -f "$ENV_DIR/docker-compose.$env.yml" config --volumes); do
        docker run --rm -v "${env}_${volume}:/data" -v "$SCRIPT_DIR/../snapshots/$snapshot_name:/backup" \
            alpine tar czf "/backup/${volume}.tar.gz" -C /data .
    done
    
    # Unpause containers
    docker compose -f "$ENV_DIR/docker-compose.$env.yml" unpause
    
    log_success "Snapshot created: $snapshot_name"
}

env_list() {
    echo -e "\n${BLUE}Available Environments:${NC}"
    for file in "$ENV_DIR"/docker-compose.*.yml; do
        env=$(basename "$file" | sed 's/docker-compose.//;s/.yml//')
        if docker compose -f "$file" ps -q 2>/dev/null | grep -q .; then
            echo -e "  ${GREEN}●${NC} $env (running)"
        else
            echo -e "  ${RED}○${NC} $env (stopped)"
        fi
    done
    echo
}

# Main
case "$1" in
    up)       env_up "$2" ;;
    down)     env_down "$2" ;;
    restart)  env_restart "$2" ;;
    status)   env_status "$2" ;;
    logs)     env_logs "$2" "$3" ;;
    clean)    env_clean "$2" ;;
    snapshot) env_snapshot "$2" "$3" ;;
    list)     env_list ;;
    *)        show_help ;;
esac
