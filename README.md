### ver 1.0
- mark videos, not playlists
- local storage

### TODO
* popup script:
    * mark playlist as watched?

  
* content script: 
    * DOM loaded (page load, search)
        * get videoIDs from page -> compare to videoIDs from storage -> blur watched
        * get playlists from page -> get videoIDs -> compare -> blur playlist
    * checkbox marked
        * video: blur + add videoID to storage
        * playlist: blur + add playlist videoIDs to storage
  

* local storage
    * video IDs [selected + from DB]


* background script:
    * onload
        * get watched videos from DB -> load to storage
    * onclose
    * every 5 mins
        * save storage to DB 
  

* heroku
    * user ID <-> video IDs

