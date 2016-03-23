// Saves options to localStorage.
function save_options() {
  var options = {'trigger_hover' : document.getElementById("TriggerHover").checked,
                  'tooltipDelay' : document.getElementById("TriggerHoverDelay").value,

                  'trigger_click' : document.getElementById("TriggerClick").checked,
                  'trigger_click_ctrl' : document.getElementById("TriggerClickCtrl").checked,
                  'trigger_click_alt' : document.getElementById("TriggerClickAlt").checked,
                  'trigger_click_shift' : document.getElementById("TriggerClickShift").checked,

                  'trigger_highlight' : document.getElementById("TriggerHighlight").checked,
                  'trigger_highlight_ctrl' : document.getElementById("TriggerHighlightCtrl").checked,
                  'trigger_highlight_alt' : document.getElementById("TriggerHighlightAlt").checked,
                  'trigger_highlight_shift' : document.getElementById("TriggerHighlightShift").checked,

                  'trigger_keyboard' : document.getElementById("TriggerKeyboard").checked,
                  'trigger_keyboard_ctrl' : document.getElementById("TriggerKeyboardCtrl").checked,
                  'trigger_keyboard_alt' : document.getElementById("TriggerKeyboardAlt").checked,
                  'trigger_keyboard_shift' : document.getElementById("TriggerKeyboardShift").checked,
                  'tooltipCharacter' : document.getElementById("TriggerKeyboardCharacter").value,

                  'hide_move' : document.getElementById("HideMove").checked,
                  'hide_click' : document.getElementById("HideClick").checked,
                  'hide_scroll' : document.getElementById("HideScroll").checked,
                  'hide_keyboard' : document.getElementById("HideKeyboard").checked,

                  'align_top' : document.getElementById("LocationY1").checked,
                  'align_left' : document.getElementById("LocationX1").checked,
                  'keep_on_screen' : document.getElementById("KeepOnScreen").checked,
                  
                  'activity_indicator' : document.getElementById("ActivityIndicator").checked};
  localStorage["options"] = JSON.stringify(options);
}

// Restores select box state to saved value from localStorage.
function restore_options() {
  var options = localStorage['options'] && JSON.parse(localStorage['options']);
  if (!options) {
    options = {};
  }
  if(options['trigger_hover'] == undefined) options['trigger_hover'] = 1;
  if(options['tooltipDelay'] == undefined) options['tooltipDelay'] = 1000;

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
  if(options['tooltipCharacter'] == undefined) options['tooltipCharacter'] = 'T';

  if(options['hide_move'] == undefined) options['hide_move'] = 1;
  if(options['hide_click'] == undefined) options['hide_click'] = 1;
  if(options['hide_scroll'] == undefined) options['hide_scroll'] = 1;
  if(options['hide_keyboard'] == undefined) options['hide_keyboard'] = 1;

  if(options['align_top'] == undefined) options['align_top'] = 1;
  if(options['align_left'] == undefined) options['align_left'] = 1;
  if(options['keep_on_screen'] == undefined) options['keep_on_screen'] = 1;
  
  if(options['activity_indicator'] == undefined) options['activity_indicator'] = 1;

  document.getElementById("TriggerHover").checked = options['trigger_hover'];
  document.getElementById("TriggerHoverDelay").value = options['tooltipDelay'];

  document.getElementById("TriggerClick").checked = options['trigger_click'];
  document.getElementById("TriggerClickCtrl").checked = options['trigger_click_ctrl'];
  document.getElementById("TriggerClickAlt").checked = options['trigger_click_alt'];
  document.getElementById("TriggerClickShift").checked = options['trigger_click_shift'];

  document.getElementById("TriggerHighlight").checked = options['trigger_highlight'];
  document.getElementById("TriggerHighlightCtrl").checked = options['trigger_highlight_ctrl'];
  document.getElementById("TriggerHighlightAlt").checked = options['trigger_highlight_alt'];
  document.getElementById("TriggerHighlightShift").checked = options['trigger_highlight_shift'];

  document.getElementById("TriggerKeyboard").checked = options['trigger_keyboard'];
  document.getElementById("TriggerKeyboardCtrl").checked = options['trigger_keyboard_ctrl'];
  document.getElementById("TriggerKeyboardAlt").checked = options['trigger_keyboard_alt'];
  document.getElementById("TriggerKeyboardShift").checked = options['trigger_keyboard_shift'];
  document.getElementById("TriggerKeyboardCharacter").value = options['tooltipCharacter'];

  document.getElementById("HideMove").checked = options['hide_move'];
  document.getElementById("HideClick").checked = options['hide_click'];
  document.getElementById("HideScroll").checked = options['hide_scroll'];
  document.getElementById("HideKeyboard").checked = options['hide_keyboard'];

  document.getElementById("LocationY1").checked = options['align_top'];
  document.getElementById("LocationX1").checked = options['align_left'];
  document.getElementById("LocationY0").checked = !options['align_top'];
  document.getElementById("LocationX0").checked = !options['align_left'];
  document.getElementById("KeepOnScreen").checked = options['keep_on_screen'];
  
  document.getElementById("ActivityIndicator").checked = options['activity_indicator'];
}

document.addEventListener('DOMContentLoaded', restore_options);
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById("save_button").addEventListener('click', save_options);
}, false);
