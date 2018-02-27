# Building from sources
![Difficulty](https://img.shields.io/badge/difficulty-%E2%98%86%E2%98%86%E2%98%86%E2%98%86%E2%98%86-yellowgreen.svg?style=for-the-badge)  Building from sources is intended for expert users or developers only. Please consider downloading pre-builded binaries.
## Required files
You will need phonegap/cordova and powershell as a software and also you will need to install dependencies such as plugins, jQuery, etc...
1. Clone repository on your PC, or download `zipball`
2. ```bash
    mkdir lib
   ```
3. Put in directory `lib` dependencies: 
    1.  [jQuery](https://code.jquery.com/jquery-git.js) as `jquery.js`
    2.  [jQuery UI](http://jqueryui.com/download/#!version=1.9.2) as `jquery-ui.min.js`
    3. Put CSS files from jQuery UI into `www/assets/styles/`
    4. [Moment](http://momentjs.com/downloads/moment.min.js) as `moment.js`
 4. ```bash
    npm install
    ```
## Building from sources
Be sure to have  
[X] PhoneGap  
[X] Powershell  
[X] Dependencies
ready.
1. Run `bundle.ps1` and wait for beep
2. ```bash
    phonegap cordova prepare android
   ```
3. ```bash
    phonegap cordova build android
   ```
4. Install generated apk
5. Enjoy! <sup>You wasted your time and got only this thingy!</sup>