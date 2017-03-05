function $(selector) {
  return document.querySelector(selector);
}

var $$ = function(selector) {
  return [].slice.call(document.querySelectorAll(selector));
}
