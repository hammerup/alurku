# deploy.ps1 — alurku. Frontend Deploy Script
# Jalankan setiap kali ada perubahan kode frontend
# Usage: .\deploy.ps1

Write-Host "🚀 alurku. — Building frontend..." -ForegroundColor Yellow

# Step 1: Build React app
Set-Location frontend-app
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build gagal! Cek error di atas." -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..

Write-Host "✅ Build selesai." -ForegroundColor Green

# Step 2: Reload Nginx config tanpa downtime
Write-Host "🔄 Reloading Nginx..." -ForegroundColor Yellow
docker compose exec frontend nginx -s reload 2>$null

if ($LASTEXITCODE -ne 0) {
    # Jika container belum jalan, start dulu
    Write-Host "▶️  Starting frontend container..." -ForegroundColor Yellow
    docker compose up -d frontend
}

Write-Host "✅ Deploy selesai! Buka http://localhost" -ForegroundColor Green
