# WebLLM/MLC Model Setup Script
# This script downloads the required model artifacts for WebLLM

param(
    [Parameter()]
    [ValidateSet("1b", "3b", "8b", "all")]
    [string]$Model = "3b",

    [Parameter()]
    [switch]$SkipExisting
)

$ErrorActionPreference = "Stop"

# Model configurations
$Models = @{
    "1b" = @{
        Name = "Llama-3.2-1B-Instruct-q4f32_1-MLC"
        HuggingFaceRepo = "mlc-ai/Llama-3.2-1B-Instruct-q4f32_1-MLC"
        LocalPath = "src/assets/mlc/1b-q4f32_1"
        Files = @(
            "params_shard_0.bin",
            "params_shard_1.bin",
            "mlc-chat-config.json",
            "tokenizer.json",
            "Llama-3.2-1B-Instruct-q4f32_1-MLC-lib.wasm"
        )
    }
    "3b" = @{
        Name = "Llama-3.2-3B-Instruct-q4f32_1-MLC"
        HuggingFaceRepo = "mlc-ai/Llama-3.2-3B-Instruct-q4f32_1-MLC"
        LocalPath = "src/assets/mlc/3b-q4f32_1"
        Files = @(
            "params_shard_0.bin",
            "params_shard_1.bin",
            "params_shard_2.bin",
            "mlc-chat-config.json",
            "tokenizer.json",
            "Llama-3.2-3B-Instruct-q4f32_1-MLC-lib.wasm"
        )
    }
    "8b" = @{
        Name = "Llama-3.1-8B-Instruct-q4f32_1-MLC"
        HuggingFaceRepo = "mlc-ai/Llama-3.1-8B-Instruct-q4f32_1-MLC"
        LocalPath = "src/assets/mlc/8b-q4f32_1"
        Files = @(
            "params_shard_0.bin",
            "params_shard_1.bin",
            "params_shard_2.bin",
            "params_shard_3.bin",
            "params_shard_4.bin",
            "params_shard_5.bin",
            "params_shard_6.bin",
            "params_shard_7.bin",
            "mlc-chat-config.json",
            "tokenizer.json",
            "Llama-3.1-8B-Instruct-q4f32_1-MLC-lib.wasm"
        )
    }
}

function Test-Command {
    param([string]$Command)
    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

function Invoke-ModelFileDownload {
    param(
        [string]$Url,
        [string]$OutputPath,
        [string]$FileName
    )

    $fullPath = Join-Path $OutputPath $FileName

    if ($SkipExisting -and (Test-Path $fullPath)) {
        Write-Host "⏭️  Skipping existing file: $FileName" -ForegroundColor Yellow
        return
    }

    Write-Host "📥 Downloading: $FileName" -ForegroundColor Cyan

    if (Test-Command "curl") {
        # Use curl if available (faster for large files)
        curl -L -o $fullPath $Url
    } elseif (Test-Command "wget") {
        # Use wget as alternative
        wget -O $fullPath $Url
    } else {
        # Fallback to PowerShell (slower but always available)
        try {
            $webClient = New-Object System.Net.WebClient
            $webClient.DownloadFile($Url, $fullPath)
            $webClient.Dispose()
        } catch {
            Write-Error "Failed to download $FileName`: $_"
            return
        }
    }

    if (Test-Path $fullPath) {
        $size = (Get-Item $fullPath).Length / 1MB
        Write-Host "✅ Downloaded: $FileName ($([math]::Round($size, 2)) MB)" -ForegroundColor Green
    } else {
        Write-Error "Download failed: $FileName"
    }
}

function Install-ModelArtifacts {
    param([hashtable]$ModelConfig)

    Write-Host "`n🤖 Setting up model: $($ModelConfig.Name)" -ForegroundColor Magenta

    # Create directory if it doesn't exist
    if (!(Test-Path $ModelConfig.LocalPath)) {
        Write-Host "📁 Creating directory: $($ModelConfig.LocalPath)" -ForegroundColor Blue
        New-Item -ItemType Directory -Path $ModelConfig.LocalPath -Force | Out-Null
    }

    # Download each file
    foreach ($file in $ModelConfig.Files) {
        $url = "https://huggingface.co/$($ModelConfig.HuggingFaceRepo)/resolve/main/$file"
        Invoke-ModelFileDownload -Url $url -OutputPath $ModelConfig.LocalPath -FileName $file
    }

    Write-Host "✨ Model setup complete: $($ModelConfig.Name)" -ForegroundColor Green
}

# Main execution
Write-Host "🚀 WebLLM/MLC Model Setup" -ForegroundColor Blue
Write-Host "=========================" -ForegroundColor Blue

if ($Model -eq "all") {
    Write-Host "⚠️  Warning: Downloading all models will require ~7GB of disk space" -ForegroundColor Yellow
    $response = Read-Host "Continue? (y/N)"
    if ($response -ne "y" -and $response -ne "Y") {
        Write-Host "❌ Setup cancelled" -ForegroundColor Red
        exit 1
    }

    foreach ($modelKey in $Models.Keys) {
        Install-ModelArtifacts -ModelConfig $Models[$modelKey]
    }
} else {
    if ($Models.ContainsKey($Model)) {
        Install-ModelArtifacts -ModelConfig $Models[$Model]
    } else {
        Write-Error "Unknown model: $Model. Available models: $($Models.Keys -join ', ')"
        exit 1
    }
}

Write-Host "`n🎉 Setup complete!" -ForegroundColor Green
Write-Host "💡 Next steps:" -ForegroundColor Blue
Write-Host "   1. Run 'npm run build:prod' to build with service worker" -ForegroundColor White
Write-Host "   2. Run 'npm run start:pwa' to test PWA with caching" -ForegroundColor White
Write-Host "   3. Navigate to /mlc-demo to test the setup" -ForegroundColor White
