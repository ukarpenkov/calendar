$ErrorActionPreference = 'Stop'
$repoRoot = Join-Path $PSScriptRoot '..' | Resolve-Path
$src = Join-Path $repoRoot 'assets\launcher-icon-source.png'
if (-not (Test-Path $src)) {
  throw "Missing launcher source PNG: $src"
}
$base = Join-Path $repoRoot 'android\app\src\main\res' | Resolve-Path

Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile($src)

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

$mipmapSizes = @{
  'mipmap-mdpi'    = 48
  'mipmap-hdpi'    = 72
  'mipmap-xhdpi'   = 96
  'mipmap-xxhdpi'  = 144
  'mipmap-xxxhdpi' = 192
}

foreach ($folder in $mipmapSizes.Keys) {
  $dir = Join-Path $base $folder
  if (-not (Test-Path $dir)) {
    New-Item -ItemType Directory -Path $dir | Out-Null
  }
  $w = $mipmapSizes[$folder]
  $bmp = New-Object System.Drawing.Bitmap $w, $w
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.DrawImage($img, 0, 0, $w, $w)
  $bmp.Save((Join-Path $dir 'ic_launcher.png'), [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Save((Join-Path $dir 'ic_launcher_round.png'), [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose()
  $bmp.Dispose()
}

$img.Dispose()
Write-Host "Wrote ic_launcher_full.png + mipmap ic_launcher(s) under $base"
