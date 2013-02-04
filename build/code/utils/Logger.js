var VERSION = '0.3.0alpha20'; //injected by grunt:concat

// Generated by CoffeeScript 1.4.0
var Logger, _,
  __slice = [].slice;

_ = require('lodash');

Logger = (function() {
  var _this = this;

  Function.prototype.property = function(p) {
    var d, n, _results;
    _results = [];
    for (n in p) {
      d = p[n];
      _results.push(Object.defineProperty(this.prototype, n, d));
    }
    return _results;
  };

  Function.prototype.staticProperty = function(p) {
    var d, n, _results;
    _results = [];
    for (n in p) {
      d = p[n];
      _results.push(Object.defineProperty(Logger.prototype, n, d));
    }
    return _results;
  };

  function Logger() {
    this._constructor.apply(this, arguments);
  }

  Logger.prototype.debugLevel = 0;

  Logger.prototype.VERSION = !(typeof VERSION !== "undefined" && VERSION !== null) ? '{VERSION}' : VERSION;

  Logger.prototype._constructor = function(title) {
    this.title = title;
  };

  Logger.getALog = function(baseMsg, color, cons) {
    return function() {
      var args;
      args = Array.prototype.slice.call(arguments);
      args.unshift("[" + (this.title || '?title?') + "] " + baseMsg + ":");
      args.unshift("" + color + "\n");
      args.push('\u001b[0m');
      cons.apply(null, args);
      return null;
    };
  };

  Logger.prototype.err = Logger.getALog("ERROR", '\u001b[31m', console.error);

  Logger.prototype.log = Logger.getALog("", '\u001b[0m', console.log);

  Logger.prototype.verbose = Logger.getALog("", '\u001b[32m', console.log);

  Logger.prototype.warn = Logger.getALog("WARNING", '\u001b[33m', console.log);

  Logger.prototype.debug = (function() {
    var log;
    log = Logger.getALog("DEBUG:", '\u001b[36m', console.log);
    return function() {
      var level, msgs;
      level = arguments[0], msgs = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if (_.isString(level)) {
        msgs.unshift(level);
        msgs.unshift('(-)');
        level = 1;
      } else {
        msgs.unshift("(" + level + ")");
      }
      if (level <= this.debugLevel) {
        return log.apply(this, msgs);
      }
    };
  })();

  Logger.prototype.prettify = (function(inspect) {
    return function(o) {
      return ("\u001b[0m" + (inspect(o, false, null, true))).replace(/\n/g, '');
    };
  })(require('util').inspect);

  return Logger;

}).call(this);

module.exports = Logger;
