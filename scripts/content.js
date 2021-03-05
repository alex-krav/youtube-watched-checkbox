jQuery("div#content").after("<p id='youtube-watched-checkbox' style='color:blue;'>WATCHED</p>");

jQuery("p#youtube-watched-checkbox").click(function() {
    // get link ID
    var p = jQuery(this);
    let href = p.prev().find("a#thumbnail").attr("href");
    var url = new URL(window.location + href);
    var v = url.searchParams.get("v");

    // get all IDs from storage
    var array = [];
    chrome.storage.local.get({ids: []}, function(items) {
        // if (!chrome.runtime.error) {
            array = items.ids;
            console.log("loaded from storage: " + array.join(',') );

            if (includes(array, v)) {
                // found:
                console.log(v + " in " + array.join(","));
                p.css('color','blue');
                removeItemOnce(array,v);
            } else {
                // not found:
                console.log(v + " NOT in " + array.join(","));
                p.css('color','red');
                array.push(v);
            }
            chrome.storage.local.set({ids: array}, function()
                {console.log('saved to storage : ' + array.join(','));
            });
    });
});


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