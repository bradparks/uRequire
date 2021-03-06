// Generated by CoffeeScript 1.6.3
var Module, UError, areEqual, areLike, areRLike, assert, chai, coffee, escodegenOptions, esprima, expect, l, moduleInfo, untrust, _, _B, _ref,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

chai = require("chai");

assert = chai.assert;

expect = chai.expect;

Module = require("../../code/fileResources/Module");

UError = require("../../code/utils/UError");

_ = require('lodash');

_B = require('uberscore');

l = new _B.Logger('spec/fileResources/Module-spec');

_ref = require('../helpers'), areEqual = _ref.areEqual, areLike = _ref.areLike, areRLike = _ref.areRLike, untrust = _ref.untrust;

coffee = require('coffee-script');

esprima = require('esprima');

escodegenOptions = {
  format: {
    indent: {
      style: '',
      base: 0
    },
    json: false,
    renumber: false,
    hexadecimal: false,
    quotes: 'double',
    escapeless: true,
    compact: true,
    parentheses: true,
    semicolons: true
  }
};

moduleInfo = function(js) {
  return (new Module({
    sourceCodeJs: js,
    escodegenOptions: escodegenOptions
  })).extract().info();
};

describe("Module:", function() {
  describe("Static functions :", function() {
    return describe("`isLikeCode` compares code structure:", function() {
      var code1, code2, codes, count, isEqualCode, isLikeCode, _results;
      isLikeCode = Module.isLikeCode, isEqualCode = Module.isEqualCode;
      codes = _B.okv({}, '(function(){}).call()', '(function(someParam, anotherParam){var someVar = 1;}).call(this, that)', '(function(){})()', '(function(param){}())', 'require()', "require('someDep')", 'if (l.deb()){}', "if(l.deb(90)){debug('Hello')}", 'if (l.deb()){} else {}', "if(l.deb(90)){debug('Hello')} else {debug('goodbuy')}", "a = {}", "a = {a:1}");
      count = 0;
      _results = [];
      for (code1 in codes) {
        code2 = codes[code1];
        count++;
        _results.push((function(code1, code2, count) {
          describe("compares two strings of javascript code #" + count + ":", function() {
            return it("is true if 1st is a 'subset' of 2nd, false otherwise #" + count, function() {
              expect(isLikeCode(code1, code2)).to.be["true"];
              expect(isLikeCode(code2, code1)).to.be["false"];
              return expect(isEqualCode(code2, code1)).to.be["false"];
            });
          });
          return describe('accepts one string of code and one AST', function() {
            return it("is true if 1st is a 'subset' of 2nd, false otherwise #" + count, function() {
              expect(isLikeCode(code1, esprima.parse(code2).body[0])).to.be["true"];
              return expect(isLikeCode(esprima.parse(code1).body[0], code2)).to.be["true"];
            });
          });
        })(code1, code2, count));
      }
      return _results;
    });
  });
  describe("Extracting Module information :", function() {
    describe("NON-AMD modules:", function() {
      it("identifies non-AMD/UMD module as nodejs", function() {
        return expect(areRLike(moduleInfo("function dosomething(someVar) {\n  abc(['underscore', 'depdir1/dep1'], function(_, dep1) {\n     dep1 = new dep1();\n     var someVar = require('someDep');\n     return dep1.doit();\n  });\n}"), {
          ext_requireDeps: ['someDep'],
          ext_requireVars: ['someVar'],
          kind: 'nodejs',
          factoryBody: 'function dosomething(someVar){abc(["underscore","depdir1/dep1"],function(_,dep1){dep1=new dep1();var someVar=require("someDep");return dep1.doit();});}'
        })).to.be["true"];
      });
      return it.skip("TODO: should identify a UMD module", function() {
        return expect(moduleInfo("(function (root, factory) {\n    \"use strict\";\n    if (typeof exports === 'object') {\n        var nodeRequire = require('urequire').makeNodeRequire('.', __dirname, '.');\n        module.exports = factory(nodeRequire);\n    } else if (typeof define === 'function' && define.amd) {\n        define(factory);\n    }\n})(this, function (require) {\n  doSomething();\n});")).to.deep.equal({
          kind: 'UMD'
        });
      });
    });
    return describe("AMD modules :", function() {
      describe("AMD define() signature:", function() {
        describe("basic signature cases:", function() {
          it("recognises define() with a single Function expression", function() {
            return expect(moduleInfo('define(function(){return {foo:"bar"};})')).to.deep.equal({
              kind: 'AMD',
              factoryBody: 'return{foo:"bar"};'
            });
          });
          it("recognises define() with a single Function expression & params", function() {
            return expect(moduleInfo('define(function(require, exports, module){return {foo:"bar"};})')).to.deep.equal({
              kind: 'AMD',
              ext_defineFactoryParams: ['require', 'exports', 'module'],
              factoryBody: 'return{foo:"bar"};'
            });
          });
          it("recognises define() with dependency array, Function expression & corresponding params", function() {
            return expect(moduleInfo("define(['underscore', 'depdir1/Dep1'], function(_, Dep1) {\n  dep1 = new Dep1();\n  return dep1.doit();\n});")).to.deep.equal({
              kind: 'AMD',
              ext_defineArrayDeps: ['underscore', 'depdir1/Dep1'],
              ext_defineFactoryParams: ['_', 'Dep1'],
              factoryBody: 'dep1=new Dep1();return dep1.doit();'
            });
          });
          return it("recognises define() with String literal, dependency array and Function expression with corresponding params", function() {
            return expect(moduleInfo("define('mymodule', ['underscore', 'depdir1/Dep1'], function(_, Dep1) {\n  dep1 = new Dep1();\n  return dep1.doit();\n});")).to.deep.equal({
              kind: 'AMD',
              name: 'mymodule',
              ext_defineArrayDeps: ['underscore', 'depdir1/Dep1'],
              ext_defineFactoryParams: ['_', 'Dep1'],
              factoryBody: 'dep1=new Dep1();return dep1.doit();'
            });
          });
        });
        describe("Wrong define() signatures throw error on extract(): ", function() {
          it("throws with a dependency array as only arg", function() {
            return expect(function() {
              return moduleInfo("define(['underscore', 'depdir1/Dep1']);");
            }).to["throw"](UError, /Invalid AMD define*/);
          });
          it("throws with a String as only arg", function() {
            return expect(function() {
              return moduleInfo("define('module');");
            }).to["throw"](UError, /Invalid AMD define*/);
          });
          return it("throws with a String & function ", function() {
            return expect(function() {
              return moduleInfo("define('dep', function(){});");
            }).to["throw"](UError, /Invalid AMD define*/);
          });
        });
        return describe("Deals with more array dependencies or parameters: ", function() {
          it("reads more deps than params", function() {
            return expect(moduleInfo("define('mymodule', ['underscore', 'depdir1/Dep1', 'deps/missingDepVar'], function(_, Dep1) {\n  dep1 = new Dep1();\n  return dep1.doit();\n});")).to.deep.equal({
              kind: 'AMD',
              name: 'mymodule',
              ext_defineArrayDeps: ['underscore', 'depdir1/Dep1', 'deps/missingDepVar'],
              ext_defineFactoryParams: ['_', 'Dep1'],
              factoryBody: 'dep1=new Dep1();return dep1.doit();'
            });
          });
          return it("reads more params than deps", function() {
            return expect(moduleInfo("define('mymodule', ['underscore'], function(_, Dep1, Dep2) {\n  dep1 = new Dep1();\n  return dep1.doit();\n});")).to.deep.equal({
              kind: 'AMD',
              name: 'mymodule',
              ext_defineArrayDeps: ['underscore'],
              ext_defineFactoryParams: ['_', 'Dep1', 'Dep2'],
              factoryBody: 'dep1=new Dep1();return dep1.doit();'
            });
          });
        });
      });
      describe("recognizes coffeescript & family immediate Function Invocation (IFI) : ", function() {
        it("removes IFI & gets generated code as preDefineIFIBody", function() {
          return expect(moduleInfo(coffee.compile("define ['dep1', 'dep2'], (depVar1, depVar2)-> for own p of {} then return {}"))).to.deep.equal({
            kind: 'AMD',
            ext_defineArrayDeps: ['dep1', 'dep2'],
            ext_defineFactoryParams: ['depVar1', 'depVar2'],
            factoryBody: 'var p,_ref;_ref={};for(p in _ref){if(!__hasProp.call(_ref,p))continue;return{};}',
            preDefineIFIBody: 'var __hasProp={}.hasOwnProperty;'
          });
        });
        it("ignore specific code before define (eg amdefine) & extracts `urequire:` flags", function() {
          return expect(moduleInfo(coffee.compile("define = require(\"amdefine\")(module) if typeof define isnt \"function\"\n\nif typeof define isnt \"function\" then define = require(\"amdefine\")(module)\n\nurequire: rootExports: \"myLib\"\n\nonlyThisGoesInto_preDefineIFIBody = true\n\ndefine \"myModule\", [\"underscore\", \"depdir1/dep1\"], (_, dep1) ->\n  dep1 = new dep1()\n  dep1.doit()"))).to.deep.equal({
            ext_defineArrayDeps: ['underscore', 'depdir1/dep1'],
            ext_defineFactoryParams: ['_', 'dep1'],
            flags: {
              rootExports: 'myLib'
            },
            name: 'myModule',
            kind: 'AMD',
            factoryBody: 'dep1=new dep1();return dep1.doit();',
            preDefineIFIBody: 'onlyThisGoesInto_preDefineIFIBody=true;'
          });
        });
        return it("recognises body of commonJs/nodeJs modules & flags, but ommits flags & preDefineIFIBody ", function() {
          return expect(moduleInfo(coffee.compile("\nurequire: {rootExports: \"myLib\", someUknownFlag: \"yeah!\"}\n\n_ = require \"underscore\"\ndep1 = require \"depdir1/dep1\"\n\ndep1 = new dep1()\nmodule.exports = dep1.doit()"))).to.deep.equal({
            ext_requireDeps: ['underscore', 'depdir1/dep1'],
            ext_requireVars: ['_', 'dep1'],
            flags: {
              rootExports: 'myLib',
              someUknownFlag: "yeah!"
            },
            kind: 'nodejs',
            factoryBody: 'var dep1,_;_=require("underscore");dep1=require("depdir1/dep1");dep1=new dep1();module.exports=dep1.doit();'
          });
        });
      });
      describe("trusted and untrusted require('myDep') & require(['myDep'], function(){}) dependencies #1:", function() {
        var js, mod;
        js = "if (typeof define !== 'function') { var define = require('amdefine')(module); };\n\n({urequire: { rootExports: ['myLib', 'myLib2']}});\n\ndefine('myModule', ['require', 'underscore', 'depdir1/dep1'], function(require, _, dep1) {\n  underscore = require('underscore');\n  var i = 1;\n  var someRequire = require('someRequire');\n  if (require === 'require') {\n   for (i=1; i < 100; i++) {\n      require('myOtherRequire');\n   }\n   require('anotherRequire');\n  }\n  console.log(\"main-requiring starting....\");\n  var crap = require(\"crap\" + i); // untrustedRequireDeps\n\n  require(['asyncDep1', 'asyncDep2'], function(asyncDep1, asyncDep2) {\n    if (require('underscore')) {\n        require(['asyncDepOk', 'async' + crap2], function(asyncDepOk, asyncCrap2) {\n          return asyncDepOk + asyncCrap2;\n        });\n    }\n    return asyncDep1 + asyncDep2;\n  });\n\n  return {require: finale = require('finalRequire')};\n});";
        mod = new Module({
          sourceCodeJs: js,
          escodegenOptions: escodegenOptions
        });
        it("should extract, prepare & adjust a module's info", function() {
          var expected;
          mod.extract();
          mod.prepare();
          mod.adjust();
          expected = {
            ext_defineArrayDeps: ['require', 'underscore', 'depdir1/dep1'],
            ext_defineFactoryParams: ['require', '_', 'dep1'],
            ext_requireDeps: untrust([2], ['underscore', 'someRequire', '"crap"+i', 'finalRequire', 'myOtherRequire', 'anotherRequire', 'underscore']),
            ext_requireVars: ['underscore', 'someRequire', 'crap', 'finale'],
            ext_asyncRequireDeps: untrust([3], ['asyncDep1', 'asyncDep2', 'asyncDepOk', '"async"+crap2']),
            ext_asyncFactoryParams: ['asyncDep1', 'asyncDep2', 'asyncDepOk', 'asyncCrap2'],
            flags: {
              rootExports: ['myLib', 'myLib2']
            },
            name: 'myModule',
            kind: 'AMD',
            factoryBody: 'underscore=require("underscore");var i=1;var someRequire=require("someRequire");if(require==="require"){for(i=1;i<100;i++){require("myOtherRequire");}require("anotherRequire");}console.log("main-requiring starting....");var crap=require("crap"+i);require(["asyncDep1","asyncDep2"],function(asyncDep1,asyncDep2){if(require("underscore")){require(["asyncDepOk","async"+crap2],function(asyncDepOk,asyncCrap2){return asyncDepOk+asyncCrap2;});}return asyncDep1+asyncDep2;});return{require:finale=require("finalRequire")};',
            defineArrayDeps: untrust([3], ['underscore', 'depdir1/dep1', 'someRequire', '"crap"+i', 'finalRequire', 'myOtherRequire', 'anotherRequire']),
            nodeDeps: ['underscore', 'depdir1/dep1'],
            parameters: ['_', 'dep1']
          };
          return expect(areEqual(mod.info(), expected)).to.be["true"];
        });
        return it("should retrieve module's deps & corresponding vars/params via getDepsVars()", function() {
          return expect(areEqual(mod.getDepsVars(), {
            underscore: ['_', 'underscore'],
            'depdir1/dep1': ['dep1'],
            finalRequire: ['finale'],
            someRequire: ['someRequire'],
            myOtherRequire: [],
            anotherRequire: [],
            asyncDep1: ['asyncDep1'],
            asyncDep2: ['asyncDep2'],
            asyncDepOk: ['asyncDepOk'],
            '"async"+crap2': ['asyncCrap2'],
            '"crap"+i': ['crap']
          })).to.be["true"];
        });
      });
      return describe("trusted and untrusted require('myDep') & require(['myDep'], function(){}) dependencies #2:", function() {
        var expected, js, mod;
        js = "(function(){" + "var a = 'alpha' + (function(){return 'A'})();\nvar b = 'beta';\n\n({urequire: {rootExports: ['myMod', 'myModOtherExport'], noConflict: true} });\n\ndefine('modName',\n  ['arrayDep1', 'arrayDepUntrusted'+crap, 'arrayDep2', 'arrayDepWithoutParam', 'untrustedArrayDepWithoutParam'+crap],\n  function(arrayDepVar1, arrayVarUntrusted, arrayDepVar2){\n\n    // initialized/assigned to a variable\n    var depVar3 = require('dep3');\n\n    // cant infer require depVar\n    var anArray = []\n    anArray[0] = require('depAssignedToMemberExpression');\n\n    // untrusted & not assigned to a require depVar\n    require('untrustedRequireDep'+crap);\n\n    // assigned to a variable\n    var depVar4;\n    depVar4 = require('dep4');\n\n    // not assigned to a require depVar\n    if (true) {\n      require('depUnassingedToVar');\n    }\n\n    // outer is untrusted, inner is assigned to var\n    require(dep9 = require('dep9'))\n\n    require(['asyncArrayDep1', 'asyncArrayUntrusted' + crap, 'asyncArrayDep2'],\n              function(asyncArrayVar1, asyncArrayUntrustedVar, asyncArrayVar2){\n                return asyncArrayVar1 + asyncArrayVar2\n              }\n    );\n\n    return {the: 'module'}\n  }\n);" + "})();";
        mod = new Module({
          sourceCodeJs: js,
          escodegenOptions: escodegenOptions
        });
        expected = {
          ext_defineArrayDeps: untrust([1, 4], ['arrayDep1', '"arrayDepUntrusted"+crap', 'arrayDep2', 'arrayDepWithoutParam', '"untrustedArrayDepWithoutParam"+crap']),
          ext_defineFactoryParams: ['arrayDepVar1', 'arrayVarUntrusted', 'arrayDepVar2'],
          ext_requireDeps: untrust([4, 6], ['dep3', 'dep4', 'dep9', 'depAssignedToMemberExpression', '"untrustedRequireDep"+crap', 'depUnassingedToVar', 'dep9=require("dep9")']),
          ext_requireVars: ['depVar3', 'depVar4', 'dep9'],
          ext_asyncRequireDeps: untrust([1], ['asyncArrayDep1', '"asyncArrayUntrusted"+crap', 'asyncArrayDep2']),
          ext_asyncFactoryParams: ['asyncArrayVar1', 'asyncArrayUntrustedVar', 'asyncArrayVar2'],
          flags: {
            rootExports: ['myMod', 'myModOtherExport'],
            noConflict: true
          },
          name: 'modName',
          kind: 'AMD',
          factoryBody: 'var depVar3=require("dep3");var anArray=[];anArray[0]=require("depAssignedToMemberExpression");require("untrustedRequireDep"+crap);var depVar4;depVar4=require("dep4");if(true){require("depUnassingedToVar");}require(dep9=require("dep9"));require(["asyncArrayDep1","asyncArrayUntrusted"+crap,"asyncArrayDep2"],function(asyncArrayVar1,asyncArrayUntrustedVar,asyncArrayVar2){return asyncArrayVar1+asyncArrayVar2;});return{the:"module"};',
          preDefineIFIBody: 'var a="alpha"+function(){return"A";}();var b="beta";',
          parameters: ['arrayDepVar1', 'arrayVarUntrusted', 'arrayDepVar2'],
          defineArrayDeps: untrust([1, 4, 9, 11], ['arrayDep1', '"arrayDepUntrusted"+crap', 'arrayDep2', 'arrayDepWithoutParam', '"untrustedArrayDepWithoutParam"+crap', 'dep3', 'dep4', 'dep9', 'depAssignedToMemberExpression', '"untrustedRequireDep"+crap', 'depUnassingedToVar', 'dep9=require("dep9")']),
          nodeDeps: untrust([1, 4], ['arrayDep1', '"arrayDepUntrusted"+crap', 'arrayDep2', 'arrayDepWithoutParam', '"untrustedArrayDepWithoutParam"+crap'])
        };
        it("should extract all deps, even untrusted and mark them so", function() {
          mod.extract();
          mod.prepare();
          mod.adjust();
          return expect(areEqual(mod.info(), expected)).to.be["true"];
        });
        it("should re-extract, deleting adjusted/resolved info", function() {
          var exp, modInfo, rd, _i, _len, _ref1;
          modInfo = mod.extract().info();
          _ref1 = mod.keys_resolvedDependencies;
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            rd = _ref1[_i];
            expect(modInfo[rd]).to.be.undefined;
          }
          expect(modInfo.parameters).to.be.undefined;
          exp = _.omit(expected, function(v, k) {
            return (k === 'parameters') || (__indexOf.call(mod.keys_resolvedDependencies, k) >= 0);
          });
          return expect(areEqual(modInfo, exp)).to.be["true"];
        });
        it("should re-adjust with the exact results:", function() {
          mod.prepare();
          mod.adjust();
          return expect(areEqual(mod.info(), expected)).to.be["true"];
        });
        return it("should retrieve module's deps & corresponding vars/params via getDepsVars()", function() {
          return expect(mod.getDepsVars()).to.deep.equal({
            arrayDep1: ['arrayDepVar1'],
            '"arrayDepUntrusted"+crap': ['arrayVarUntrusted'],
            arrayDep2: ['arrayDepVar2'],
            arrayDepWithoutParam: [],
            '"untrustedArrayDepWithoutParam"+crap': [],
            dep9: ['dep9'],
            dep4: ['depVar4'],
            dep3: ['depVar3'],
            depAssignedToMemberExpression: [],
            depUnassingedToVar: [],
            asyncArrayDep1: ['asyncArrayVar1'],
            '"asyncArrayUntrusted"+crap': ['asyncArrayUntrustedVar'],
            asyncArrayDep2: ['asyncArrayVar2'],
            '"untrustedRequireDep"+crap': [],
            'dep9=require("dep9")': []
          });
        });
      });
    });
  });
  describe("Replacing & injecting adjusted dependencies:", function() {
    var expected, js, mod;
    js = "define(['require', 'underscore', 'depDir1/Dep1', '../depDir1/uselessDep', 'someDir/someDep', 'depDir1/removedDep'],\n  function(require, _, Dep1) {\n    dep2 = require('depDir2/Dep2');\n    aGlobal = require('aGlobal');\n    return dep1.doit();\n  }\n);";
    mod = (new Module({
      sourceCodeJs: js,
      escodegenOptions: escodegenOptions,
      srcFilename: 'someDepDir/MyModule',
      bundle: {
        dstFilenames: ['depDir1/Dep1.js', 'depDir2/Dep2.js', 'depDir1/uselessDep.js', 'aNewDepInTown.js']
      }
    })).extract().prepare().adjust();
    mod.replaceDep('underscore', 'lodash');
    mod.replaceDep('aGlobal', 'smallVillage');
    mod.replaceDep('depDir2/Dep2', '../aNewDepInTown');
    mod.replaceDep('depDir1/uselessDep');
    mod.replaceDep('../depDir1/removedDep');
    mod.injectDeps({
      'myInjectedDep': ['myInjectedDepVar1', 'myInjectedDepVar2']
    });
    mod.injectDeps({
      'anotherInjectedDep': 'anotherInjectedVar'
    });
    mod.replaceDep('myInjectedDep', '../myProperInjectedDep');
    expected = {
      ext_defineArrayDeps: ['require', 'underscore', 'depDir1/Dep1', '../depDir1/uselessDep', 'someDir/someDep', 'depDir1/removedDep'],
      ext_defineFactoryParams: ['require', '_', 'Dep1'],
      ext_requireDeps: ['depDir2/Dep2', 'aGlobal'],
      ext_requireVars: ['dep2', 'aGlobal'],
      kind: 'AMD',
      path: 'someDepDir/MyModule',
      factoryBody: 'dep2=require("../aNewDepInTown");aGlobal=require("smallVillage");return dep1.doit();',
      parameters: ['_', 'Dep1', 'myInjectedDepVar1', 'myInjectedDepVar2', 'anotherInjectedVar'],
      defineArrayDeps: ['lodash', '../depDir1/Dep1', '../myProperInjectedDep', '../myProperInjectedDep', 'anotherInjectedDep', 'someDir/someDep', '../aNewDepInTown', 'smallVillage'],
      nodeDeps: ['lodash', '../depDir1/Dep1', '../myProperInjectedDep', '../myProperInjectedDep', 'anotherInjectedDep', 'someDir/someDep']
    };
    return it("has the correct injected & replaced deps", function() {
      return expect(areEqual(mod.info(), expected)).to.be["true"];
    });
  });
  return describe("Replacing & deleting code:", function() {
    var js, mod;
    js = "var b = 0;\nif (l.deb(10)) {\n  b = 1;\n  if (l.deb(20) && true) {\n    b = 2;\n    if (l.deb(30)) {\n      b = 3;\n    }\n  }\n}\nif (l.deb(40)) {\n  b = 4;\n}\nc = 3;";
    mod = (new Module({
      sourceCodeJs: js,
      escodegenOptions: escodegenOptions
    })).extract();
    it("replaces code via function, returning ast or String", function() {
      var cnt;
      cnt = 1;
      mod.replaceCode('if (l.deb()){}', function(ast) {
        ast.test["arguments"][0].value++;
        if (cnt++ % 2 === 0) {
          return ast;
        } else {
          return mod.toCode(ast);
        }
      });
      return expect(Module.isEqualCode("if (true){" + mod.toCode(mod.AST_top) + "}", "if (true){\n  var b = 0;\n  if (l.deb(11)) {\n    b = 1;\n    if (l.deb(20) && true) {\n      b = 2;\n      if (l.deb(31)) {\n        b = 3;\n      }\n    }\n  }\n  if (l.deb(41)) {\n    b = 4;\n  }\n  c = 3;\n}")).to.be["true"];
    });
    it("replaces code via String", function() {
      mod.replaceCode('if (l.deb(31)){}', "if (l.deb(31)) { changed = 56; }");
      return expect(Module.isEqualCode("if (true){" + mod.toCode(mod.AST_top) + "}", "if (true){\n  var b = 0;\n  if (l.deb(11)) {\n    b = 1;\n    if (l.deb(20) && true) {\n      b = 2;\n      if (l.deb(31)) {\n        changed = 56;\n      }\n    }\n  }\n  if (l.deb(41)) {\n    b = 4;\n  }\n  c = 3;\n}")).to.be["true"];
    });
    return it("deletes code if 2nd argument == null, traversing only outers", function() {
      var cnt;
      cnt = 0;
      mod.replaceCode('if (l.deb()){}', function() {
        cnt++;
        return null;
      });
      expect(mod.toCode(mod.AST_top)).to.be.equal("var b=0;c=3;");
      return expect(cnt).to.equal(2);
    });
  });
});
