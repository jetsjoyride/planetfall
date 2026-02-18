#!/bin/bash

# Configuration
PROJECT_ID="planetfall-odyssey"

echo "🚀 Starting registry and storage purge for project: $PROJECT_ID"

# 1. Enable APIs temporarily to list/delete resources if they were disabled
echo "🔧 Enabling necessary APIs..."
gcloud services enable artifactregistry.googleapis.com cloudfunctions.googleapis.com --project $PROJECT_ID

# 2. Purge Artifact Registry Repositories
echo "📦 Checking Artifact Registry..."
repos=( "gcf-artifacts" "cloud-storage" )
for repo in "${repos[@]}"; do
    if gcloud artifacts repositories describe $repo --project $PROJECT_ID --location=us-central1 &>/dev/null; then
        echo "🗑️ Deleting Artifact Registry repository: $repo..."
        gcloud artifacts repositories delete $repo --project $PROJECT_ID --location=us-central1 --quiet
    else
        echo "✅ Repository $repo not found in us-central1."
    fi
done

# 3. Purge GCS Buckets used for Functions/Artifacts
echo "🪣 Checking Cloud Storage buckets..."
# List buckets and look for matching patterns
buckets=$(gsutil ls -p $PROJECT_ID 2>/dev/null)

for bucket in $buckets; do
    if [[ $bucket == *"gcf-sources"* ]] || [[ $bucket == *"artifacts"* ]]; then
        echo "🗑️ Deleting GCS bucket: $bucket..."
        gsutil rm -r $bucket
    fi
done

echo "✨ Purge complete!"
