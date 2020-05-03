# Frontend

## Develop on device

ionic cordova run android --livereload
ionic cordova run android --livereload --prod --release


## Release PWA

1. Set `develMode: false` in `app.config.ts`
2. Increase `version` in `app.config.ts`
3. Run `yarn deploy`
4. Set `develMode: true` in `app.config.ts`


## Release App

Stop `ionic serve`

Increase version in config.xml

Increase version in app.config.ts

Set `develMode: false` in app.config.ts

`ionic cordova build android --prod --release`

`cd platforms/android/app/build/outputs/apk/release`

`jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore release-key.keystore app-release-unsigned.apk alias_name`

`rm app.apk`

`/development/android-sdk-macosx/build-tools/22.0.1/zipalign -v 4 app-release-unsigned.apk app.apk`

Upload app.apk

Set `develMode: true` in app.config.ts

`cd ../../../../../../../``
