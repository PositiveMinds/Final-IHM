Add-Type -AssemblyName System.IO.Compression

$docxPath = "90-Day Action Plan - AI HIV Automation (Western Uganda).docx"
$zip = [System.IO.Compression.ZipFile]::OpenRead($docxPath)
$entry = $zip.Entries | Where-Object { $_.Name -eq 'document.xml' }

if ($entry) {
    $stream = $entry.Open()
    $reader = New-Object System.IO.StreamReader($stream)
    $xml = $reader.ReadToEnd()
    $reader.Close()
    $stream.Close()
    
    # Remove XML tags
    $text = $xml -replace '<[^>]+>', ''
    $text = $text -replace '&lt;', '<'
    $text = $text -replace '&gt;', '>'
    $text = $text -replace '&amp;', '&'
    
    Write-Output $text
}

$zip.Close()
