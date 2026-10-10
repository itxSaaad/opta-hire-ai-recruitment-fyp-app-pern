[CmdletBinding()]
param([switch]$WhatIf, [switch]$DatabaseUrlOnly)
$ErrorActionPreference = 'Stop'
$project = 'opta-hire-ai-recruitment-fyp-app-pern'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
function Import-EnvFile([string]$file,[string]$environment,[string]$branch) {
  $path = Join-Path $root $file
  if (!(Test-Path -LiteralPath $path)) { throw "Missing $path" }
  foreach($line in Get-Content -LiteralPath $path) {
    if (!$line.Trim() -or $line.TrimStart().StartsWith('#')) { continue }
    $pair = $line -split '=',2
    if ($pair.Count -ne 2) { throw "Malformed env line in $file" }
    $key=$pair[0].Trim(); $value=$pair[1]
    if ($DatabaseUrlOnly -and $key -ne 'DATABASE_URL') { continue }
    if (!$key -or $key -in @('ML_SERVICES_URL','NODE_ENV','PORT','SUPABASE_DB_CA_FILE')) { Write-Host ('Skipping Vercel-managed or local-only variable: ' + $key); continue }
    if ([string]::IsNullOrWhiteSpace($value)) { Write-Host "Skipping empty optional variable: $key"; continue }
    if ($WhatIf) { Write-Host "Would import $key to $environment$(if($branch){" branch $branch"})"; continue }
    $argsList=@('env','add',$key,$environment,'--force','--yes','--project',$project)
    if ($key -match '^(VITE_|NEXT_PUBLIC_)') { $argsList += @('--type','config') }
    else { $argsList += '--sensitive' }
    if ($branch) { $argsList += @('--git-branch',$branch) }
    $psi=[Diagnostics.ProcessStartInfo]::new()
    $psi.FileName=$env:ComSpec; $psi.Arguments='/d /c vercel ' + (($argsList | ForEach-Object { '"' + ($_ -replace '"','\"') + '"' }) -join ' ')
    $psi.UseShellExecute=$false; $psi.RedirectStandardInput=$true; $psi.RedirectStandardOutput=$true; $psi.RedirectStandardError=$true; $psi.CreateNoWindow=$true
    $proc=[Diagnostics.Process]::new(); $proc.StartInfo=$psi
    [void]$proc.Start(); $proc.StandardInput.Write($value); $proc.StandardInput.Close()
    $stdout=$proc.StandardOutput.ReadToEnd(); $stderr=$proc.StandardError.ReadToEnd(); $proc.WaitForExit()
    if ($proc.ExitCode -ne 0) { throw "Vercel import failed for $key ($environment); CLI exit $($proc.ExitCode). Review local CLI output without exposing environment values." }
    Write-Host "Imported $key to $environment$(if($branch){" branch $branch"})"
  }
}
Import-EnvFile '.env.production' 'production' ''
Import-EnvFile '.env.preview' 'preview' 'develop'
