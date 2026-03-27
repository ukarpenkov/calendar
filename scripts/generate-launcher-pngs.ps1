$ErrorActionPreference = 'Stop'
$repoRoot = Join-Path $PSScriptRoot '..' | Resolve-Path
$iconsRoot = Join-Path $repoRoot 'icons' | Resolve-Path
$play512 = Join-Path $iconsRoot 'play_store_512.png'
if (-not (Test-Path $play512)) {
  throw "Missing Play-style source PNG: $play512"
}
$base = Join-Path $repoRoot 'android\app\src\main\res' | Resolve-Path

$mipmapFolders = @(
  'mipmap-mdpi',
  'mipmap-hdpi',
  'mipmap-xhdpi',
  'mipmap-xxhdpi',
  'mipmap-xxxhdpi'
)
foreach ($folder in $mipmapFolders) {
  $srcDir = Join-Path $iconsRoot $folder
  if (-not (Test-Path $srcDir)) {
    throw "Missing folder under icons: $srcDir"
  }
  $dstDir = Join-Path $base $folder
  if (-not (Test-Path $dstDir)) {
    New-Item -ItemType Directory -Path $dstDir | Out-Null
  }
  foreach ($name in @('ic_launcher.png', 'ic_launcher_round.png')) {
    $from = Join-Path $srcDir $name
    if (-not (Test-Path $from)) {
      throw "Missing $from"
    }
    Copy-Item -Path $from -Destination (Join-Path $dstDir $name) -Force
  }
}

Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile($play512)

$sizes = @{
  'drawable-mdpi'    = 108
  'drawable-hdpi'    = 162
  'drawable-xhdpi'   = 216
  'drawable-xxhdpi'  = 324
  'drawable-xxxhdpi' = 432
}

foreach ($folder in $sizes.Keys) {
  $dir = Join-Path $base $folder
  if (-not (Test-Path $dir)) {
    New-Item -ItemType Directory -Path $dir | Out-Null
  }
  $w = $sizes[$folder]
  $bmp = New-Object System.Drawing.Bitmap $w, $w
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.DrawImage($img, 0, 0, $w, $w)
  $out = Join-Path $dir 'ic_launcher_full.png'
  $bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose()
  $bmp.Dispose()
}

$img.Dispose()
$assetsDest = Join-Path $repoRoot 'assets\launcher-icon-source.png'
Copy-Item -Path $play512 -Destination $assetsDest -Force
Write-Host "Synced mipmap from $iconsRoot, wrote ic_launcher_full + assets from play_store_512.png"
