# hosting: render.com
    email: help.sudorv@gmail.com

# database: clever cloud
    email: help.sudorv@gmail.com



<!-- note -->
before pushing to server

change AppStates/states file 
    set isProduction = true

change index.js 
    set isProduction = true 


## APK BUILD COMMAND:

 ```.\gradlew assembleRelease "-PreactNativeArchitectures=arm64-v8a,armeabi-v7a" --no-build-cache```