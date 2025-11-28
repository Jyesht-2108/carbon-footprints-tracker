# Test API responses to see actual data format
Write-Host "Testing Orchestration Engine API responses..." -ForegroundColor Cyan

Write-Host "`n1. Testing /emissions/current" -ForegroundColor Yellow
curl http://localhost:8003/emissions/current

Write-Host "`n`n2. Testing /emissions/forecast" -ForegroundColor Yellow
curl http://localhost:8003/emissions/forecast

Write-Host "`n`n3. Testing /data-quality" -ForegroundColor Yellow
curl http://localhost:8003/data-quality

Write-Host "`n`n4. Testing /hotspots" -ForegroundColor Yellow
curl http://localhost:8003/hotspots

Write-Host "`n`n5. Testing /recommendations" -ForegroundColor Yellow
curl http://localhost:8003/recommendations

Write-Host "`n`n6. Testing /alerts" -ForegroundColor Yellow
curl http://localhost:8003/alerts

Write-Host "`n`nDone!" -ForegroundColor Green
