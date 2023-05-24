# speedyrss
A toy for fetching rss/atom feeds and pushing to a channel on Discord. (very alpha)


## setup 
### (N.B. Bot is currently set to private on Discord, but this will probably change when better formed...)

- copy .env-dist to .env and fill out the appropriate settings.
- populate data/feedUrls.json with the things you want to keep track of.
  - Example: 
    ```json
    {
        "DBM_Retail": "https://github.com/DeadlyBossMods/DBM-Retail/releases.atom",
    }
    ```
  - The Key is a short name that gets put in the alert message.
  - The Value is the URL.  For GitHub, I use the releases.atom feed.
- You can adjust the update schedule towards the end of index.js. (By default, it updates every two hours)
  - Previous response titles (which should be the release name) are stored in data/previous_responses.json. (As long as these are unique, you're good!)

## discord notes

- Currently, I run this with only the create message, manage messages (on updates channel only), and embed links permissions.
- My bot has access to a text channel I made for it, and that's it.  Works well, so far!

