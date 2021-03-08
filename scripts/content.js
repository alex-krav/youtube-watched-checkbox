jQuery("div#content").after("<p id='youtube-watched-checkbox' style='color:blue;'>WATCHED</p>");

jQuery("p#youtube-watched-checkbox").click(function() {
    // get link ID
    var p = jQuery(this);
    let href = p.prev().find("a#thumbnail").attr("href");
    var url = new URL(window.location + href);
    var v = url.searchParams.get("v");

    // get all IDs from storage
    chrome.storage.local.get({done3: {}}, function(items) {
        // if (!chrome.runtime.error) {
            let holder = objectify(items.done3);
            console.log("loaded from storage: " + JSON.stringify(items.done3));
            console.log(holder.videos_ids);

            if (check(holder,v) === "deleted") {
                p.css('color','blue');
            } else {
                p.css('color','red');
            }
            save(holder);
    });
});

function Holder() {
    this.videos_ids = new Set();
    this.last_updated = new Date(0);
}

function check(holder, id){
    if (holder.videos_ids.has(id)) {
        holder.videos_ids.delete(id);
        return "deleted";
    } else {
        holder.videos_ids.add(id);
        return "added";
    }
}

function jsonify(holder) {
    let holder_json = {};
    holder_json.last_updated = holder.last_updated.getTime();
    holder_json.videos_ids = [...holder.videos_ids];
    return holder_json;
}

function objectify(holder_json) {
    let holder = {};
    holder.last_updated = new Date(holder_json.last_updated);
    holder.videos_ids = new Set(holder_json.videos_ids);
    return holder;
}

function save(holder){
    holder.last_updated = new Date(Date.now());
    let holder_json = jsonify(holder);
    chrome.storage.local.set({done3: holder_json}, function() {
        console.log('saved to storage : ' + JSON.stringify(holder_json));
        console.log(holder.videos_ids);
    });
}

function compare(holder, timestamp_utc) {
    return holder.last_updated.getTime() > timestamp_utc;
}

function update(array, item)
{
    array.push(item);
    chrome.storage.local.set({
        list:array
    }, function() {
        console.log("added to list with new values");
    });
}

function removeItemOnce(arr, value) {
    var index = arr.indexOf(value);
    if (index > -1) {
        arr.splice(index, 1);
    }
    return arr;
}

function includes(arr, value) {
    var index = arr.indexOf(value);
    return index > -1;
}