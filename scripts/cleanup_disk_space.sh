#!/bin/bash

# Cleanup Docker images
echo "Cleaning up unused Docker images..."
docker image prune -a -f

# Cleanup Docker build cache
echo "Cleaning up Docker build cache..."
docker builder prune -a -f

# Display Docker disk usage after cleanup
echo "Docker disk usage after cleanup:"
docker system df

# Display overall disk usage after cleanup
echo "Overall disk usage after cleanup:"
df -h
