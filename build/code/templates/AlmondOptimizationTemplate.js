// Generated by CoffeeScript 1.6.3
var AlmondOptimizationTemplate, Dependency, Template, l, _, _B,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

_ = require('lodash');

_B = require('uberscore');

l = new _B.Logger('urequire/AlmondOptimizationTemplate');

Dependency = require('../fileResources/Dependency');

Template = require('./Template');

module.exports = AlmondOptimizationTemplate = (function(_super) {
  __extends(AlmondOptimizationTemplate, _super);

  function AlmondOptimizationTemplate(bundle) {
    var aVar, bd, bundleDep, bundleDepVars, dep, depVars, _i, _len, _ref, _ref1,
      _this = this;
    this.bundle = bundle;
    /* globals & exports.bundle handling.
    
     Assuming
    
       @bundle.globalDepsVars = {lodash: ['_'], jquery: ['$', 'jQuery']}
       @bundle.exportsBundleDepsVars = {lodash: ['_', '_lodash_'], 'agreement/isAgree': ['isAgree', 'isAgree2']}
    
    We need the following :
    */

    this.exportsBundleGlobalParams = [];
    this.exportsBundleGlobalDeps = [];
    _ref = this.bundle.exportsBundleDepsVars;
    for (bundleDep in _ref) {
      bundleDepVars = _ref[bundleDep];
      bd = new Dependency(bundleDep, {
        path: '__rootOfBundle__',
        bundle: this.bundle
      });
      switch (bd.type) {
        case 'global':
          if (!this.bundle.globalDepsVars[bundleDep]) {
            this.bundle.globalDepsVars[bundleDep] = bundleDepVars;
          }
      }
    }
    _ref1 = this.bundle.exportsBundleDepsVars;
    for (dep in _ref1) {
      depVars = _ref1[dep];
      if (this.bundle.globalDepsVars[dep]) {
        for (_i = 0, _len = depVars.length; _i < _len; _i++) {
          aVar = depVars[_i];
          if (__indexOf.call(this.exportsBundleGlobalParams, aVar) < 0) {
            this.exportsBundleGlobalParams.push(aVar);
            this.exportsBundleGlobalDeps.push(dep);
          }
        }
      }
    }
    this.exportsBundleNonGlobalsDepsVars = _.pick(this.bundle.exportsBundleDepsVars, function(vars, dep) {
      return !_this.bundle.globalDepsVars[dep];
    });
    this.globalNonExportsBundleDepsVars = _.pick(this.bundle.globalDepsVars, function(vars, dep) {
      return !_this.bundle.exportsBundleDepsVars[dep];
    });
    this.defineAMDDeps = this.exportsBundleGlobalDeps.concat(_.keys(this.globalNonExportsBundleDepsVars));
  }

  Object.defineProperties(AlmondOptimizationTemplate.prototype, {
    wrap: {
      get: function() {
        var p,
          _this = this;
        return {
          start: "// Combined file generated by uRequire v" + (require('../urequire').VERSION) + ", with help from r.js & almond\n(function (global){\n\n  " + this.runtimeInfo + "\n\n  var window = global, __nodeRequire = (__isNode ? require : void 0);\n\n  " + ((p = this.bundle.mergedPreDefineIFINodesCode) ? "// uRequire: start of mergedPreDefineIFINodesCode \n " + p + "\n  // uRequire: end of mergedPreDefineIFINodesCode" : '') + "\n\n  var factory = function(" + (this.exportsBundleGlobalParams.join(', ')) + ") {",
          end: "\n\n    " + (((function() {
            var dep, vars, _ref, _results;
            _ref = _this.exportsBundleNonGlobalsDepsVars;
            _results = [];
            for (dep in _ref) {
              vars = _ref[dep];
              _results.push('var ' + vars.join(', ') + '; ' + vars.join(' = ') + (" = require('" + dep + "');"));
            }
            return _results;
          })()).join('\n')) + "\n\n    return require('" + this.bundle.main + "');\n  };\n\n  if (__isAMD) {\n    define(" + (this.defineAMDDeps.length ? "['" + this.defineAMDDeps.join("', '") + "'], " : '') + "factory);\n  } else {\n      if (__isNode) {\n          module.exports = factory(" + (this.exportsBundleGlobalDeps.length ? "require('" + this.exportsBundleGlobalDeps.join("'), require('") + "')" : '') + ");\n      } else { // plain <script> tag - grab vars from 'window'\n          factory(" + (this.exportsBundleGlobalParams.join(', ')) + ");\n      }\n  }\n})(typeof exports === 'object' ? global : window);"
        };
      }
    },
    paths: {
      get: function() {
        var globalDep, globalVars, nodeOnlyDep, _paths, _ref;
        _paths = {};
        _ref = this.bundle.globalDepsVars;
        for (globalDep in _ref) {
          globalVars = _ref[globalDep];
          _paths[globalDep] = "getGlobal_" + globalDep;
        }
        for (nodeOnlyDep in this.bundle.nodeOnlyDepsVars) {
          _paths[nodeOnlyDep] = "getNodeOnly_" + nodeOnlyDep;
        }
        return _paths;
      }
    },
    dependencyFiles: {
      get: function() {
        var globalDep, globalVars, nodeOnlyDep, _dependencyFiles, _ref;
        _dependencyFiles = {};
        _ref = this.bundle.globalDepsVars;
        for (globalDep in _ref) {
          globalVars = _ref[globalDep];
          _dependencyFiles["getGlobal_" + globalDep] = this.grabDependencyVarOrRequireIt(globalDep, globalVars);
        }
        for (nodeOnlyDep in this.bundle.nodeOnlyDepsVars) {
          _dependencyFiles["getNodeOnly_" + nodeOnlyDep] = this.grabDependencyVarOrRequireIt(nodeOnlyDep, []);
        }
        return _dependencyFiles;
      }
    }
  });

  AlmondOptimizationTemplate.prototype.grabDependencyVarOrRequireIt = function(dep, depVars) {
    var depVar;
    return "define(" + this._function(((function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = depVars.length; _i < _len; _i++) {
        depVar = depVars[_i];
        _results.push("if (typeof " + depVar + " !== 'undefined'){return " + depVar + ";}");
      }
      return _results;
    })()).join(';') + ("\nreturn __nodeRequire('" + dep + "');")) + ");";
  };

  return AlmondOptimizationTemplate;

})(Template);
