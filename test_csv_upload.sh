#!/bin/bash

echo "Testing CSV upload with fixed files..."
echo ""

# Test upload
echo "Uploading demo_upload_1_baseline.csv..."
curl -X POST http://localhost:8001/ingest/upload \
  -F "file=@upload-data/demo_upload_1_baseline.csv" \
  -w "\nHTTP Status: %{http_code}\n"

echo ""
echo "Done! Check the response above."
