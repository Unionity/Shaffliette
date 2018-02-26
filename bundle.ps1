<#
  Bundling utility for Shaffliette
  --------------------------------
  Have a great day!
#>
if(Test-Path www/js/bundle.js) {
  Remove-Item www/js/bundle.js
}
New-Item www/js/bundle.js -ItemType file
Write-Verbose "Created file"
Write-Verbose "Starting..."
Get-Content lib/jquery.js | Out-File -filepath www/js/bundle.js -Encoding utf8 -Append -Force
Get-Content lib/jquery-ui.min.js | Out-File -filepath www/js/bundle.js -Encoding utf8 -Append -Force
Get-Content lib/moment.js | Out-File -filepath www/js/bundle.js -Encoding utf8 -Append -Force
Write-Verbose "Libraries bundling finished"
Write-Verbose "Starting..."
Get-Content www/js/Settings.js | Out-File -filepath www/js/bundle.js -Encoding utf8 -Append -Force
Get-Content www/js/Tag.js | Out-File -filepath www/js/bundle.js -Encoding utf8 -Append -Force
Get-Content www/js/TagCollection.js | Out-File -filepath www/js/bundle.js -Encoding utf8 -Append -Force
Get-Content www/js/Comment.js | Out-File -filepath www/js/bundle.js -Encoding utf8 -Append -Force
Get-Content www/js/CommentCollection.js | Out-File -filepath www/js/bundle.js -Encoding utf8 -Append -Force
Get-Content www/js/Art.js | Out-File -filepath www/js/bundle.js -Encoding utf8 -Append -Force
Get-Content www/js/ArtCollection.js | Out-File -filepath www/js/bundle.js -Encoding utf8 -Append -Force
Get-Content www/js/AbstractModel.js | Out-File -filepath www/js/bundle.js -Encoding utf8 -Append -Force
Get-Content www/js/AbstractDanbooruAPIModel.js | Out-File -filepath www/js/bundle.js -Encoding utf8 -Append -Force
Get-Content www/js/AbstractDanbooru2APIModel.js | Out-File -filepath www/js/bundle.js -Encoding utf8 -Append -Force
Get-Content www/js/BooruModel.js | Out-File -filepath www/js/bundle.js -Encoding utf8 -Append -Force
Get-Content www/js/BooruDOMModel.js | Out-File -filepath www/js/bundle.js -Encoding utf8 -Append -Force
Get-Content www/js/AbstractGelbooruAPIModel.js | Out-File -filepath www/js/bundle.js -Encoding utf8 -Append -Force
Get-Content www/js/XBooruModel.js | Out-File -filepath www/js/bundle.js -Encoding utf8 -Append -Force
Get-Content www/js/ThreeDBooruModel.js | Out-File -filepath www/js/bundle.js -Encoding utf8 -Append -Force
Get-Content www/js/YukkuriModel.js | Out-File -filepath www/js/bundle.js -Encoding utf8 -Append -Force
Get-Content www/js/KonachanModel.js | Out-File -filepath www/js/bundle.js -Encoding utf8 -Append -Force
Get-Content www/js/SafeBooruModel.js | Out-File -filepath www/js/bundle.js -Encoding utf8 -Append -Force
Get-Content www/js/GelbooruModel.js | Out-File -filepath www/js/bundle.js -Encoding utf8 -Append -Force
Get-Content www/js/DownloadManager.js | Out-File -filepath www/js/bundle.js -Encoding utf8 -Append -Force
Get-Content www/js/ShafflCollectionView.js | Out-File -filepath www/js/bundle.js -Encoding utf8 -Append -Force
Get-Content www/js/ShafflArtView.js | Out-File -filepath www/js/bundle.js -Encoding utf8 -Append -Force
Get-Content www/js/ShafflIndexController.js | Out-File -filepath www/js/bundle.js -Encoding utf8 -Append -Force
Get-Content www/js/ShafflArtController.js | Out-File -filepath www/js/bundle.js -Encoding utf8 -Append -Force
Write-Verbose "Sources bundling finished"
$([char]7)
Write-Verbose "Finished"
Write-Host "Ok"