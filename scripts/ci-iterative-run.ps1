param([int]$Iterations = 7)

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
mkdir -Force "$projectRoot\logs" | Out-Null

for ($i = 1; $i -le $Iterations; $i++) {
  $itLog = "$projectRoot\logs\iteration-$i"
  New-Item -ItemType Directory -Force -Path $itLog | Out-Null
  Write-Output "=== ITERATION $i ===" | Tee-Object -FilePath "$itLog\iteration-$i.stdout.log"
  npm ci 2>&1 | Tee-Object -FilePath "$itLog\npm-ci.log"
  if (-not (npm run lint 2>&1 | Tee-Object -FilePath "$itLog\npm-lint.log")) {
     npm run format 2>&1 | Tee-Object -FilePath "$itLog\npm-format.log"
     npx eslint --fix . 2>&1 | Tee-Object -FilePath "$itLog\neslint-fix.log"
  }
  if (-not (npm test 2>&1 | Tee-Object -FilePath "$itLog\npm-test.log")) {
    Write-Output "Tests failed, see $itLog\npm-test.log"
  }
  npm run build 2>&1 | Tee-Object -FilePath "$itLog\npm-build.log"
  # start API
  $process = Start-Process -FilePath "node" -ArgumentList "api/server.js" -NoNewWindow -PassThru
  Start-Sleep -Seconds 3
  # Wait for health
  $ready = $false
  for ($j = 0; $j -lt 30; $j++) {
    try {
      $h = Invoke-RestMethod -Uri "http://localhost:4000/api/health" -ErrorAction Stop
      if ($h.status -eq 'ok') { $ready = $true; break }
    } catch {}
    Start-Sleep -Seconds 1
  }
  npx playwright install --with-deps 2>&1 | Tee-Object -FilePath "$itLog\playwright-install.log"
  if (-not (npx playwright test 2>&1 | Tee-Object -FilePath "$itLog\playwright-test.log")) {
    Write-Output "E2E failed"
  }
  if (-not (node tests/axe-runner.js 2>&1 | Tee-Object -FilePath "$itLog\axe.log")) {
    Write-Output "A11y checks failed"
  }
  # Lighthouse locally (if LHCI installed)
  if (Get-Command lhci -ErrorAction SilentlyContinue) {
    lhci autorun 2>&1 | Tee-Object -FilePath "$itLog\lhci.log"
  }
  if (-not (npm audit --audit-level=high 2>&1 | Tee-Object -FilePath "$itLog\npm-audit.log")) {
    npm audit fix --force 2>&1 | Tee-Object -FilePath "$itLog\npm-audit-fix.log"
  }
  # stop node (kill by pid)
  Stop-Process -Id $process.Id -Force
}