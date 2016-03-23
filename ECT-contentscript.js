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
    if(input != '') {
      var regexMatch = /^-?[0-9]+(?:.[0-9]+)?$/.exec(input);
      var closest;
      if (regexMatch) {
        var time_int = parseInt(regexMatch[0]);
        var best_date;
        for (var exponent = -3; exponent <= 6; exponent++) {
          var current_date = new Date(Math.pow(10, exponent) * time_int);
          if (!closest || Math.abs(Date() - current_date) < Math.abs(Date() - best_date)) {
            current_date = best_date
          }
        }
        showToolTip(best_date.toString());
    }
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

  function HTTgetWord() {
    var text = "";
    var str_offset = getStringOffsetFromPoint(HTTelem, HTTcurX, HTTcurY);
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
        var valid_word = /^((\w)+|([\u0590-\u05ff\"\']+))$/;
        if(!valid_word.test(str.substring(start, end)))
          return null;
        while(start > 0 && valid_word.test(str.substring(start - 1, end)))
          start--;
        while(end < str.length && valid_word.test(str.substring(start, end+1)))
          end++;
        text = str.substring(start, end);
      }
    }
    processText(text);
  }

  function HTThide(force) {
    if(HTTtimeoutID || force) {
      HTTdefinitions = "";
      HTTtooltip.style.visibility = "hidden";
      HTTtooltip.innerHTML = HTTdefinitions;
      HTTtooltip.style.left = 0 + "px";
      HTTtooltip.style.top = 0 + "px";
      HTTtooltip.style.width = 0 + "px";
      HTTtooltip.style.height = 0 + "px";
      window.clearTimeout(HTTtimeoutID);
      HTTtimeoutID = 0;
    }
  }

  function HTTmousescroll(event) {
    var e = event;

    //variables for use in displaying the translation
    HTTelem = e.target;
    HTTcurX = e.clientX;
    HTTcurY = e.clientY;

    //GM_log("got click");
    if(HTToptions['hide_scroll'])
      HTThide(true); //hide the old one if there is one
    if(HTToptions['trigger_hover'])
      HTTtimeoutID = window.setTimeout(HTTgetWord, HTToptions['HTTtooltipDelay']);
    return;
  }

  function HTTkeypress(event) {
    var e = event;
    
    //GM_log("got keypress");
    if(HTToptions['hide_keyboard'])
      HTThide(true); //hide the old one if there is one

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
    if(HTToptions['trigger_keyboard'] &&
       (HTToptions['HTTtooltipCharacter'] == '' || HTToptions['HTTtooltipCharacter'].indexOf(keychar) >= 0) &&
       (HTToptions['trigger_keyboard_ctrl'] == e.ctrlKey) &&
       (HTToptions['trigger_keyboard_alt'] == e.altKey) &&
       (HTToptions['trigger_keyboard_shift'] == e.shiftKey)) {
      //GM_log("match");
      if(window.getSelection() != '') {
        //GM_log("translating phrase " + window.getSelection());
        processText(window.getSelection());
      } else {
        HTTgetWord(); //get the word under the cursor right now and translate it
      }
    }
    return;
  }

  function HTTmouseup(event) {
    var e = event;
    
    HTTcurX=e.clientX;
    HTTcurY=e.clientY;
    //GM_log("got mouseup " + window.getSelection());
    //HTThide(true); //hide the old one if there is one

    //variables for use in displaying the translation
    //GM_log("try to translate " + window.getSelection());
    if(window.getSelection() != '' &&
       HTToptions['trigger_highlight'] &&
       (HTToptions['trigger_highlight_ctrl'] == e.ctrlKey) &&
       (HTToptions['trigger_highlight_alt'] == e.altKey) &&
       (HTToptions['trigger_highlight_shift'] == e.shiftKey))
      processText(window.getSelection());
    return;
  }

  function HTTclick(event) {
    var e = event;

    //click is used by many handlers, mostly to hide the tooltip
    //variables for use in displaying the translation
    HTTelem = e.target;
    HTTcurX = e.clientX;
    HTTcurY = e.clientY;

    //GM_log("got click");
    if(HTToptions['hide_click'])
      HTThide(true); //hide the old one if there is one
    if(HTToptions['trigger_click'] &&
       (HTToptions['trigger_click_ctrl'] == e.ctrlKey) &&
       (HTToptions['trigger_click_alt'] == e.altKey) &&
       (HTToptions['trigger_click_shift'] == e.shiftKey))
      HTTgetWord(); //get the word under the cursor right now
    return;
  }

  function HTTmousemove(event) {
    var e = event;

    if(HTTelem == e.target && HTTcurX == e.clientX && HTTcurY == e.clientY)
      return; //already got this mousemove so ignore it
      
    //variables for use in finding the word and displaying the translation
    HTTelem = e.target;
    HTTcurX = e.clientX;
    HTTcurY = e.clientY;

    if(HTToptions['hide_move'])
      HTThide(true);
    if(HTToptions['trigger_hover'])
      HTTtimeoutID = window.setTimeout(HTTgetWord, HTToptions['HTTtooltipDelay']);
    return;
  }

  function HTTinit () {
    chrome.extension.sendRequest({'action' : 'localStorage_get', 'attribute' : 'options'}, HTToptions_callback);
    //don't continue until the callback completes
  }

  function HTToptions_callback(options) {
    //below copied from HTT-options.html
    if (!options) {
      options = {};
    }
    if(options['trigger_hover'] == undefined) options['trigger_hover'] = 1;
    if(options['HTTtooltipDelay'] == undefined) options['HTTtooltipDelay'] = 1000;

    if(options['trigger_click'] == undefined) options['trigger_click'] = 0;
    if(options['trigger_click_ctrl'] == undefined) options['trigger_click_ctrl'] = 0;
    if(options['trigger_click_alt'] == undefined) options['trigger_click_alt'] = 0;
    if(options['trigger_click_shift'] == undefined) options['trigger_click_shift'] = 0;
    
    if(options['trigger_highlight'] == undefined) options['trigger_highlight'] = 0;
    if(options['trigger_highlight_ctrl'] == undefined) options['trigger_highlight_ctrl'] = 0;
    if(options['trigger_highlight_alt'] == undefined) options['trigger_highlight_alt'] = 0;
    if(options['trigger_highlight_shift'] == undefined) options['trigger_highlight_shift'] = 0;

    if(options['trigger_keyboard'] == undefined) options['trigger_keyboard'] = 0;
    if(options['trigger_keyboard_ctrl'] == undefined) options['trigger_keyboard_ctrl'] = 0;
    if(options['trigger_keyboard_alt'] == undefined) options['trigger_keyboard_alt'] = 0;
    if(options['trigger_keyboard_shift'] == undefined) options['trigger_keyboard_shift'] = 0;
    if(options['HTTtooltipCharacter'] == undefined) options['HTTtooltipCharacter'] = 'T';

    if(options['hide_move'] == undefined) options['hide_move'] = 1;
    if(options['hide_click'] == undefined) options['hide_click'] = 1;
    if(options['hide_scroll'] == undefined) options['hide_scroll'] = 1;
    if(options['hide_keyboard'] == undefined) options['hide_keyboard'] = 1;

    if(options['align_top'] == undefined) options['align_top'] = 1;
    if(options['align_left'] == undefined) options['align_left'] = 1;
    if(options['keep_on_screen'] == undefined) options['keep_on_screen'] = 1;
    
    if(options['activity_indicator'] == undefined) options['activity_indicator'] = 1;
    
    HTToptions = options;

    if(HTToptions['trigger_hover'] || HTToptions['hide_move']) {
      window.addEventListener("mousemove", HTTmousemove, false);
    }
    if(HTToptions['trigger_click'] || HTToptions['hide_click']) {
      window.addEventListener("click", HTTclick, false);
    }
    if(HTToptions['trigger_highlight']) {
      window.addEventListener("mouseup", HTTmouseup, false);
    }
    if(HTToptions['trigger_keyboard'] || HTToptions['hide_keyboard']) {
      window.addEventListener("keypress", HTTkeypress, false);
    }
    if(HTToptions['trigger_keyboard'] || HTToptions['hide_keyboard']) {
      window.addEventListener("keydown", HTTkeypress, false);
    }
    if(HTToptions['hide_scroll']) {
      window.addEventListener("scroll", HTTmousescroll, false);
    }
    HTTtooltip = document.createElement("div");
    HTTtooltip.className = "HTT HTTtooltip"; //for use by users that might do things with stylish
    document.body.insertBefore(HTTtooltip, document.body.firstChild);
  }
  HTTinit();
})();
