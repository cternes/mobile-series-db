Mobile Series Db
================
Mobile Series Db is a Html 5 mobile application that displays the status of your library shows on http://trakt.tv/.

It displays all the shows in your library together with the next unseen season. 
If you've watched all seasons, the show will be marked as completed.

Setup
================
For the setup you have to enter your Trakt username and API key in the config file located at `/js/config/config.json`.


Offline Application
================
The application can be run in offline mode. If you use it on a mobile device, it will regonize if you're online or offline.
When you're online it will fetch your show status directly from http://trakt.tv/, if not the shows are fetched from the internal browser storage of your mobile device.
This will enable you to use the application even if you're not online.