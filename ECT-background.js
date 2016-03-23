
/**
 * Handles data sent via chrome.extension.sendRequest().
 * @param request Object Data sent in the request.
 * @param sender Object Origin of the request.
 * @param callback Function The method to call when the request completes.
 */
function onRequest(request, sender, callback) {
  if(request.action == 'localStorage_set') {
    localStorage[request.attribute] = JSON.stringify(request.value || null);

    callback();
  } else if(request.action == 'localStorage_get') {
    callback(JSON.parse(localStorage[request.attribute] || null) || null);
  }
};

// Wire up the listener.
chrome.extension.onRequest.addListener(onRequest);
