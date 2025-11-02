# CyberBlue SOC Automated Installation Script

```bash
#!/bin/bash

# CyberBlue SOC Platform Automated Installation Script
# Version: 1.0.0
# Description: Complete automated deployment of CyberBlue SOC platform
# Requirements: Ubuntu/Debian/CentOS, Docker, Docker Compose, Git

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="CyberBlueSOC"
DOMAIN="soc.local"
ADMIN_EMAIL="admin@soc.local"
PROJECT_DIR="/opt/$PROJECT_NAME"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        print_error "This script should not be run as root for security reasons"
        exit 1
    fi
}

# Check system requirements
check_requirements() {
    print_header "Checking System Requirements"

    # Check OS
    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        print_status "OS: $PRETTY_NAME"
    else
        print_warning "Cannot determine OS version"
    fi

    # Check available memory
    MEM_GB=$(free -g | awk 'NR==2{printf "%.0f", $2}')
    if [[ $MEM_GB -lt 8 ]]; then
        print_error "Insufficient memory. Required: 8GB, Available: ${MEM_GB}GB"
        exit 1
    fi
    print_status "Memory: ${MEM_GB}GB (OK)"

    # Check available disk space
    DISK_GB=$(df / | tail -1 | awk '{printf "%.0f", $4/1024/1024}')
    if [[ $DISK_GB -lt 20 ]]; then
        print_error "Insufficient disk space. Required: 20GB, Available: ${DISK_GB}GB"
        exit 1
    fi
    print_status "Disk space: ${DISK_GB}GB (OK)"

    # Check CPU cores
    CPU_CORES=$(nproc)
    if [[ $CPU_CORES -lt 4 ]]; then
        print_warning "Low CPU cores. Recommended: 4, Available: $CPU_CORES"
    else
        print_status "CPU cores: $CPU_CORES (OK)"
    fi
}

# Install system dependencies
install_dependencies() {
    print_header "Installing System Dependencies"

    # Update package list
    print_status "Updating package list..."
    sudo apt update || sudo yum update -y || sudo dnf update -y

    # Install required packages
    print_status "Installing required packages..."

    # Docker installation
    if ! command -v docker &> /dev/null; then
        print_status "Installing Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo systemctl enable docker
        sudo systemctl start docker
        sudo usermod -aG docker $USER
        rm get-docker.sh
    else
        print_status "Docker already installed"
    fi

    # Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_status "Installing Docker Compose..."
        sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
    else
        print_status "Docker Compose already installed"
    fi

    # Git
    if ! command -v git &> /dev/null; then
        print_status "Installing Git..."
        sudo apt install -y git || sudo yum install -y git || sudo dnf install -y git
    else
        print_status "Git already installed"
    fi

    # Other tools
    sudo apt install -y curl wget htop || sudo yum install -y curl wget htop || sudo dnf install -y curl wget htop
}

# Clone or update repository
setup_project() {
    print_header "Setting up CyberBlue SOC Project"

    if [[ -d "$PROJECT_DIR" ]]; then
        print_warning "Project directory already exists. Updating..."
        cd "$PROJECT_DIR"
        git pull origin main
    else
        print_status "Cloning CyberBlue SOC repository..."
        sudo mkdir -p "$PROJECT_DIR"
        sudo chown $USER:$USER "$PROJECT_DIR"
        git clone https://github.com/boniyeamincse/CyberBlueSOC.git "$PROJECT_DIR"
        cd "$PROJECT_DIR"
    fi

    print_status "Repository ready at $PROJECT_DIR"
}

# Configure environment
configure_environment() {
    print_header "Configuring Environment"

    cd "$PROJECT_DIR"

    # Copy environment template
    if [[ -f ".env.example" ]]; then
        cp .env.example .env
        print_status "Environment file created from template"
    fi

    # Generate secure passwords
    DB_PASSWORD=$(openssl rand -base64 16)
    KEYCLOAK_PASSWORD=$(openssl rand -base64 16)
    GRAFANA_PASSWORD=$(openssl rand -base64 16)

    # Update .env file with generated passwords
    sed -i "s/postgres:\/\/soc:soc@db:5432\/soc/postgres:\/\/soc:$DB_PASSWORD@db:5432\/soc/g" .env
    sed -i "s/KEYCLOAK_ADMIN_PASSWORD: change_me/KEYCLOAK_ADMIN_PASSWORD: $KEYCLOAK_PASSWORD/g" .env
    sed -i "s/GF_SECURITY_ADMIN_PASSWORD: change_me/GF_SECURITY_ADMIN_PASSWORD: $GRAFANA_PASSWORD/g" .env

    print_status "Environment configured with secure passwords"
}

# Setup SSL certificates (self-signed for development)
setup_ssl() {
    print_header "Setting up SSL Certificates"

    cd "$PROJECT_DIR"

    # Create certificates directory
    mkdir -p certs

    # Generate self-signed certificate
    if [[ ! -f "certs/cert.pem" ]]; then
        print_status "Generating self-signed SSL certificate..."
        openssl req -x509 -newkey rsa:4096 -keyout certs/key.pem -out certs/cert.pem -days 365 -nodes \
            -subj "/C=US/ST=State/L=City/O=Organization/CN=$DOMAIN"
        print_status "SSL certificate generated"
    else
        print_status "SSL certificate already exists"
    fi
}

# Deploy services
deploy_services() {
    print_header "Deploying CyberBlue SOC Services"

    cd "$PROJECT_DIR/soc/infrastructure"

    # Pull images
    print_status "Pulling Docker images..."
    docker-compose pull

    # Start services
    print_status "Starting services..."
    docker-compose up -d --build

    # Wait for services to be healthy
    print_status "Waiting for services to start..."
    sleep 60

    # Check service health
    check_services
}

# Check service health
check_services() {
    print_header "Checking Service Health"

    cd "$PROJECT_DIR/soc/infrastructure"

    # Check running containers
    RUNNING_CONTAINERS=$(docker-compose ps | grep "Up" | wc -l)
    TOTAL_CONTAINERS=$(docker-compose ps | grep -c "^[[:space:]]*[a-zA-Z]")

    print_status "Running containers: $RUNNING_CONTAINERS/$TOTAL_CONTAINERS"

    if [[ $RUNNING_CONTAINERS -lt $TOTAL_CONTAINERS ]]; then
        print_warning "Some containers are not running. Checking logs..."
        docker-compose logs --tail=50
    fi

    # Test key services
    print_status "Testing key services..."

    # Test Keycloak
    if curl -k -s https://auth.$DOMAIN/realms/soc/.well-known/openid-connect-configuration > /dev/null; then
        print_status "✓ Keycloak is accessible"
    else
        print_warning "✗ Keycloak may not be ready yet"
    fi

    # Test API
    if curl -k -s https://api.$DOMAIN/health > /dev/null; then
        print_status "✓ API is accessible"
    else
        print_warning "✗ API may not be ready yet"
    fi

    # Test Web UI
    if curl -k -s https://$DOMAIN > /dev/null; then
        print_status "✓ Web UI is accessible"
    else
        print_warning "✗ Web UI may not be ready yet"
    fi
}

# Setup firewall
setup_firewall() {
    print_header "Configuring Firewall"

    # Allow required ports
    print_status "Configuring firewall rules..."
    sudo ufw allow 22/tcp || true  # SSH
    sudo ufw allow 80/tcp || true  # HTTP (redirect to HTTPS)
    sudo ufw allow 443/tcp || true # HTTPS
    sudo ufw --force enable || true

    print_status "Firewall configured"
}

# Display access information
display_access_info() {
    print_header "🎉 CyberBlue SOC Deployment Complete!"

    echo ""
    echo -e "${GREEN}Access URLs:${NC}"
    echo "  🌐 Main Dashboard: https://$DOMAIN"
    echo "  🔑 Keycloak Admin:  https://auth.$DOMAIN"
    echo "  📊 Grafana:         https://grafana.$DOMAIN"
    echo "  🔍 OpenSearch:      https://opensearch.$DOMAIN"
    echo ""

    echo -e "${GREEN}Default Credentials:${NC}"
    echo "  Admin User: admin"
    echo "  Admin Password: change_me (Keycloak)"
    echo "  Database Password: $DB_PASSWORD"
    echo "  Grafana Password: $GRAFANA_PASSWORD"
    echo ""

    echo -e "${YELLOW}⚠️  Important:${NC}"
    echo "  1. Change default passwords immediately"
    echo "  2. Configure DNS or update /etc/hosts for local access"
    echo "  3. Setup proper SSL certificates for production"
    echo "  4. Review security settings and firewall rules"
    echo ""

    echo -e "${BLUE}Next Steps:${NC}"
    echo "  1. Access https://$DOMAIN and login"
    echo "  2. Configure your security tools"
    echo "  3. Set up monitoring and alerting"
    echo "  4. Review documentation at $PROJECT_DIR/docs/"
    echo ""
}

# Cleanup function
cleanup() {
    if [[ $? -ne 0 ]]; then
        print_error "Installation failed. Cleaning up..."
        cd "$PROJECT_DIR/soc/infrastructure" 2>/dev/null || true
        docker-compose down -v 2>/dev/null || true
        print_error "Installation failed. Please check logs and try again."
        exit 1
    fi
}

# Main installation function
main() {
    print_header "CyberBlue SOC Platform Installer"
    echo "Version 1.0.0 - Automated Deployment"
    echo ""

    # Set trap for cleanup on error
    trap cleanup ERR

    check_root
    check_requirements
    install_dependencies
    setup_project
    configure_environment
    setup_ssl
    setup_firewall
    deploy_services
    display_access_info

    print_status "Installation completed successfully! 🎉"
}

# Run main function
main "$@"
```

## Usage

1. **Download and make executable:**
   ```bash
   wget https://raw.githubusercontent.com/boniyeamincse/CyberBlueSOC/main/installation.sh
   chmod +x installation.sh
   ```

2. **Run the installer:**
   ```bash
   sudo ./installation.sh
   ```

3. **Follow the on-screen instructions and access information**

## Features

- ✅ **Automated Setup**: Complete hands-off installation
- ✅ **Security First**: Generates secure passwords and SSL certificates
- ✅ **Service Verification**: Tests all services after deployment
- ✅ **Firewall Configuration**: Sets up proper security rules
- ✅ **Access Information**: Displays all URLs and credentials
- ✅ **Error Handling**: Comprehensive error checking and cleanup

## Requirements

- **OS**: Ubuntu 20.04+, Debian 11+, CentOS 8+, RHEL 8+
- **RAM**: 8GB minimum (16GB recommended)
- **Disk**: 20GB free space
- **CPU**: 4 cores minimum
- **Network**: Internet access for downloads

## Post-Installation

After successful installation:

1. **Change Default Passwords** in Keycloak and Grafana
2. **Configure DNS** or update `/etc/hosts` for domain access
3. **Setup SSL Certificates** (replace self-signed certs)
4. **Configure Security Tools** (Wazuh, TheHive, etc.)
5. **Review Documentation** in the `docs/` directory

## Troubleshooting

- **Services not starting**: Check Docker logs with `docker-compose logs`
- **Port conflicts**: Ensure ports 80, 443, 8080 are available
- **SSL issues**: Regenerate certificates or use Let's Encrypt
- **Memory issues**: Increase system memory or reduce service count

## Support

For issues or questions:
- 📧 Email: boniyeamin.cse@gmail.com
- 📚 Documentation: `$PROJECT_DIR/docs/`
- 🐛 Issues: GitHub Issues