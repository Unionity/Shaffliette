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
Get-Content www/js/Datatypes/Tag.js | Out-File -filepath www/js/bundle.js -Encoding utf8 -Append -Force
Get-Content www/js/Datatypes/Collections/TagCollection.js | Out-File -filepath www/js/bundle.js -Encoding utf8 -Append -Force
Get-Content www/js/Datatypes/Comment.js | Out-File -filepath www/js/bundle.js -Encoding utf8 -Append -Force
Get-Content www/js/Datatypes/Collections/CommentCollection.js | Out-File -filepath www/js/bundle.js -Encoding utf8 -Append -Force
Get-Content www/js/Datatypes/Art.js | Out-File -filepath www/js/bundle.js -Encoding utf8 -Append -Force
Get-Content www/js/Datatypes/Collections/ArtCollection.js | Out-File -filepath www/js/bundle.js -Encoding utf8 -Append -Force
Get-Content www/js/Datatypes/Note.js | Out-File -filepath www/js/bundle.js -Encoding utf8 -Append -Force
Get-Content www/js/Datatypes/Collections/NoteCollection.js | Out-File -filepath www/js/bundle.js -Encoding utf8 -Append -Force
Get-Content www/js/Models/AbstractXMLModel.js | Out-File -filepath www/js/bundle.js -Encoding utf8 -Append -Force
Get-Content www/js/DownloadManager.js | Out-File -filepath www/js/bundle.js -Encoding utf8 -Append -Force
Get-Content www/js/Views/ShafflCollectionView.js | Out-File -filepath www/js/bundle.js -Encoding utf8 -Append -Force
Get-Content www/js/Views/ShafflCommentsView.js | Out-File -filepath www/js/bundle.js -Encoding utf8 -Append -Force
Get-Content www/js/Views/ShafflArtView.js | Out-File -filepath www/js/bundle.js -Encoding utf8 -Append -Force
Get-Content www/js/Controllers/ShafflIndexController.js | Out-File -filepath www/js/bundle.js -Encoding utf8 -Append -Force
Get-Content www/js/Controllers/ShafflArtController.js | Out-File -filepath www/js/bundle.js -Encoding utf8 -Append -Force
Write-Verbose "Sources bundling finished"
$([char]7)
Write-Verbose "Finished"
Write-Host "Ok"