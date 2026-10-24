# Creates the Cloud Novel release signing key and android/keystore.properties.
# Run from anywhere: powershell -ExecutionPolicy Bypass -File android\make-release-key.ps1
$ErrorActionPreference = 'Stop'

$alias = 'cloud-novel'
$jks = Join-Path $PSScriptRoot 'cloud-novel-release.jks'
$props = Join-Path $PSScriptRoot 'keystore.properties'

if (Test-Path $jks) {
    Write-Error "$jks already exists. Refusing to overwrite it."
    exit 1
}

function Read-Plain([string]$prompt) {
    $secure = Read-Host -Prompt $prompt -AsSecureString
    $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    try { [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr) }
    finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
}

$pass = Read-Plain 'Key password (min 6 chars)'
$again = Read-Plain 'Repeat password'
if ($pass -ne $again) { Write-Error 'Passwords do not match.'; exit 1 }
if ($pass.Length -lt 6) { Write-Error 'Password must be at least 6 characters.'; exit 1 }

$env:CLOUD_NOVEL_KEY_PASS = $pass
try {
    & keytool -genkeypair -v `
        -keystore $jks -storetype PKCS12 `
        -alias $alias -keyalg RSA -keysize 2048 -validity 10000 `
        -dname 'CN=Cloud Novel' `
        -storepass:env CLOUD_NOVEL_KEY_PASS -keypass:env CLOUD_NOVEL_KEY_PASS
    if ($LASTEXITCODE -ne 0) { Write-Error "keytool failed ($LASTEXITCODE)"; exit 1 }
}
finally {
    Remove-Item Env:CLOUD_NOVEL_KEY_PASS -ErrorAction SilentlyContinue
}

# Java .properties: escape backslashes, and non-ASCII as \uXXXX (files are read as ISO-8859-1)
$escaped = -join ($pass.ToCharArray() | ForEach-Object {
    if ($_ -eq '\') { '\\' }
    elseif ([int]$_ -gt 126) { '\u{0:x4}' -f [int]$_ }
    else { $_ }
})
# Properties.load strips leading whitespace from values
if ($escaped.StartsWith(' ')) { $escaped = '\' + $escaped }

$content = @(
    'storeFile=../cloud-novel-release.jks'
    "storePassword=$escaped"
    "keyAlias=$alias"
    "keyPassword=$escaped"
) -join "`n"
[IO.File]::WriteAllText($props, $content + "`n", (New-Object Text.ASCIIEncoding))

$pass = $null; $again = $null; $escaped = $null
Write-Host "Created $jks and $props. Back up the .jks and the password somewhere safe."
