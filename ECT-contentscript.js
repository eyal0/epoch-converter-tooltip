(function() {
  //globals
  var timeoutID;
  var elem;
  var curX;
  var curY;
  var tooltip;
  var options;

  //helper functions
  function appendChild(child,parent){return(parent.insertBefore(child,parent.lastChild.nextSibling));}

  function showToolTip(html_results) {
    if(html_results.length) {
      var minX, minY, maxX, maxY, ttX, ttY;

      tooltip.style.width = "auto";
      tooltip.style.height = "auto";
      tooltip.innerHTML = html_results;
      tooltip.firstChild.style.marginTop = "0";
      tooltip.firstChild.style.marginRight = "0";
      tooltip.firstChild.style.marginBottom = "0";
      tooltip.firstChild.style.marginLeft = "0";
      ttX = curX;
      ttY = curY;
      if(options['align_left']) {
        ttX += 10;
      } else {
        ttX -= tooltip.scrollWidth + 10;
      }
      if(options['align_top']) {
        ttY += 10;
      } else {
        ttY -= tooltip.scrollHeight + 10;
      }
      minX = 0;
      minY = 0;
      maxX = minX + window.innerWidth - tooltip.scrollWidth;
      maxY = minY + window.innerHeight - tooltip.scrollHeight;
      if(options['keep_on_screen']) {
        if(ttX < minX)
          ttX = minX;
        else if(ttX > maxX)
          ttX = maxX;
        if(ttY < minY)
          ttY = minY;
        else if(ttY > maxY)
          ttY = maxY;
      }
      tooltip.style.left = ttX + "px";
      tooltip.style.top = ttY + "px";

      tooltip.style.visibility="visible";
    }
  }

  function processText(input) {
    var time_int = parseInt(input);
    var best_date;
    for (var exponent = -3; exponent <= 6; exponent+=3) {
      var current_date = new Date(Math.pow(10, exponent) * time_int);
      if (!best_date || Math.abs(new Date() - current_date) < Math.abs(new Date() - best_date)) {
        best_date = current_date;
      }
    }
    var html_results = '<div>';
    if (options['show_local_time']) {
      html_results += best_date.toString() + '<br />';
    }
    if (options['show_utc']) {
      html_results += best_date.toUTCString() + "<br />";
    }
    html_results += "</div>";
    showToolTip(html_results);
  }

  function getStringOffsetFromPoint(elem, x, y) {
    try {
      if(elem.nodeType == elem.TEXT_NODE) {
        var range = elem.ownerDocument.createRange();
        range.selectNodeContents(elem);
        var str = range.toString();
        var currentPos = 0;
        var endPos = range.endOffset;
        //can't binary search because the rectangles are complicated, two-dimensional
        while(currentPos < endPos) {
          range.setStart(elem, currentPos);
          range.setEnd(elem, currentPos+1);
          if(range.getBoundingClientRect() &&
             range.getBoundingClientRect().left <= x && range.getBoundingClientRect().right  >= x &&
             range.getBoundingClientRect().top  <= y && range.getBoundingClientRect().bottom >= y) {
            range.detach();
            return({'string' : str, 'offset' : currentPos, 'text_node' : elem});
          }
          currentPos += 1;
        }
      } else {
        for(var i = 0; i < elem.childNodes.length; i++) {
          var range = elem.childNodes[i].ownerDocument.createRange();
          try {
            range.selectNodeContents(elem.childNodes[i]);
          } catch(err) {
            continue;
          }
          if(range.getBoundingClientRect() &&
             range.getBoundingClientRect().left <= x && range.getBoundingClientRect().right  >= x &&
             range.getBoundingClientRect().top  <= y && range.getBoundingClientRect().bottom >= y) {
            range.detach();
            var ret = getStringOffsetFromPoint(elem.childNodes[i], x, y);
            if(ret)
              return(ret);
          } else {
            range.detach();
          }
        }
      }
      return(null);
    } catch (e) {
      return(null);
    }
  }

  var valid_word = /^-?[0-9]+(?:.[0-9]+)?$/;

  function getWord() {
    var text = "";
    var str_offset = getStringOffsetFromPoint(elem, curX, curY);
    if(str_offset) {
      var range = window.getSelection();
      if(range && //there is a range
         range.toString != "" && //there is text selected
         range.anchorNode == range.focusNode && //it's just a single node
         str_offset.text_node == range.anchorNode && //it's the same node as the one under the cursor
         ((range.baseOffset < range.focusOffset && range.baseOffset <= str_offset.offset && str_offset.offset <= range.focusOffset) || //offset is inside the selected region
          (range.focusOffset < range.baseOffset && range.focusOffset <= str_offset.offset && str_offset.offset <= range.baseOffset))) {
        text = range.toString();
      } else {
        var str = str_offset.string;
        var start = str_offset.offset;
        var end = start + 1;
        if(!valid_word.test(str.substring(start, end)))
          return null;
        while(start > 0 && valid_word.test(str.substring(start - 1, end)))
          start--;
        while(end < str.length && valid_word.test(str.substring(start, end+1)))
          end++;
        text = str.substring(start, end);
      }
      processText(text);
    }
  }

  function hide(force) {
    if(timeoutID || force) {
      tooltip.style.visibility = "hidden";
      tooltip.innerHTML = "";
      tooltip.style.left = 0 + "px";
      tooltip.style.top = 0 + "px";
      tooltip.style.width = 0 + "px";
      tooltip.style.height = 0 + "px";
      window.clearTimeout(timeoutID);
      timeoutID = 0;
    }
  }

  function mousescroll(event) {
    var e = event;

    //variables for use in displaying the translation
    elem = e.target;
    curX = e.clientX;
    curY = e.clientY;

    //GM_log("got click");
    if(options['hide_scroll'])
      hide(true); //hide the old one if there is one
    if(options['trigger_hover'])
      timeoutID = window.setTimeout(getWord, options['tooltipDelay']);
    return;
  }

  function keypress(event) {
    var e = event;
    
    //GM_log("got keypress");
    if(options['hide_keyboard'])
      hide(true); //hide the old one if there is one

    var keynum;
    var keychar;
    var numcheck;
    var text;

    if(window.event) // IE
      keynum = e.keyCode;
    else if(e.which) // Netscape/Firefox/Opera
      keynum = e.which;

    keychar = String.fromCharCode(keynum);
    //GM_log("keychar is " + keychar);
    if(options['trigger_keyboard'] &&
       (options['tooltipCharacter'] == '' || options['tooltipCharacter'].indexOf(keychar) >= 0) &&
       (options['trigger_keyboard_ctrl'] == e.ctrlKey) &&
       (options['trigger_keyboard_alt'] == e.altKey) &&
       (options['trigger_keyboard_shift'] == e.shiftKey)) {
      //GM_log("match");
      if(window.getSelection() != '') {
        //GM_log("translating phrase " + window.getSelection());
        processText(window.getSelection());
      } else {
        getWord(); //get the word under the cursor right now and translate it
      }
    }
    return;
  }

  function mouseup(event) {
    var e = event;
    
    curX=e.clientX;
    curY=e.clientY;

    //variables for use in displaying the translation
    //GM_log("try to translate " + window.getSelection());
    if(window.getSelection() != '' &&
       options['trigger_highlight'] &&
       (options['trigger_highlight_ctrl'] == e.ctrlKey) &&
       (options['trigger_highlight_alt'] == e.altKey) &&
       (options['trigger_highlight_shift'] == e.shiftKey))
      processText(window.getSelection());
    return;
  }

  function click(event) {
    var e = event;

    //click is used by many handlers, mostly to hide the tooltip
    //variables for use in displaying the translation
    elem = e.target;
    curX = e.clientX;
    curY = e.clientY;

    //GM_log("got click");
    if(options['hide_click'])
      hide(true); //hide the old one if there is one
    if(options['trigger_click'] &&
       (options['trigger_click_ctrl'] == e.ctrlKey) &&
       (options['trigger_click_alt'] == e.altKey) &&
       (options['trigger_click_shift'] == e.shiftKey))
      getWord(); //get the word under the cursor right now
    return;
  }

  function mousemove(event) {
    var e = event;

    if(elem == e.target && curX == e.clientX && curY == e.clientY)
      return; //already got this mousemove so ignore it
      
    //variables for use in finding the word and displaying the translation
    elem = e.target;
    curX = e.clientX;
    curY = e.clientY;

    if(options['hide_move'])
      hide(true);
    if(options['trigger_hover'])
      timeoutID = window.setTimeout(getWord, options['tooltipDelay']);
    return;
  }

  function init () {
    chrome.extension.sendRequest({'action' : 'localStorage_get', 'attribute' : 'options'}, options_callback);
    //don't continue until the callback completes
  }

  function options_callback(current_options) {
    //below copied from ECT-options.js
    if (!current_options) {
      current_options = {};
    }
    if(current_options['trigger_hover'] == undefined) current_options['trigger_hover'] = 1;
    if(current_options['tooltipDelay'] == undefined) current_options['tooltipDelay'] = 1000;

    if(current_options['trigger_click'] == undefined) current_options['trigger_click'] = 0;
    if(current_options['trigger_click_ctrl'] == undefined) current_options['trigger_click_ctrl'] = 0;
    if(current_options['trigger_click_alt'] == undefined) current_options['trigger_click_alt'] = 0;
    if(current_options['trigger_click_shift'] == undefined) current_options['trigger_click_shift'] = 0;
    
    if(current_options['trigger_highlight'] == undefined) current_options['trigger_highlight'] = 0;
    if(current_options['trigger_highlight_ctrl'] == undefined) current_options['trigger_highlight_ctrl'] = 0;
    if(current_options['trigger_highlight_alt'] == undefined) current_options['trigger_highlight_alt'] = 0;
    if(current_options['trigger_highlight_shift'] == undefined) current_options['trigger_highlight_shift'] = 0;

    if(current_options['trigger_keyboard'] == undefined) current_options['trigger_keyboard'] = 0;
    if(current_options['trigger_keyboard_ctrl'] == undefined) current_options['trigger_keyboard_ctrl'] = 0;
    if(current_options['trigger_keyboard_alt'] == undefined) current_options['trigger_keyboard_alt'] = 0;
    if(current_options['trigger_keyboard_shift'] == undefined) current_options['trigger_keyboard_shift'] = 0;
    if(current_options['tooltipCharacter'] == undefined) current_options['tooltipCharacter'] = 'T';

    if(current_options['show_local_time'] == undefined) current_options['show_local_time'] = 0;
    if(current_options['show_utc'] == undefined) current_options['show_utc'] = 1;
    
    if(current_options['hide_move'] == undefined) current_options['hide_move'] = 1;
    if(current_options['hide_click'] == undefined) current_options['hide_click'] = 1;
    if(current_options['hide_scroll'] == undefined) current_options['hide_scroll'] = 1;
    if(current_options['hide_keyboard'] == undefined) current_options['hide_keyboard'] = 1;

    if(current_options['align_top'] == undefined) current_options['align_top'] = 1;
    if(current_options['align_left'] == undefined) current_options['align_left'] = 1;
    if(current_options['keep_on_screen'] == undefined) current_options['keep_on_screen'] = 1;
    
    if(current_options['activity_indicator'] == undefined) current_options['activity_indicator'] = 1;
    
    options = current_options;

    if(options['trigger_hover'] || options['hide_move']) {
      window.addEventListener("mousemove", mousemove, false);
    }
    if(options['trigger_click'] || options['hide_click']) {
      window.addEventListener("click", click, false);
    }
    if(options['trigger_highlight']) {
      window.addEventListener("mouseup", mouseup, false);
    }
    if(options['trigger_keyboard'] || options['hide_keyboard']) {
      window.addEventListener("keypress", keypress, false);
    }
    if(options['trigger_keyboard'] || options['hide_keyboard']) {
      window.addEventListener("keydown", keypress, false);
    }
    if(options['hide_scroll']) {
      window.addEventListener("scroll", mousescroll, false);
    }
    tooltip = document.createElement("div");
    tooltip.className = "ECT ECTtooltip"; //for use by users that might do things with stylish
    document.body.insertBefore(tooltip, document.body.firstChild);
  }
  init();
})();
