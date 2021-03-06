// Generated by CoffeeScript 1.6.3
var BundleBase, Dependency, UError, fs, l, pathRelative, upath, _, _B, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

_ = require('lodash');

fs = require('fs');

_B = require('uberscore');

l = new _B.Logger('urequire/process/BundleBase');

upath = require('../paths/upath');

pathRelative = require('../paths/pathRelative');

Dependency = require('../fileResources/Dependency');

UError = require('../utils/UError');

/*
Common functionality used at build time (Bundle) or runtime (NodeRequirer)
*/


BundleBase = (function(_super) {
  __extends(BundleBase, _super);

  function BundleBase() {
    _ref = BundleBase.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  Object.defineProperties(BundleBase.prototype, {
    webRoot: {
      get: function() {
        return upath.normalize("" + (this.webRootMap[0] === '.' ? this.path + '/' + this.webRootMap : this.webRootMap));
      }
    }
  });

  /*
  For a given `Dependency`, resolve *all possible* paths to the file.
  
  `resolvePaths` is respecting:
       - The `Dependency`'s own semantics, eg `webRootMap` if `dep` is relative to web root (i.e starts with `\`) and similarly for isRelative etc. See <code>Dependency</code>
       - `@relativeTo` param, which defaults to the module file calling `require` (ie. @dirname), but can be anything eg. @path.
       - `requirejs` config, if it exists in this instance of BundleBase / NodeRequirer
  
  @param {Dependency} dep The Dependency instance whose paths we are resolving.
  @param {String} relativeTo Resolve relative to this path. Default is `@dirname`, i.e the module/file that called `require`
  
  @return {Array<String>} The resolved paths of the Dependency
  */


  BundleBase.prototype.resolvePaths = function(dep, relativeTo) {
    var addit, depName, path, pathStart, paths, resPaths, _i, _len, _ref1;
    if (relativeTo == null) {
      relativeTo = this.dirname;
    }
    depName = dep.name({
      plugin: false,
      ext: true
    });
    resPaths = [];
    addit = function(path) {
      return resPaths.push(upath.normalize(path));
    };
    if (dep.isFileRelative) {
      addit(relativeTo + '/' + depName);
    } else {
      if (dep.isWebRootMap) {
        addit(this.webRoot + depName);
      } else {
        pathStart = depName.split('/')[0];
        if ((_ref1 = this.getRequireJSConfig().paths) != null ? _ref1[pathStart] : void 0) {
          paths = this.getRequireJSConfig().paths[pathStart];
          if (!_.isArray(paths)) {
            paths = [paths];
          }
          for (_i = 0, _len = paths.length; _i < _len; _i++) {
            path = paths[_i];
            addit(this.path + (depName.replace(pathStart, path)));
          }
        } else {
          if (dep.isRelative) {
            addit(this.path + depName);
          } else {
            addit(depName);
            addit(this.path + depName);
          }
        }
      }
    }
    return resPaths;
  };

  return BundleBase;

})(_B.CalcCachedProperties);

module.exports = BundleBase;
