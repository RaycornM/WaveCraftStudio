var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/react/cjs/react.development.js
var require_react_development = __commonJS({
  "node_modules/react/cjs/react.development.js"(exports, module) {
    "use strict";
    (function() {
      function defineDeprecationWarning(methodName, info) {
        Object.defineProperty(Component.prototype, methodName, {
          get: function() {
            console.warn(
              "%s(...) is deprecated in plain JavaScript React classes. %s",
              info[0],
              info[1]
            );
          }
        });
      }
      function getIteratorFn(maybeIterable) {
        if (null === maybeIterable || "object" !== typeof maybeIterable)
          return null;
        maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
        return "function" === typeof maybeIterable ? maybeIterable : null;
      }
      function warnNoop(publicInstance, callerName) {
        publicInstance = (publicInstance = publicInstance.constructor) && (publicInstance.displayName || publicInstance.name) || "ReactClass";
        var warningKey = publicInstance + "." + callerName;
        didWarnStateUpdateForUnmountedComponent[warningKey] || (console.error(
          "Can't call %s on a component that is not yet mounted. This is a no-op, but it might indicate a bug in your application. Instead, assign to `this.state` directly or define a `state = {};` class property with the desired state in the %s component.",
          callerName,
          publicInstance
        ), didWarnStateUpdateForUnmountedComponent[warningKey] = true);
      }
      function Component(props, context, updater) {
        this.props = props;
        this.context = context;
        this.refs = emptyObject;
        this.updater = updater || ReactNoopUpdateQueue;
      }
      function ComponentDummy() {
      }
      function PureComponent(props, context, updater) {
        this.props = props;
        this.context = context;
        this.refs = emptyObject;
        this.updater = updater || ReactNoopUpdateQueue;
      }
      function noop() {
      }
      function testStringCoercion(value) {
        return "" + value;
      }
      function checkKeyStringCoercion(value) {
        try {
          testStringCoercion(value);
          var JSCompiler_inline_result = false;
        } catch (e) {
          JSCompiler_inline_result = true;
        }
        if (JSCompiler_inline_result) {
          JSCompiler_inline_result = console;
          var JSCompiler_temp_const = JSCompiler_inline_result.error;
          var JSCompiler_inline_result$jscomp$0 = "function" === typeof Symbol && Symbol.toStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
          JSCompiler_temp_const.call(
            JSCompiler_inline_result,
            "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",
            JSCompiler_inline_result$jscomp$0
          );
          return testStringCoercion(value);
        }
      }
      function getComponentNameFromType(type) {
        if (null == type) return null;
        if ("function" === typeof type)
          return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
        if ("string" === typeof type) return type;
        switch (type) {
          case REACT_FRAGMENT_TYPE:
            return "Fragment";
          case REACT_PROFILER_TYPE:
            return "Profiler";
          case REACT_STRICT_MODE_TYPE:
            return "StrictMode";
          case REACT_SUSPENSE_TYPE:
            return "Suspense";
          case REACT_SUSPENSE_LIST_TYPE:
            return "SuspenseList";
          case REACT_ACTIVITY_TYPE:
            return "Activity";
        }
        if ("object" === typeof type)
          switch ("number" === typeof type.tag && console.error(
            "Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."
          ), type.$$typeof) {
            case REACT_PORTAL_TYPE:
              return "Portal";
            case REACT_CONTEXT_TYPE:
              return type.displayName || "Context";
            case REACT_CONSUMER_TYPE:
              return (type._context.displayName || "Context") + ".Consumer";
            case REACT_FORWARD_REF_TYPE:
              var innerType = type.render;
              type = type.displayName;
              type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
              return type;
            case REACT_MEMO_TYPE:
              return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
            case REACT_LAZY_TYPE:
              innerType = type._payload;
              type = type._init;
              try {
                return getComponentNameFromType(type(innerType));
              } catch (x) {
              }
          }
        return null;
      }
      function getTaskName(type) {
        if (type === REACT_FRAGMENT_TYPE) return "<>";
        if ("object" === typeof type && null !== type && type.$$typeof === REACT_LAZY_TYPE)
          return "<...>";
        try {
          var name = getComponentNameFromType(type);
          return name ? "<" + name + ">" : "<...>";
        } catch (x) {
          return "<...>";
        }
      }
      function getOwner() {
        var dispatcher = ReactSharedInternals.A;
        return null === dispatcher ? null : dispatcher.getOwner();
      }
      function UnknownOwner() {
        return Error("react-stack-top-frame");
      }
      function hasValidKey(config) {
        if (hasOwnProperty.call(config, "key")) {
          var getter = Object.getOwnPropertyDescriptor(config, "key").get;
          if (getter && getter.isReactWarning) return false;
        }
        return void 0 !== config.key;
      }
      function defineKeyPropWarningGetter(props, displayName) {
        function warnAboutAccessingKey() {
          specialPropKeyWarningShown || (specialPropKeyWarningShown = true, console.error(
            "%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)",
            displayName
          ));
        }
        warnAboutAccessingKey.isReactWarning = true;
        Object.defineProperty(props, "key", {
          get: warnAboutAccessingKey,
          configurable: true
        });
      }
      function elementRefGetterWithDeprecationWarning() {
        var componentName = getComponentNameFromType(this.type);
        didWarnAboutElementRef[componentName] || (didWarnAboutElementRef[componentName] = true, console.error(
          "Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."
        ));
        componentName = this.props.ref;
        return void 0 !== componentName ? componentName : null;
      }
      function ReactElement(type, key, props, owner, debugStack, debugTask) {
        var refProp = props.ref;
        type = {
          $$typeof: REACT_ELEMENT_TYPE,
          type,
          key,
          props,
          _owner: owner
        };
        null !== (void 0 !== refProp ? refProp : null) ? Object.defineProperty(type, "ref", {
          enumerable: false,
          get: elementRefGetterWithDeprecationWarning
        }) : Object.defineProperty(type, "ref", { enumerable: false, value: null });
        type._store = {};
        Object.defineProperty(type._store, "validated", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: 0
        });
        Object.defineProperty(type, "_debugInfo", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: null
        });
        Object.defineProperty(type, "_debugStack", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: debugStack
        });
        Object.defineProperty(type, "_debugTask", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: debugTask
        });
        Object.freeze && (Object.freeze(type.props), Object.freeze(type));
        return type;
      }
      function cloneAndReplaceKey(oldElement, newKey) {
        newKey = ReactElement(
          oldElement.type,
          newKey,
          oldElement.props,
          oldElement._owner,
          oldElement._debugStack,
          oldElement._debugTask
        );
        oldElement._store && (newKey._store.validated = oldElement._store.validated);
        return newKey;
      }
      function validateChildKeys(node) {
        isValidElement(node) ? node._store && (node._store.validated = 1) : "object" === typeof node && null !== node && node.$$typeof === REACT_LAZY_TYPE && ("fulfilled" === node._payload.status ? isValidElement(node._payload.value) && node._payload.value._store && (node._payload.value._store.validated = 1) : node._store && (node._store.validated = 1));
      }
      function isValidElement(object) {
        return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
      }
      function escape(key) {
        var escaperLookup = { "=": "=0", ":": "=2" };
        return "$" + key.replace(/[=:]/g, function(match) {
          return escaperLookup[match];
        });
      }
      function getElementKey(element, index) {
        return "object" === typeof element && null !== element && null != element.key ? (checkKeyStringCoercion(element.key), escape("" + element.key)) : index.toString(36);
      }
      function resolveThenable(thenable) {
        switch (thenable.status) {
          case "fulfilled":
            return thenable.value;
          case "rejected":
            throw thenable.reason;
          default:
            switch ("string" === typeof thenable.status ? thenable.then(noop, noop) : (thenable.status = "pending", thenable.then(
              function(fulfilledValue) {
                "pending" === thenable.status && (thenable.status = "fulfilled", thenable.value = fulfilledValue);
              },
              function(error) {
                "pending" === thenable.status && (thenable.status = "rejected", thenable.reason = error);
              }
            )), thenable.status) {
              case "fulfilled":
                return thenable.value;
              case "rejected":
                throw thenable.reason;
            }
        }
        throw thenable;
      }
      function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
        var type = typeof children;
        if ("undefined" === type || "boolean" === type) children = null;
        var invokeCallback = false;
        if (null === children) invokeCallback = true;
        else
          switch (type) {
            case "bigint":
            case "string":
            case "number":
              invokeCallback = true;
              break;
            case "object":
              switch (children.$$typeof) {
                case REACT_ELEMENT_TYPE:
                case REACT_PORTAL_TYPE:
                  invokeCallback = true;
                  break;
                case REACT_LAZY_TYPE:
                  return invokeCallback = children._init, mapIntoArray(
                    invokeCallback(children._payload),
                    array,
                    escapedPrefix,
                    nameSoFar,
                    callback
                  );
              }
          }
        if (invokeCallback) {
          invokeCallback = children;
          callback = callback(invokeCallback);
          var childKey = "" === nameSoFar ? "." + getElementKey(invokeCallback, 0) : nameSoFar;
          isArrayImpl(callback) ? (escapedPrefix = "", null != childKey && (escapedPrefix = childKey.replace(userProvidedKeyEscapeRegex, "$&/") + "/"), mapIntoArray(callback, array, escapedPrefix, "", function(c) {
            return c;
          })) : null != callback && (isValidElement(callback) && (null != callback.key && (invokeCallback && invokeCallback.key === callback.key || checkKeyStringCoercion(callback.key)), escapedPrefix = cloneAndReplaceKey(
            callback,
            escapedPrefix + (null == callback.key || invokeCallback && invokeCallback.key === callback.key ? "" : ("" + callback.key).replace(
              userProvidedKeyEscapeRegex,
              "$&/"
            ) + "/") + childKey
          ), "" !== nameSoFar && null != invokeCallback && isValidElement(invokeCallback) && null == invokeCallback.key && invokeCallback._store && !invokeCallback._store.validated && (escapedPrefix._store.validated = 2), callback = escapedPrefix), array.push(callback));
          return 1;
        }
        invokeCallback = 0;
        childKey = "" === nameSoFar ? "." : nameSoFar + ":";
        if (isArrayImpl(children))
          for (var i = 0; i < children.length; i++)
            nameSoFar = children[i], type = childKey + getElementKey(nameSoFar, i), invokeCallback += mapIntoArray(
              nameSoFar,
              array,
              escapedPrefix,
              type,
              callback
            );
        else if (i = getIteratorFn(children), "function" === typeof i)
          for (i === children.entries && (didWarnAboutMaps || console.warn(
            "Using Maps as children is not supported. Use an array of keyed ReactElements instead."
          ), didWarnAboutMaps = true), children = i.call(children), i = 0; !(nameSoFar = children.next()).done; )
            nameSoFar = nameSoFar.value, type = childKey + getElementKey(nameSoFar, i++), invokeCallback += mapIntoArray(
              nameSoFar,
              array,
              escapedPrefix,
              type,
              callback
            );
        else if ("object" === type) {
          if ("function" === typeof children.then)
            return mapIntoArray(
              resolveThenable(children),
              array,
              escapedPrefix,
              nameSoFar,
              callback
            );
          array = String(children);
          throw Error(
            "Objects are not valid as a React child (found: " + ("[object Object]" === array ? "object with keys {" + Object.keys(children).join(", ") + "}" : array) + "). If you meant to render a collection of children, use an array instead."
          );
        }
        return invokeCallback;
      }
      function mapChildren(children, func, context) {
        if (null == children) return children;
        var result = [], count = 0;
        mapIntoArray(children, result, "", "", function(child) {
          return func.call(context, child, count++);
        });
        return result;
      }
      function lazyInitializer(payload) {
        if (-1 === payload._status) {
          var ioInfo = payload._ioInfo;
          null != ioInfo && (ioInfo.start = ioInfo.end = performance.now());
          ioInfo = payload._result;
          var thenable = ioInfo();
          thenable.then(
            function(moduleObject) {
              if (0 === payload._status || -1 === payload._status) {
                payload._status = 1;
                payload._result = moduleObject;
                var _ioInfo = payload._ioInfo;
                null != _ioInfo && (_ioInfo.end = performance.now());
                void 0 === thenable.status && (thenable.status = "fulfilled", thenable.value = moduleObject);
              }
            },
            function(error) {
              if (0 === payload._status || -1 === payload._status) {
                payload._status = 2;
                payload._result = error;
                var _ioInfo2 = payload._ioInfo;
                null != _ioInfo2 && (_ioInfo2.end = performance.now());
                void 0 === thenable.status && (thenable.status = "rejected", thenable.reason = error);
              }
            }
          );
          ioInfo = payload._ioInfo;
          if (null != ioInfo) {
            ioInfo.value = thenable;
            var displayName = thenable.displayName;
            "string" === typeof displayName && (ioInfo.name = displayName);
          }
          -1 === payload._status && (payload._status = 0, payload._result = thenable);
        }
        if (1 === payload._status)
          return ioInfo = payload._result, void 0 === ioInfo && console.error(
            "lazy: Expected the result of a dynamic import() call. Instead received: %s\n\nYour code should look like: \n  const MyComponent = lazy(() => import('./MyComponent'))\n\nDid you accidentally put curly braces around the import?",
            ioInfo
          ), "default" in ioInfo || console.error(
            "lazy: Expected the result of a dynamic import() call. Instead received: %s\n\nYour code should look like: \n  const MyComponent = lazy(() => import('./MyComponent'))",
            ioInfo
          ), ioInfo.default;
        throw payload._result;
      }
      function resolveDispatcher() {
        var dispatcher = ReactSharedInternals.H;
        null === dispatcher && console.error(
          "Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem."
        );
        return dispatcher;
      }
      function releaseAsyncTransition() {
        ReactSharedInternals.asyncTransitions--;
      }
      function enqueueTask(task) {
        if (null === enqueueTaskImpl)
          try {
            var requireString = ("require" + Math.random()).slice(0, 7);
            enqueueTaskImpl = (module && module[requireString]).call(
              module,
              "timers"
            ).setImmediate;
          } catch (_err) {
            enqueueTaskImpl = function(callback) {
              false === didWarnAboutMessageChannel && (didWarnAboutMessageChannel = true, "undefined" === typeof MessageChannel && console.error(
                "This browser does not have a MessageChannel implementation, so enqueuing tasks via await act(async () => ...) will fail. Please file an issue at https://github.com/facebook/react/issues if you encounter this warning."
              ));
              var channel = new MessageChannel();
              channel.port1.onmessage = callback;
              channel.port2.postMessage(void 0);
            };
          }
        return enqueueTaskImpl(task);
      }
      function aggregateErrors(errors) {
        return 1 < errors.length && "function" === typeof AggregateError ? new AggregateError(errors) : errors[0];
      }
      function popActScope(prevActQueue, prevActScopeDepth) {
        prevActScopeDepth !== actScopeDepth - 1 && console.error(
          "You seem to have overlapping act() calls, this is not supported. Be sure to await previous act() calls before making a new one. "
        );
        actScopeDepth = prevActScopeDepth;
      }
      function recursivelyFlushAsyncActWork(returnValue, resolve, reject) {
        var queue = ReactSharedInternals.actQueue;
        if (null !== queue)
          if (0 !== queue.length)
            try {
              flushActQueue(queue);
              enqueueTask(function() {
                return recursivelyFlushAsyncActWork(returnValue, resolve, reject);
              });
              return;
            } catch (error) {
              ReactSharedInternals.thrownErrors.push(error);
            }
          else ReactSharedInternals.actQueue = null;
        0 < ReactSharedInternals.thrownErrors.length ? (queue = aggregateErrors(ReactSharedInternals.thrownErrors), ReactSharedInternals.thrownErrors.length = 0, reject(queue)) : resolve(returnValue);
      }
      function flushActQueue(queue) {
        if (!isFlushing) {
          isFlushing = true;
          var i = 0;
          try {
            for (; i < queue.length; i++) {
              var callback = queue[i];
              do {
                ReactSharedInternals.didUsePromise = false;
                var continuation = callback(false);
                if (null !== continuation) {
                  if (ReactSharedInternals.didUsePromise) {
                    queue[i] = callback;
                    queue.splice(0, i);
                    return;
                  }
                  callback = continuation;
                } else break;
              } while (1);
            }
            queue.length = 0;
          } catch (error) {
            queue.splice(0, i + 1), ReactSharedInternals.thrownErrors.push(error);
          } finally {
            isFlushing = false;
          }
        }
      }
      "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
      var REACT_ELEMENT_TYPE = /* @__PURE__ */ Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = /* @__PURE__ */ Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = /* @__PURE__ */ Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = /* @__PURE__ */ Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = /* @__PURE__ */ Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = /* @__PURE__ */ Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = /* @__PURE__ */ Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = /* @__PURE__ */ Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = /* @__PURE__ */ Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = /* @__PURE__ */ Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = /* @__PURE__ */ Symbol.for("react.memo"), REACT_LAZY_TYPE = /* @__PURE__ */ Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = /* @__PURE__ */ Symbol.for("react.activity"), MAYBE_ITERATOR_SYMBOL = Symbol.iterator, didWarnStateUpdateForUnmountedComponent = {}, ReactNoopUpdateQueue = {
        isMounted: function() {
          return false;
        },
        enqueueForceUpdate: function(publicInstance) {
          warnNoop(publicInstance, "forceUpdate");
        },
        enqueueReplaceState: function(publicInstance) {
          warnNoop(publicInstance, "replaceState");
        },
        enqueueSetState: function(publicInstance) {
          warnNoop(publicInstance, "setState");
        }
      }, assign = Object.assign, emptyObject = {};
      Object.freeze(emptyObject);
      Component.prototype.isReactComponent = {};
      Component.prototype.setState = function(partialState, callback) {
        if ("object" !== typeof partialState && "function" !== typeof partialState && null != partialState)
          throw Error(
            "takes an object of state variables to update or a function which returns an object of state variables."
          );
        this.updater.enqueueSetState(this, partialState, callback, "setState");
      };
      Component.prototype.forceUpdate = function(callback) {
        this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
      };
      var deprecatedAPIs = {
        isMounted: [
          "isMounted",
          "Instead, make sure to clean up subscriptions and pending requests in componentWillUnmount to prevent memory leaks."
        ],
        replaceState: [
          "replaceState",
          "Refactor your code to use setState instead (see https://github.com/facebook/react/issues/3236)."
        ]
      };
      for (fnName in deprecatedAPIs)
        deprecatedAPIs.hasOwnProperty(fnName) && defineDeprecationWarning(fnName, deprecatedAPIs[fnName]);
      ComponentDummy.prototype = Component.prototype;
      deprecatedAPIs = PureComponent.prototype = new ComponentDummy();
      deprecatedAPIs.constructor = PureComponent;
      assign(deprecatedAPIs, Component.prototype);
      deprecatedAPIs.isPureReactComponent = true;
      var isArrayImpl = Array.isArray, REACT_CLIENT_REFERENCE = /* @__PURE__ */ Symbol.for("react.client.reference"), ReactSharedInternals = {
        H: null,
        A: null,
        T: null,
        S: null,
        actQueue: null,
        asyncTransitions: 0,
        isBatchingLegacy: false,
        didScheduleLegacyUpdate: false,
        didUsePromise: false,
        thrownErrors: [],
        getCurrentStack: null,
        recentlyCreatedOwnerStacks: 0
      }, hasOwnProperty = Object.prototype.hasOwnProperty, createTask = console.createTask ? console.createTask : function() {
        return null;
      };
      deprecatedAPIs = {
        react_stack_bottom_frame: function(callStackForError) {
          return callStackForError();
        }
      };
      var specialPropKeyWarningShown, didWarnAboutOldJSXRuntime;
      var didWarnAboutElementRef = {};
      var unknownOwnerDebugStack = deprecatedAPIs.react_stack_bottom_frame.bind(
        deprecatedAPIs,
        UnknownOwner
      )();
      var unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));
      var didWarnAboutMaps = false, userProvidedKeyEscapeRegex = /\/+/g, reportGlobalError = "function" === typeof reportError ? reportError : function(error) {
        if ("object" === typeof window && "function" === typeof window.ErrorEvent) {
          var event = new window.ErrorEvent("error", {
            bubbles: true,
            cancelable: true,
            message: "object" === typeof error && null !== error && "string" === typeof error.message ? String(error.message) : String(error),
            error
          });
          if (!window.dispatchEvent(event)) return;
        } else if ("object" === typeof process && "function" === typeof process.emit) {
          process.emit("uncaughtException", error);
          return;
        }
        console.error(error);
      }, didWarnAboutMessageChannel = false, enqueueTaskImpl = null, actScopeDepth = 0, didWarnNoAwaitAct = false, isFlushing = false, queueSeveralMicrotasks = "function" === typeof queueMicrotask ? function(callback) {
        queueMicrotask(function() {
          return queueMicrotask(callback);
        });
      } : enqueueTask;
      deprecatedAPIs = Object.freeze({
        __proto__: null,
        c: function(size) {
          return resolveDispatcher().useMemoCache(size);
        }
      });
      var fnName = {
        map: mapChildren,
        forEach: function(children, forEachFunc, forEachContext) {
          mapChildren(
            children,
            function() {
              forEachFunc.apply(this, arguments);
            },
            forEachContext
          );
        },
        count: function(children) {
          var n = 0;
          mapChildren(children, function() {
            n++;
          });
          return n;
        },
        toArray: function(children) {
          return mapChildren(children, function(child) {
            return child;
          }) || [];
        },
        only: function(children) {
          if (!isValidElement(children))
            throw Error(
              "React.Children.only expected to receive a single React element child."
            );
          return children;
        }
      };
      exports.Activity = REACT_ACTIVITY_TYPE;
      exports.Children = fnName;
      exports.Component = Component;
      exports.Fragment = REACT_FRAGMENT_TYPE;
      exports.Profiler = REACT_PROFILER_TYPE;
      exports.PureComponent = PureComponent;
      exports.StrictMode = REACT_STRICT_MODE_TYPE;
      exports.Suspense = REACT_SUSPENSE_TYPE;
      exports.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = ReactSharedInternals;
      exports.__COMPILER_RUNTIME = deprecatedAPIs;
      exports.act = function(callback) {
        var prevActQueue = ReactSharedInternals.actQueue, prevActScopeDepth = actScopeDepth;
        actScopeDepth++;
        var queue = ReactSharedInternals.actQueue = null !== prevActQueue ? prevActQueue : [], didAwaitActCall = false;
        try {
          var result = callback();
        } catch (error) {
          ReactSharedInternals.thrownErrors.push(error);
        }
        if (0 < ReactSharedInternals.thrownErrors.length)
          throw popActScope(prevActQueue, prevActScopeDepth), callback = aggregateErrors(ReactSharedInternals.thrownErrors), ReactSharedInternals.thrownErrors.length = 0, callback;
        if (null !== result && "object" === typeof result && "function" === typeof result.then) {
          var thenable = result;
          queueSeveralMicrotasks(function() {
            didAwaitActCall || didWarnNoAwaitAct || (didWarnNoAwaitAct = true, console.error(
              "You called act(async () => ...) without await. This could lead to unexpected testing behaviour, interleaving multiple act calls and mixing their scopes. You should - await act(async () => ...);"
            ));
          });
          return {
            then: function(resolve, reject) {
              didAwaitActCall = true;
              thenable.then(
                function(returnValue) {
                  popActScope(prevActQueue, prevActScopeDepth);
                  if (0 === prevActScopeDepth) {
                    try {
                      flushActQueue(queue), enqueueTask(function() {
                        return recursivelyFlushAsyncActWork(
                          returnValue,
                          resolve,
                          reject
                        );
                      });
                    } catch (error$0) {
                      ReactSharedInternals.thrownErrors.push(error$0);
                    }
                    if (0 < ReactSharedInternals.thrownErrors.length) {
                      var _thrownError = aggregateErrors(
                        ReactSharedInternals.thrownErrors
                      );
                      ReactSharedInternals.thrownErrors.length = 0;
                      reject(_thrownError);
                    }
                  } else resolve(returnValue);
                },
                function(error) {
                  popActScope(prevActQueue, prevActScopeDepth);
                  0 < ReactSharedInternals.thrownErrors.length ? (error = aggregateErrors(
                    ReactSharedInternals.thrownErrors
                  ), ReactSharedInternals.thrownErrors.length = 0, reject(error)) : reject(error);
                }
              );
            }
          };
        }
        var returnValue$jscomp$0 = result;
        popActScope(prevActQueue, prevActScopeDepth);
        0 === prevActScopeDepth && (flushActQueue(queue), 0 !== queue.length && queueSeveralMicrotasks(function() {
          didAwaitActCall || didWarnNoAwaitAct || (didWarnNoAwaitAct = true, console.error(
            "A component suspended inside an `act` scope, but the `act` call was not awaited. When testing React components that depend on asynchronous data, you must await the result:\n\nawait act(() => ...)"
          ));
        }), ReactSharedInternals.actQueue = null);
        if (0 < ReactSharedInternals.thrownErrors.length)
          throw callback = aggregateErrors(ReactSharedInternals.thrownErrors), ReactSharedInternals.thrownErrors.length = 0, callback;
        return {
          then: function(resolve, reject) {
            didAwaitActCall = true;
            0 === prevActScopeDepth ? (ReactSharedInternals.actQueue = queue, enqueueTask(function() {
              return recursivelyFlushAsyncActWork(
                returnValue$jscomp$0,
                resolve,
                reject
              );
            })) : resolve(returnValue$jscomp$0);
          }
        };
      };
      exports.cache = function(fn) {
        return function() {
          return fn.apply(null, arguments);
        };
      };
      exports.cacheSignal = function() {
        return null;
      };
      exports.captureOwnerStack = function() {
        var getCurrentStack = ReactSharedInternals.getCurrentStack;
        return null === getCurrentStack ? null : getCurrentStack();
      };
      exports.cloneElement = function(element, config, children) {
        if (null === element || void 0 === element)
          throw Error(
            "The argument must be a React element, but you passed " + element + "."
          );
        var props = assign({}, element.props), key = element.key, owner = element._owner;
        if (null != config) {
          var JSCompiler_inline_result;
          a: {
            if (hasOwnProperty.call(config, "ref") && (JSCompiler_inline_result = Object.getOwnPropertyDescriptor(
              config,
              "ref"
            ).get) && JSCompiler_inline_result.isReactWarning) {
              JSCompiler_inline_result = false;
              break a;
            }
            JSCompiler_inline_result = void 0 !== config.ref;
          }
          JSCompiler_inline_result && (owner = getOwner());
          hasValidKey(config) && (checkKeyStringCoercion(config.key), key = "" + config.key);
          for (propName in config)
            !hasOwnProperty.call(config, propName) || "key" === propName || "__self" === propName || "__source" === propName || "ref" === propName && void 0 === config.ref || (props[propName] = config[propName]);
        }
        var propName = arguments.length - 2;
        if (1 === propName) props.children = children;
        else if (1 < propName) {
          JSCompiler_inline_result = Array(propName);
          for (var i = 0; i < propName; i++)
            JSCompiler_inline_result[i] = arguments[i + 2];
          props.children = JSCompiler_inline_result;
        }
        props = ReactElement(
          element.type,
          key,
          props,
          owner,
          element._debugStack,
          element._debugTask
        );
        for (key = 2; key < arguments.length; key++)
          validateChildKeys(arguments[key]);
        return props;
      };
      exports.createContext = function(defaultValue) {
        defaultValue = {
          $$typeof: REACT_CONTEXT_TYPE,
          _currentValue: defaultValue,
          _currentValue2: defaultValue,
          _threadCount: 0,
          Provider: null,
          Consumer: null
        };
        defaultValue.Provider = defaultValue;
        defaultValue.Consumer = {
          $$typeof: REACT_CONSUMER_TYPE,
          _context: defaultValue
        };
        defaultValue._currentRenderer = null;
        defaultValue._currentRenderer2 = null;
        return defaultValue;
      };
      exports.createElement = function(type, config, children) {
        for (var i = 2; i < arguments.length; i++)
          validateChildKeys(arguments[i]);
        i = {};
        var key = null;
        if (null != config)
          for (propName in didWarnAboutOldJSXRuntime || !("__self" in config) || "key" in config || (didWarnAboutOldJSXRuntime = true, console.warn(
            "Your app (or one of its dependencies) is using an outdated JSX transform. Update to the modern JSX transform for faster performance: https://react.dev/link/new-jsx-transform"
          )), hasValidKey(config) && (checkKeyStringCoercion(config.key), key = "" + config.key), config)
            hasOwnProperty.call(config, propName) && "key" !== propName && "__self" !== propName && "__source" !== propName && (i[propName] = config[propName]);
        var childrenLength = arguments.length - 2;
        if (1 === childrenLength) i.children = children;
        else if (1 < childrenLength) {
          for (var childArray = Array(childrenLength), _i = 0; _i < childrenLength; _i++)
            childArray[_i] = arguments[_i + 2];
          Object.freeze && Object.freeze(childArray);
          i.children = childArray;
        }
        if (type && type.defaultProps)
          for (propName in childrenLength = type.defaultProps, childrenLength)
            void 0 === i[propName] && (i[propName] = childrenLength[propName]);
        key && defineKeyPropWarningGetter(
          i,
          "function" === typeof type ? type.displayName || type.name || "Unknown" : type
        );
        var propName = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
        return ReactElement(
          type,
          key,
          i,
          getOwner(),
          propName ? Error("react-stack-top-frame") : unknownOwnerDebugStack,
          propName ? createTask(getTaskName(type)) : unknownOwnerDebugTask
        );
      };
      exports.createRef = function() {
        var refObject = { current: null };
        Object.seal(refObject);
        return refObject;
      };
      exports.forwardRef = function(render) {
        null != render && render.$$typeof === REACT_MEMO_TYPE ? console.error(
          "forwardRef requires a render function but received a `memo` component. Instead of forwardRef(memo(...)), use memo(forwardRef(...))."
        ) : "function" !== typeof render ? console.error(
          "forwardRef requires a render function but was given %s.",
          null === render ? "null" : typeof render
        ) : 0 !== render.length && 2 !== render.length && console.error(
          "forwardRef render functions accept exactly two parameters: props and ref. %s",
          1 === render.length ? "Did you forget to use the ref parameter?" : "Any additional parameter will be undefined."
        );
        null != render && null != render.defaultProps && console.error(
          "forwardRef render functions do not support defaultProps. Did you accidentally pass a React component?"
        );
        var elementType = { $$typeof: REACT_FORWARD_REF_TYPE, render }, ownName;
        Object.defineProperty(elementType, "displayName", {
          enumerable: false,
          configurable: true,
          get: function() {
            return ownName;
          },
          set: function(name) {
            ownName = name;
            render.name || render.displayName || (Object.defineProperty(render, "name", { value: name }), render.displayName = name);
          }
        });
        return elementType;
      };
      exports.isValidElement = isValidElement;
      exports.lazy = function(ctor) {
        ctor = { _status: -1, _result: ctor };
        var lazyType = {
          $$typeof: REACT_LAZY_TYPE,
          _payload: ctor,
          _init: lazyInitializer
        }, ioInfo = {
          name: "lazy",
          start: -1,
          end: -1,
          value: null,
          owner: null,
          debugStack: Error("react-stack-top-frame"),
          debugTask: console.createTask ? console.createTask("lazy()") : null
        };
        ctor._ioInfo = ioInfo;
        lazyType._debugInfo = [{ awaited: ioInfo }];
        return lazyType;
      };
      exports.memo = function(type, compare) {
        null == type && console.error(
          "memo: The first argument must be a component. Instead received: %s",
          null === type ? "null" : typeof type
        );
        compare = {
          $$typeof: REACT_MEMO_TYPE,
          type,
          compare: void 0 === compare ? null : compare
        };
        var ownName;
        Object.defineProperty(compare, "displayName", {
          enumerable: false,
          configurable: true,
          get: function() {
            return ownName;
          },
          set: function(name) {
            ownName = name;
            type.name || type.displayName || (Object.defineProperty(type, "name", { value: name }), type.displayName = name);
          }
        });
        return compare;
      };
      exports.startTransition = function(scope) {
        var prevTransition = ReactSharedInternals.T, currentTransition = {};
        currentTransition._updatedFibers = /* @__PURE__ */ new Set();
        ReactSharedInternals.T = currentTransition;
        try {
          var returnValue = scope(), onStartTransitionFinish = ReactSharedInternals.S;
          null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
          "object" === typeof returnValue && null !== returnValue && "function" === typeof returnValue.then && (ReactSharedInternals.asyncTransitions++, returnValue.then(releaseAsyncTransition, releaseAsyncTransition), returnValue.then(noop, reportGlobalError));
        } catch (error) {
          reportGlobalError(error);
        } finally {
          null === prevTransition && currentTransition._updatedFibers && (scope = currentTransition._updatedFibers.size, currentTransition._updatedFibers.clear(), 10 < scope && console.warn(
            "Detected a large number of updates inside startTransition. If this is due to a subscription please re-write it to use React provided hooks. Otherwise concurrent mode guarantees are off the table."
          )), null !== prevTransition && null !== currentTransition.types && (null !== prevTransition.types && prevTransition.types !== currentTransition.types && console.error(
            "We expected inner Transitions to have transferred the outer types set and that you cannot add to the outer Transition while inside the inner.This is a bug in React."
          ), prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;
        }
      };
      exports.unstable_useCacheRefresh = function() {
        return resolveDispatcher().useCacheRefresh();
      };
      exports.use = function(usable) {
        return resolveDispatcher().use(usable);
      };
      exports.useActionState = function(action, initialState, permalink) {
        return resolveDispatcher().useActionState(
          action,
          initialState,
          permalink
        );
      };
      exports.useCallback = function(callback, deps) {
        return resolveDispatcher().useCallback(callback, deps);
      };
      exports.useContext = function(Context) {
        var dispatcher = resolveDispatcher();
        Context.$$typeof === REACT_CONSUMER_TYPE && console.error(
          "Calling useContext(Context.Consumer) is not supported and will cause bugs. Did you mean to call useContext(Context) instead?"
        );
        return dispatcher.useContext(Context);
      };
      exports.useDebugValue = function(value, formatterFn) {
        return resolveDispatcher().useDebugValue(value, formatterFn);
      };
      exports.useDeferredValue = function(value, initialValue) {
        return resolveDispatcher().useDeferredValue(value, initialValue);
      };
      exports.useEffect = function(create2, deps) {
        null == create2 && console.warn(
          "React Hook useEffect requires an effect callback. Did you forget to pass a callback to the hook?"
        );
        return resolveDispatcher().useEffect(create2, deps);
      };
      exports.useEffectEvent = function(callback) {
        return resolveDispatcher().useEffectEvent(callback);
      };
      exports.useId = function() {
        return resolveDispatcher().useId();
      };
      exports.useImperativeHandle = function(ref, create2, deps) {
        return resolveDispatcher().useImperativeHandle(ref, create2, deps);
      };
      exports.useInsertionEffect = function(create2, deps) {
        null == create2 && console.warn(
          "React Hook useInsertionEffect requires an effect callback. Did you forget to pass a callback to the hook?"
        );
        return resolveDispatcher().useInsertionEffect(create2, deps);
      };
      exports.useLayoutEffect = function(create2, deps) {
        null == create2 && console.warn(
          "React Hook useLayoutEffect requires an effect callback. Did you forget to pass a callback to the hook?"
        );
        return resolveDispatcher().useLayoutEffect(create2, deps);
      };
      exports.useMemo = function(create2, deps) {
        return resolveDispatcher().useMemo(create2, deps);
      };
      exports.useOptimistic = function(passthrough, reducer) {
        return resolveDispatcher().useOptimistic(passthrough, reducer);
      };
      exports.useReducer = function(reducer, initialArg, init) {
        return resolveDispatcher().useReducer(reducer, initialArg, init);
      };
      exports.useRef = function(initialValue) {
        return resolveDispatcher().useRef(initialValue);
      };
      exports.useState = function(initialState) {
        return resolveDispatcher().useState(initialState);
      };
      exports.useSyncExternalStore = function(subscribe, getSnapshot, getServerSnapshot) {
        return resolveDispatcher().useSyncExternalStore(
          subscribe,
          getSnapshot,
          getServerSnapshot
        );
      };
      exports.useTransition = function() {
        return resolveDispatcher().useTransition();
      };
      exports.version = "19.2.3";
      "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
    })();
  }
});

// node_modules/react/index.js
var require_react = __commonJS({
  "node_modules/react/index.js"(exports, module) {
    "use strict";
    if (false) {
      module.exports = null;
    } else {
      module.exports = require_react_development();
    }
  }
});

// src/render/layouts.ts
var LAYOUTS = {
  // 16:9 横版：封面左侧方形，标题右侧，频谱横贯底部
  "16:9": {
    id: "16:9",
    label: "\u6A2A\u7248 16:9",
    width: 1920,
    height: 1080,
    cover: { x: 0.09, y: 0.22, w: 0.31, h: 0.56 },
    titleY: 0.42,
    titleAlign: "left",
    titleX: 0.46,
    spectrum: { x: 0.04, y: 0.8, w: 0.92, h: 0.16 },
    radialCenter: { x: 0.245, y: 0.5 },
    radialRadius: 0.42
  },
  // 9:16 竖版：封面居中偏上占宽 70%，标题在封面下，频谱贴底
  "9:16": {
    id: "9:16",
    label: "\u7AD6\u7248 9:16",
    width: 1080,
    height: 1920,
    cover: { x: 0.15, y: 0.14, w: 0.7, h: 0.394 },
    titleY: 0.6,
    titleAlign: "center",
    titleX: 0.5,
    spectrum: { x: 0.05, y: 0.86, w: 0.9, h: 0.11 },
    radialCenter: { x: 0.5, y: 0.337 },
    radialRadius: 0.5
  },
  // 1:1 方形：封面居中占宽 60%，标题下方，频谱贴底
  "1:1": {
    id: "1:1",
    label: "\u65B9\u5F62 1:1",
    width: 1080,
    height: 1080,
    cover: { x: 0.2, y: 0.12, w: 0.6, h: 0.6 },
    titleY: 0.8,
    titleAlign: "center",
    titleX: 0.5,
    spectrum: { x: 0.05, y: 0.9, w: 0.9, h: 0.08 },
    radialCenter: { x: 0.5, y: 0.42 },
    radialRadius: 0.44
  },
  // 4:5 竖方形：封面居中占宽 68%，标题下方，频谱贴底
  "4:5": {
    id: "4:5",
    label: "\u7AD6\u7248 4:5",
    width: 1080,
    height: 1350,
    cover: { x: 0.16, y: 0.13, w: 0.68, h: 0.544 },
    titleY: 0.74,
    titleAlign: "center",
    titleX: 0.5,
    spectrum: { x: 0.05, y: 0.88, w: 0.9, h: 0.09 },
    radialCenter: { x: 0.5, y: 0.402 },
    radialRadius: 0.47
  }
};
var LAYOUT_LIST = [LAYOUTS["16:9"], LAYOUTS["9:16"], LAYOUTS["1:1"], LAYOUTS["4:5"]];

// src/render/background.ts
var cache = { img: null, w: 0, h: 0, blur: -1, brightness: -1, saturation: -1, canvas: null };
function coverRect(imgW, imgH, boxW, boxH) {
  const boxRatio = boxW / boxH;
  const imgRatio = imgW / imgH;
  let sw = imgW;
  let sh = imgH;
  if (imgRatio > boxRatio) {
    sw = imgH * boxRatio;
  } else {
    sh = imgW / boxRatio;
  }
  return { sx: (imgW - sw) / 2, sy: (imgH - sh) / 2, sw, sh };
}
function getBlurredBg(img, w, h, params) {
  if (cache.canvas && cache.img === img && cache.w === w && cache.h === h && cache.blur === params.blur && cache.brightness === params.brightness && cache.saturation === params.saturation) {
    return cache.canvas;
  }
  const scale = 1 / 8;
  const cw = Math.max(2, Math.round(w * scale));
  const ch = Math.max(2, Math.round(h * scale));
  const off = document.createElement("canvas");
  off.width = cw;
  off.height = ch;
  const octx = off.getContext("2d");
  const blurPx = Math.round(2 + params.blur * 14);
  octx.filter = `blur(${blurPx}px) brightness(${params.brightness}) saturate(${params.saturation})`;
  const r = coverRect(img.naturalWidth, img.naturalHeight, cw, ch);
  octx.drawImage(img, r.sx, r.sy, r.sw, r.sh, -cw * 0.05, -ch * 0.05, cw * 1.1, ch * 1.1);
  octx.filter = "none";
  cache = { img, w, h, blur: params.blur, brightness: params.brightness, saturation: params.saturation, canvas: off };
  return off;
}
var noiseCanvas = null;
function getNoise() {
  if (noiseCanvas) return noiseCanvas;
  const n = document.createElement("canvas");
  n.width = 128;
  n.height = 128;
  const nctx = n.getContext("2d");
  const data = nctx.createImageData(128, 128);
  for (let i = 0; i < data.data.length; i += 4) {
    const v = Math.random() * 255;
    data.data[i] = v;
    data.data[i + 1] = v;
    data.data[i + 2] = v;
    data.data[i + 3] = 10;
  }
  nctx.putImageData(data, 0, 0);
  noiseCanvas = n;
  return n;
}
function drawVideoBackground(ctx, video, w, h, params) {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (vw > 0 && vh > 0) {
    const r = coverRect(vw, vh, w, h);
    ctx.save();
    ctx.filter = `brightness(${params.brightness * 0.9}) saturate(${params.saturation})`;
    ctx.drawImage(video, r.sx, r.sy, r.sw, r.sh, 0, 0, w, h);
    ctx.restore();
  } else {
    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, w, h);
  }
  if (params.vignette > 0) {
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.hypot(cx, cy);
    const vg = ctx.createRadialGradient(cx, cy, radius * 0.45, cx, cy, radius);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, `rgba(0,0,0,${0.55 * params.vignette})`);
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, w, h);
  }
}
function drawBackground(ctx, w, h, cover, params) {
  if (cover) {
    const bg = getBlurredBg(cover, w, h, params);
    ctx.drawImage(bg, 0, 0, w, h);
  } else {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#0a0a0c");
    g.addColorStop(0.55, "#050505");
    g.addColorStop(1, "#0c0c10");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.save();
    ctx.globalAlpha = 0.5;
    const pattern = ctx.createPattern(getNoise(), "repeat");
    if (pattern) {
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, w, h);
    }
    ctx.restore();
  }
  if (params.vignette > 0) {
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.hypot(cx, cy);
    const vg = ctx.createRadialGradient(cx, cy, radius * 0.45, cx, cy, radius);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, `rgba(0,0,0,${0.55 * params.vignette})`);
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, w, h);
  }
}
function drawCover(ctx, img, x, y, w, h, beat) {
  const r = coverRect(img.naturalWidth, img.naturalHeight, w, h);
  const radius = Math.min(w, h) * 0.04;
  const pulse = 1 + beat * 0.06;
  const dw = w * pulse;
  const dh = h * pulse;
  const dx = x - (dw - w) / 2;
  const dy = y - (dh - h) / 2;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur = Math.min(w, h) * 0.08;
  ctx.shadowOffsetY = Math.min(w, h) * 0.02;
  ctx.beginPath();
  ctx.roundRect(dx, dy, dw, dh, radius);
  ctx.clip();
  ctx.drawImage(img, r.sx, r.sy, r.sw, r.sh, dx, dy, dw, dh);
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.1)";
  ctx.lineWidth = Math.max(1, Math.min(w, h) * 3e-3);
  ctx.beginPath();
  ctx.roundRect(dx, dy, dw, dh, radius);
  ctx.stroke();
  ctx.restore();
}

// src/render/presets/common.ts
function sampleSpectrum(data, count, mapping, sensitivity, out) {
  const spec = data.spectrum;
  const result = out && out.length === count ? out : new Float32Array(count);
  const usable = Math.floor(spec.length * 0.72);
  for (let i = 0; i < count; i++) {
    let from;
    let to;
    if (mapping === "log") {
      from = Math.floor(Math.pow(usable, i / count));
      to = Math.floor(Math.pow(usable, (i + 1) / count));
    } else {
      from = Math.floor(i / count * usable);
      to = Math.floor((i + 1) / count * usable);
    }
    to = Math.max(from + 1, Math.min(to, spec.length));
    let peak = 0;
    for (let j = from; j < to; j++) {
      if (spec[j] > peak) peak = spec[j];
    }
    result[i] = Math.tanh(peak * sensitivity * 1.6);
  }
  return result;
}
function makeGradient(ctx, x0, y0, x1, y1, c1, c2) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, c1);
  g.addColorStop(1, c2);
  return g;
}
function hexToRgba(hex, alpha) {
  const m = hex.replace("#", "");
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// src/render/presets/barSpectrum.ts
function drawBarSpectrum(ctx, data, params, x, y, w, h, scale) {
  const count = Math.max(8, Math.round(params.barCount));
  const bins = sampleSpectrum(data, count, params.freqMapping, params.sensitivity);
  const gap = w / count;
  const barW = gap * 0.62;
  const radius = barW / 2 * params.roundness;
  ctx.save();
  if (params.glow > 0) {
    ctx.shadowColor = hexToRgba(params.colorPrimary, 0.8 * params.glow);
    ctx.shadowBlur = 24 * params.glow * scale;
  }
  const grad = params.mirror ? makeGradient(ctx, 0, y + h / 2, 0, y, params.colorSecondary, params.colorPrimary) : makeGradient(ctx, 0, y + h, 0, y, params.colorSecondary, params.colorPrimary);
  ctx.fillStyle = grad;
  ctx.lineCap = "round";
  const beatBoost = 1 + data.beat * 0.35;
  ctx.globalAlpha = Math.min(1, 0.85 + data.beat * 0.15);
  ctx.beginPath();
  for (let i = 0; i < count; i++) {
    const v = bins[i];
    const bh = Math.max(barW * 0.4, v * h * beatBoost);
    const bx = x + i * gap + (gap - barW) / 2;
    if (params.mirror) {
      const half = bh / 2;
      ctx.roundRect(bx, y + h / 2 - half, barW, half, [radius, radius, 0, 0]);
      ctx.roundRect(bx, y + h / 2, barW, half, [0, 0, radius, radius]);
    } else {
      ctx.roundRect(bx, y + h - bh, barW, bh, [radius, radius, 0, 0]);
    }
  }
  ctx.fill();
  ctx.restore();
}

// src/render/loopUtil.ts
function qp(desired, loopPeriod) {
  if (!loopPeriod || loopPeriod <= 0) return desired;
  const cycles = Math.max(1, Math.round(loopPeriod / desired));
  return loopPeriod / cycles;
}
function qw(omega, loopPeriod) {
  if (!loopPeriod || loopPeriod <= 0) return omega;
  const cycles = Math.max(1, Math.round(omega * loopPeriod / (Math.PI * 2)));
  return cycles * Math.PI * 2 / loopPeriod;
}
function qhz(speed, loopPeriod) {
  if (!loopPeriod || loopPeriod <= 0) return speed;
  const cycles = Math.max(1, Math.round(speed * loopPeriod));
  return cycles / loopPeriod;
}

// src/render/presets/radialSpectrum.ts
function drawRadialSpectrum(ctx, data, params, cx, cy, baseRadius, scale, loopPeriod) {
  const count = Math.max(16, Math.round(params.barCount * 1.5));
  const bins = sampleSpectrum(data, count, params.freqMapping, params.sensitivity);
  const rotation = data.t / qp(40, loopPeriod) * Math.PI * 2;
  const maxLen = baseRadius * 0.55;
  const lineW = Math.max(1.5, params.lineWidth * scale * 0.8);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  if (params.glow > 0) {
    ctx.shadowColor = hexToRgba(params.colorPrimary, 0.8 * params.glow);
    ctx.shadowBlur = 20 * params.glow * scale;
  }
  ctx.lineWidth = lineW;
  ctx.lineCap = "round";
  const beatBoost = 1 + data.beat * 0.28;
  const inner = baseRadius + lineW;
  for (let i = 0; i < count; i++) {
    const angle = i / count * Math.PI * 2;
    const v = bins[i];
    const len = Math.max(lineW, v * maxLen * beatBoost);
    const mix = i / count;
    ctx.strokeStyle = mix < 0.5 ? params.colorPrimary : params.colorSecondary;
    ctx.globalAlpha = 0.35 + v * 0.65;
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    ctx.beginPath();
    ctx.moveTo(c * inner, s * inner);
    ctx.lineTo(c * (inner + len), s * (inner + len));
    if (params.mirror) {
      ctx.moveTo(c * (inner - lineW * 2), s * (inner - lineW * 2));
      ctx.lineTo(c * (inner - lineW * 2 - len * 0.4), s * (inner - lineW * 2 - len * 0.4));
    }
    ctx.stroke();
  }
  ctx.restore();
}

// src/render/presets/waveform.ts
function drawWaveform(ctx, data, params, x, y, w, h, scale, loopPeriod) {
  const count = Math.max(32, Math.round(params.barCount * 2));
  const bins = sampleSpectrum(data, count, params.freqMapping, params.sensitivity);
  const midY = y + h / 2;
  const lineW = Math.max(1.5, params.lineWidth * scale);
  ctx.save();
  if (params.glow > 0) {
    ctx.shadowColor = hexToRgba(params.colorPrimary, 0.9 * params.glow);
    ctx.shadowBlur = 22 * params.glow * scale;
  }
  const layers = [
    { amp: 0.5, alpha: 0.35, color: params.colorSecondary, width: lineW * 1.8 },
    { amp: 1, alpha: 1, color: params.colorPrimary, width: lineW }
  ];
  const beatBoost = 1 + data.beat * 0.35;
  for (const layer of layers) {
    ctx.strokeStyle = hexToRgba(layer.color, layer.alpha);
    ctx.lineWidth = layer.width;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    const pts = [];
    for (let i = 0; i < count; i++) {
      const px = x + i / (count - 1) * w;
      const amp = bins[i] * h * 0.5 * layer.amp * beatBoost;
      const py = params.mirror ? midY - amp * Math.sin(i / count * Math.PI * 6 + data.t * qw(2, loopPeriod)) : midY - amp + Math.sin(i * 0.7 + data.t * qw(3, loopPeriod)) * amp * 0.15;
      pts.push([px, py]);
    }
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(pts.length - 1, i + 2)];
      const c1x = p1[0] + (p2[0] - p0[0]) / 6;
      const c1y = p1[1] + (p2[1] - p0[1]) / 6;
      const c2x = p2[0] - (p3[0] - p1[0]) / 6;
      const c2y = p2[1] - (p3[1] - p1[1]) / 6;
      ctx.bezierCurveTo(c1x, c1y, c2x, c2y, p2[0], p2[1]);
    }
    ctx.stroke();
  }
  ctx.restore();
}

// src/render/presets/particleSpectrum.ts
function hash(i, salt) {
  let h = i * 374761393 + salt * 668265263;
  h = (h ^ h >> 13) * 1274126177;
  return ((h ^ h >> 16) >>> 0) / 4294967295;
}
function drawParticleSpectrum(ctx, data, params, x, y, w, h, scale, loopPeriod) {
  const count = Math.max(16, Math.round(params.barCount));
  const bins = sampleSpectrum(data, count, params.freqMapping, params.sensitivity);
  const particlesPerBin = Math.max(2, Math.round(params.lineWidth));
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  if (params.glow > 0) {
    ctx.shadowColor = hexToRgba(params.colorPrimary, 0.7 * params.glow);
    ctx.shadowBlur = 14 * params.glow * scale;
  }
  const beatBoost = 1 + data.beat * 0.4;
  const slotW = w / count;
  for (let i = 0; i < count; i++) {
    const energy = bins[i];
    if (energy < 0.03) continue;
    const columnX = x + i * slotW + slotW / 2;
    const emitH = energy * h * beatBoost;
    for (let p = 0; p < particlesPerBin; p++) {
      const id = i * 1e3 + p;
      const jitter = (hash(id, 1) - 0.5) * slotW * 0.9;
      const speed = qhz(0.4 + hash(id, 2) * 0.8, loopPeriod);
      const phase = hash(id, 3);
      const life = (phase + data.t * speed) % 1;
      const px = columnX + jitter * (0.5 + life);
      const py = y + h - life * emitH - hash(id, 4) * h * 0.05;
      const size = (1 + energy * 5) * (1 - life * 0.7) * scale * (0.5 + hash(id, 5));
      const alpha = (1 - life) * (0.25 + energy * 0.75);
      const color = life < 0.5 ? params.colorPrimary : params.colorSecondary;
      ctx.fillStyle = hexToRgba(color, Math.min(1, alpha));
      ctx.beginPath();
      ctx.arc(px, py, Math.max(0.6, size), 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

// src/render/presets/studioSpectrum.ts
var MAP_EXP = 1.7;
var BIN_RATIO = 0.72;
var VAL_LERP = 0.5;
var PEAK_DECAY_PER_SEC = 0.36;
var PEAK_FLOOR = 0.04;
var states = /* @__PURE__ */ new WeakMap();
function stateFor(ctx) {
  let s = states.get(ctx);
  if (!s) {
    s = { vals: null, peaks: null, lastT: null };
    states.set(ctx, s);
  }
  return s;
}
function drawStudioSpectrum(ctx, data, params, x, y, w, h, scale) {
  const count = Math.max(8, Math.round(params.barCount));
  const spec = data.spectrum;
  const state = stateFor(ctx);
  if (!state.vals || state.vals.length !== count) {
    state.vals = new Float32Array(count).fill(0.08);
    state.peaks = new Float32Array(count).fill(0.1);
    state.lastT = null;
  }
  const vals = state.vals;
  const peaks = state.peaks;
  const dt = state.lastT === null ? 1 / 60 : Math.max(0, Math.min(0.1, data.t - state.lastT));
  state.lastT = data.t;
  const usable = Math.floor(spec.length * BIN_RATIO);
  for (let i = 0; i < count; i++) {
    const idx = Math.min(spec.length - 1, Math.floor(Math.pow(i / (count - 1), MAP_EXP) * usable));
    const target = Math.min(1, 0.05 + 0.93 * spec[idx] * params.sensitivity);
    vals[i] += (target - vals[i]) * VAL_LERP;
    if (vals[i] > peaks[i]) peaks[i] = vals[i];
    else peaks[i] = Math.max(PEAK_FLOOR, peaks[i] - PEAK_DECAY_PER_SEC * dt);
  }
  const bass = data.bass;
  const beat = data.beat;
  const hudH = 14 * scale;
  const baseY = y + h * 0.78;
  const barAreaH = baseY - (y + hudH);
  const refH = y + h - baseY;
  const gap = Math.max(1, w * 8e-3);
  const bw = (w - gap * (count - 1)) / count;
  const radius = bw / 2 * Math.min(1, Math.max(0, params.roundness));
  ctx.save();
  const glowR = Math.max(10, w * (0.24 + bass * 0.42));
  const glow = ctx.createRadialGradient(x + w / 2, baseY, 0, x + w / 2, baseY, glowR);
  glow.addColorStop(0, hexToRgba(params.colorPrimary, (0.1 + bass * 0.24) * 0.9));
  glow.addColorStop(1, hexToRgba(params.colorPrimary, 0));
  ctx.fillStyle = glow;
  ctx.fillRect(x, y, w, h);
  const beatBoost = 1 + beat * 0.3;
  const grad = ctx.createLinearGradient(0, baseY, 0, baseY - barAreaH);
  grad.addColorStop(0, hexToRgba(params.colorPrimary, 0.5));
  grad.addColorStop(0.6, params.colorPrimary);
  grad.addColorStop(1, params.colorSecondary);
  if (params.glow > 0) {
    ctx.shadowColor = hexToRgba(params.colorPrimary, Math.min(1, (0.3 + bass * 0.5) * params.glow * 1.3));
    ctx.shadowBlur = (5 + bass * 16 + beat * 10) * params.glow * scale;
  }
  ctx.fillStyle = grad;
  ctx.beginPath();
  for (let i = 0; i < count; i++) {
    const bh = Math.max(2 * scale, vals[i] * barAreaH * beatBoost);
    const bx = x + i * (bw + gap);
    ctx.roundRect(bx, baseY - bh, bw, bh, [radius, radius, 0, 0]);
  }
  ctx.fill();
  ctx.shadowBlur = 0;
  if (params.peakCaps) {
    const capH = 2 * scale + beat * 1.5 * scale;
    ctx.fillStyle = hexToRgba(params.colorSecondary, Math.min(1, 0.75 + beat * 0.25));
    ctx.beginPath();
    for (let i = 0; i < count; i++) {
      const py = baseY - Math.max(3 * scale, peaks[i] * barAreaH * beatBoost);
      ctx.rect(x + i * (bw + gap), Math.max(y + hudH, py - capH), bw, capH);
    }
    ctx.fill();
  }
  if (params.reflection > 0) {
    const rgrad = ctx.createLinearGradient(0, baseY, 0, baseY + refH);
    rgrad.addColorStop(0, hexToRgba(params.colorPrimary, 0.28 * params.reflection));
    rgrad.addColorStop(1, hexToRgba(params.colorPrimary, 0));
    ctx.fillStyle = rgrad;
    ctx.beginPath();
    for (let i = 0; i < count; i++) {
      const rh = Math.min(refH - 2 * scale, vals[i] * barAreaH * 0.35 * beatBoost);
      if (rh > 1) ctx.rect(x + i * (bw + gap), baseY + 2 * scale, bw, rh);
    }
    ctx.fill();
  }
  ctx.fillStyle = "rgba(255,255,255,0.03)";
  const scanStep = Math.max(2, 3 * scale);
  for (let yy = y; yy < y + h; yy += scanStep) {
    ctx.fillRect(x, yy, w, 1);
  }
  const hudY = y + hudH * 0.72;
  ctx.font = `${10 * scale}px ui-monospace, "SF Mono", Menlo, Consolas, monospace`;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "rgba(255,255,255,0.34)";
  ctx.fillText("STUDIO_ANLZR \xB7 CH-05", x + 2 * scale, hudY);
  const dotR = 2.5 * scale;
  const dotY = hudY - 3 * scale;
  for (let d = 0; d < 3; d++) {
    const dx = x + w - (3 - d) * 10 * scale;
    ctx.beginPath();
    ctx.arc(dx, dotY, dotR, 0, Math.PI * 2);
    if (d === 2) {
      ctx.fillStyle = hexToRgba(params.colorPrimary, 0.9);
      ctx.shadowColor = hexToRgba(params.colorPrimary, 0.9);
      ctx.shadowBlur = 6 * scale;
    } else {
      ctx.fillStyle = "rgba(255,255,255,0.18)";
    }
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  ctx.restore();
}

// src/render/fx/particles.ts
function hash2(i, salt) {
  let h = i * 2246822519 + salt * 3266489917;
  h = (h ^ h >> 15) * 2654435761;
  return ((h ^ h >> 13) >>> 0) / 4294967295;
}
function drawHalo(ctx, data, params, cx, cy, baseRadius, loopPeriod) {
  if (params.haloIntensity <= 0) return;
  const breathe = 0.5 + 0.5 * Math.sin(data.t / qp(7, loopPeriod) * Math.PI * 2);
  const pulse = data.beat;
  const radius = baseRadius * (0.9 + breathe * 0.15 + pulse * 0.45);
  const alpha = params.haloIntensity * (0.1 + breathe * 0.05 + pulse * 0.38);
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  g.addColorStop(0, hexToRgba(params.haloColor, Math.min(1, alpha)));
  g.addColorStop(0.6, hexToRgba(params.haloColor, Math.min(1, alpha * 0.35)));
  g.addColorStop(1, hexToRgba(params.haloColor, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
}
function drawFloatingParticles(ctx, data, params, w, h, scale, loopPeriod) {
  const count = Math.max(0, Math.round(params.particleCount));
  if (count === 0 || params.particleIntensity <= 0) return;
  ctx.fillStyle = params.particleColor;
  for (let i = 0; i < count; i++) {
    const periodA = qp(11 + hash2(i, 1) * 6, loopPeriod);
    const periodB = qp(17 + hash2(i, 2) * 8, loopPeriod);
    const phaseA = (data.t / periodA + hash2(i, 3)) % 1;
    const drift = Math.sin(data.t / periodB * Math.PI * 2 + hash2(i, 4) * Math.PI * 2);
    const px = hash2(i, 5) * w + drift * w * 0.02;
    const py = h - phaseA * h * 1.1;
    const energy = data.bass * params.particleIntensity;
    const size = (0.8 + hash2(i, 6) * 2 + energy * 4) * scale;
    const alpha = (0.08 + hash2(i, 7) * 0.2 + energy * 0.5) * (0.3 + 0.7 * Math.sin(phaseA * Math.PI));
    if (alpha <= 0.01) continue;
    ctx.fillStyle = hexToRgba(params.particleColor, Math.min(1, alpha));
    ctx.beginPath();
    ctx.arc(px, py, Math.max(0.4, size), 0, Math.PI * 2);
    ctx.fill();
  }
}
function drawFxLayer(ctx, data, params, w, h, haloCx, haloCy, haloRadius, scale, loopPeriod) {
  if (!params.enabled) return;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  drawHalo(ctx, data, params, haloCx, haloCy, haloRadius, loopPeriod);
  drawFloatingParticles(ctx, data, params, w, h, scale, loopPeriod);
  ctx.restore();
}

// src/render/titleCard.ts
var FONT_STACKS = {
  sans: `-apple-system, "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif`,
  serif: `"Songti SC", "STSong", "SimSun", "Noto Serif SC", serif`,
  handwriting: `"Kaiti SC", "STKaiti", "KaiTi", "TW-Kai", cursive`
};
function easeOut(t) {
  return 1 - Math.pow(1 - t, 3);
}
function visibility(params, t) {
  const lt = t - params.startOffset;
  if (lt < 0) return null;
  const dur = Math.max(0.6, Math.min(1, params.animationDuration));
  const showDur = params.showDuration;
  if (showDur > 0 && lt > showDur) {
    const fadeOut = 1 - Math.min(1, (lt - showDur) / 0.6);
    if (fadeOut <= 0) return null;
    return { alpha: fadeOut, progress: 1 };
  }
  const inT = Math.min(1, lt / dur);
  const eased = easeOut(inT);
  switch (params.animation) {
    case "fade":
      return { alpha: eased, progress: 1 };
    case "slide":
      return { alpha: eased, progress: eased };
    case "typewriter":
      return { alpha: 1, progress: Math.min(1, lt / (dur * 1.2)) };
  }
}
function drawTitle(ctx, params, t, x, y, maxWidth, align, canvasShortSide, beat) {
  if (!params.enabled || !params.title.trim()) return;
  const vis = visibility(params, t);
  if (!vis) return;
  const fontStack = FONT_STACKS[params.font];
  const titleSize = Math.round(canvasShortSide * params.fontSize);
  const artistSize = Math.round(titleSize * 0.52);
  let titleText = params.title;
  if (params.animation === "typewriter") {
    const n = Math.ceil(titleText.length * vis.progress);
    titleText = titleText.slice(0, n);
  }
  const slideOffset = params.animation === "slide" ? (1 - vis.progress) * titleSize * 1.2 : 0;
  const beatGlow = beat * 0.12;
  ctx.save();
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.globalAlpha = vis.alpha;
  ctx.font = `600 ${titleSize}px ${fontStack}`;
  ctx.fillStyle = params.color;
  ctx.shadowColor = hexToRgba(params.color, 0.35 + beatGlow);
  ctx.shadowBlur = (12 + beat * 18) * (titleSize / 60);
  ctx.fillText(titleText, x, y + slideOffset, maxWidth);
  if (params.animation === "typewriter" && vis.progress < 1 && titleText.length > 0) {
    const wText = ctx.measureText(titleText).width;
    const cursorX = align === "center" ? x + wText / 2 + titleSize * 0.15 : align === "right" ? x + titleSize * 0.15 : x + wText + titleSize * 0.15;
    if (Math.floor(t * 2.5) % 2 === 0) {
      ctx.fillRect(cursorX, y + slideOffset - titleSize * 0.38, titleSize * 0.06, titleSize * 0.76);
    }
  }
  if (params.artist.trim()) {
    ctx.shadowBlur = 0;
    ctx.font = `400 ${artistSize}px ${fontStack}`;
    ctx.globalAlpha = vis.alpha * 0.72;
    ctx.fillText(params.artist, x, y + slideOffset + titleSize * 0.95, maxWidth);
  }
  ctx.restore();
}

// src/render/progressBar.ts
var ACCENT = "#D3FD50";
function drawProgressBar(ctx, params, t, duration, w, h, scale) {
  if (!params.enabled || duration <= 0) return;
  const margin = w * 0.04;
  const barH = Math.max(2, 3 * scale);
  const y = h - margin * 0.6;
  const progress = Math.min(1, t / duration);
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.14)";
  ctx.beginPath();
  ctx.roundRect(margin, y - barH / 2, w - margin * 2, barH, barH / 2);
  ctx.fill();
  if (progress > 0) {
    ctx.fillStyle = ACCENT;
    ctx.shadowColor = "rgba(211,253,80,0.6)";
    ctx.shadowBlur = 8 * scale;
    ctx.beginPath();
    ctx.roundRect(margin, y - barH / 2, (w - margin * 2) * progress, barH, barH / 2);
    ctx.fill();
  }
  if (params.showTime) {
    ctx.shadowBlur = 0;
    const fontSize = Math.round(13 * scale);
    ctx.font = `500 ${fontSize}px ui-monospace, "SF Mono", Consolas, monospace`;
    ctx.fillStyle = "rgba(235,235,235,0.75)";
    ctx.textBaseline = "bottom";
    ctx.textAlign = "left";
    ctx.fillText(formatTime(t), margin, y - barH * 2);
    ctx.textAlign = "right";
    ctx.fillText(formatTime(duration), w - margin, y - barH * 2);
  }
  ctx.restore();
}
function formatTime(sec) {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

// src/render/renderer.ts
function renderFrame(ctx, t, audioData, config, assets) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const layout = LAYOUTS[config.layout];
  const shortSide = Math.min(w, h);
  const scale = shortSide / 1080;
  const loopPeriod = assets.loopPeriod;
  ctx.clearRect(0, 0, w, h);
  const hasVideo = !!assets.bgVideo && assets.bgVideo.readyState >= 2;
  if (hasVideo) {
    drawVideoBackground(ctx, assets.bgVideo, w, h, config.bg);
  } else {
    drawBackground(ctx, w, h, assets.cover, config.bg);
  }
  const coverX = layout.cover.x * w;
  const coverY = layout.cover.y * h;
  const coverW = layout.cover.w * w;
  const coverH = layout.cover.h * h;
  if (assets.cover && !hasVideo) {
    drawCover(ctx, assets.cover, coverX, coverY, coverW, coverH, audioData.beat);
  }
  const sx = layout.spectrum.x * w;
  const sy = layout.spectrum.y * h;
  const sw = layout.spectrum.w * w;
  const sh = layout.spectrum.h * h;
  ctx.save();
  const specCx = sx + sw / 2;
  const specCy = sy + sh / 2;
  ctx.translate(specCx + config.spectrum.offsetX * w, specCy + config.spectrum.offsetY * h);
  ctx.scale(config.spectrum.scale, config.spectrum.scale);
  ctx.translate(-specCx, -specCy);
  switch (config.preset) {
    case "bars":
      drawBarSpectrum(ctx, audioData, config.spectrum, sx, sy, sw, sh, scale);
      break;
    case "radial":
      drawRadialSpectrum(
        ctx,
        audioData,
        config.spectrum,
        layout.radialCenter.x * w,
        layout.radialCenter.y * h,
        layout.radialRadius * shortSide * (assets.cover ? 1 : 0.7),
        scale,
        loopPeriod
      );
      break;
    case "waveform":
      drawWaveform(ctx, audioData, config.spectrum, sx, sy, sw, sh * 1.6, scale, loopPeriod);
      break;
    case "particles":
      drawParticleSpectrum(ctx, audioData, config.spectrum, sx, sy - sh * 2, sw, sh * 3, scale, loopPeriod);
      break;
    case "studio":
      drawStudioSpectrum(ctx, audioData, config.spectrum, sx, sy - sh * 0.35, sw, sh * 1.35, scale);
      break;
  }
  ctx.restore();
  const haloCx = layout.radialCenter.x * w;
  const haloCy = layout.radialCenter.y * h;
  drawFxLayer(
    ctx,
    audioData,
    config.fx,
    w,
    h,
    haloCx,
    haloCy,
    layout.radialRadius * shortSide * 0.9,
    scale,
    loopPeriod
  );
  const titleOffset = config.title.position === "top" ? -0.06 : config.title.position === "bottom" ? 0.07 : 0;
  const titleY = Math.min(0.95, Math.max(0.06, layout.titleY + titleOffset)) * h;
  drawTitle(
    ctx,
    config.title,
    t,
    layout.titleX * w,
    titleY,
    w * (layout.titleAlign === "left" ? 0.48 : 0.86),
    layout.titleAlign,
    shortSide,
    audioData.beat
  );
  drawProgressBar(ctx, config.progress, t, assets.duration, w, h, scale);
}

// node_modules/zustand/esm/vanilla.mjs
var createStoreImpl = (createState) => {
  let state;
  const listeners = /* @__PURE__ */ new Set();
  const setState = (partial, replace) => {
    const nextState = typeof partial === "function" ? partial(state) : partial;
    if (!Object.is(nextState, state)) {
      const previousState = state;
      state = (replace != null ? replace : typeof nextState !== "object" || nextState === null) ? nextState : Object.assign({}, state, nextState);
      listeners.forEach((listener) => listener(state, previousState));
    }
  };
  const getState = () => state;
  const getInitialState = () => initialState;
  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };
  const api = { setState, getState, getInitialState, subscribe };
  const initialState = state = createState(setState, getState, api);
  return api;
};
var createStore = ((createState) => createState ? createStoreImpl(createState) : createStoreImpl);

// node_modules/zustand/esm/react.mjs
var import_react = __toESM(require_react(), 1);
var identity = (arg) => arg;
function useStore(api, selector = identity) {
  const slice = import_react.default.useSyncExternalStore(
    api.subscribe,
    import_react.default.useCallback(() => selector(api.getState()), [api, selector]),
    import_react.default.useCallback(() => selector(api.getInitialState()), [api, selector])
  );
  import_react.default.useDebugValue(slice);
  return slice;
}
var createImpl = (createState) => {
  const api = createStore(createState);
  const useBoundStore = (selector) => useStore(api, selector);
  Object.assign(useBoundStore, api);
  return useBoundStore;
};
var create = ((createState) => createState ? createImpl(createState) : createImpl);

// src/state/store.ts
var DEFAULT_CONFIG = {
  preset: "bars",
  layout: "16:9",
  spectrum: {
    barCount: 64,
    sensitivity: 1.3,
    smoothing: 0.5,
    freqMapping: "log",
    colorPrimary: "#D3FD50",
    colorSecondary: "#2b7fff",
    glow: 0.5,
    mirror: false,
    lineWidth: 3,
    roundness: 0.5,
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    peakCaps: true,
    reflection: 0.6
  },
  fx: {
    enabled: true,
    particleCount: 60,
    particleColor: "#D3FD50",
    particleIntensity: 0.6,
    haloIntensity: 0.5,
    haloColor: "#D3FD50"
  },
  title: {
    enabled: true,
    title: "",
    artist: "",
    position: "center",
    fontSize: 0.045,
    color: "#EBEBEB",
    font: "sans",
    animation: "fade",
    showDuration: 0,
    // 0 = 全程显示
    animationDuration: 0.8,
    startOffset: 0
  },
  bg: {
    blur: 0.6,
    brightness: 0.55,
    saturation: 1.1,
    vignette: 0.5
  },
  progress: {
    enabled: true,
    showTime: true
  },
  analysis: {
    analyserSmoothing: 0.75,
    beatThreshold: 1.4
  }
};
var useStore2 = create((set) => ({
  config: DEFAULT_CONFIG,
  session: {
    hasAudio: false,
    duration: 0,
    fileName: "",
    meta: null,
    coverUrl: null,
    bgVideoUrl: null,
    currentAudioId: null,
    currentBgId: null,
    loopPreview: false,
    exportSettings: {
      resolution: "1080p",
      fps: 30,
      bitrate: 12,
      mode: "full",
      loopStart: 0,
      trimStart: 0,
      trimEnd: 0
    }
  },
  setPreset: (preset) => set((s) => ({ config: { ...s.config, preset } })),
  setLayout: (layout) => set((s) => ({ config: { ...s.config, layout } })),
  patchSpectrum: (p) => set((s) => ({ config: { ...s.config, spectrum: { ...s.config.spectrum, ...p } } })),
  patchFx: (p) => set((s) => ({ config: { ...s.config, fx: { ...s.config.fx, ...p } } })),
  patchTitle: (p) => set((s) => ({ config: { ...s.config, title: { ...s.config.title, ...p } } })),
  patchBg: (p) => set((s) => ({ config: { ...s.config, bg: { ...s.config.bg, ...p } } })),
  patchProgress: (p) => set((s) => ({ config: { ...s.config, progress: { ...s.config.progress, ...p } } })),
  patchAnalysis: (p) => set((s) => ({ config: { ...s.config, analysis: { ...s.config.analysis, ...p } } })),
  patchExport: (p) => set((s) => ({ session: { ...s.session, exportSettings: { ...s.session.exportSettings, ...p } } })),
  setSession: (p) => set((s) => ({ session: { ...s.session, ...p } })),
  applyConfig: (c) => set(() => ({ config: c }))
}));

// src/state/presets.ts
function makeBuiltin(id, patch, extra) {
  return {
    ...DEFAULT_CONFIG,
    ...extra,
    preset: id,
    spectrum: { ...DEFAULT_CONFIG.spectrum, ...patch },
    fx: { ...DEFAULT_CONFIG.fx, ...extra?.fx },
    title: { ...DEFAULT_CONFIG.title, ...extra?.title },
    bg: { ...DEFAULT_CONFIG.bg, ...extra?.bg },
    progress: { ...DEFAULT_CONFIG.progress, ...extra?.progress },
    analysis: { ...DEFAULT_CONFIG.analysis, ...extra?.analysis }
  };
}
var BUILTIN_PRESETS = [
  {
    id: "bars",
    name: "\u9891\u8C31\u67F1",
    builtin: true,
    config: makeBuiltin("bars", {
      barCount: 64,
      mirror: false,
      glow: 0.5,
      roundness: 0.5,
      colorPrimary: "#D3FD50",
      colorSecondary: "#2b7fff"
    })
  },
  {
    id: "radial",
    name: "\u73AF\u5F62\u9891\u8C31",
    builtin: true,
    config: makeBuiltin("radial", {
      barCount: 72,
      glow: 0.6,
      mirror: true,
      lineWidth: 3,
      colorPrimary: "#ff6ec7",
      colorSecondary: "#7a5cff"
    })
  },
  {
    id: "waveform",
    name: "\u6CE2\u5F62\u7EBF",
    builtin: true,
    config: makeBuiltin("waveform", {
      barCount: 96,
      smoothing: 0.75,
      lineWidth: 3.5,
      mirror: true,
      glow: 0.7,
      colorPrimary: "#5ce1e6",
      colorSecondary: "#2b7fff"
    })
  },
  {
    id: "particles",
    name: "\u7C92\u5B50\u9891\u8C31",
    builtin: true,
    config: makeBuiltin(
      "particles",
      {
        barCount: 48,
        lineWidth: 4,
        glow: 0.8,
        colorPrimary: "#ffd166",
        colorSecondary: "#ff5c5c"
      },
      { fx: { ...DEFAULT_CONFIG.fx, particleCount: 90, particleIntensity: 0.8 } }
    )
  },
  {
    id: "studio",
    name: "\u6F14\u64AD\u5BA4",
    builtin: true,
    config: makeBuiltin(
      "studio",
      {
        // 复刻参考实现：46 柱、青蓝三段渐变、全圆角柱顶、峰值帽 + 倒影
        barCount: 46,
        sensitivity: 1.2,
        smoothing: 0.5,
        glow: 0.6,
        roundness: 0.9,
        colorPrimary: "#91D4FF",
        colorSecondary: "#C4E5FF",
        peakCaps: true,
        reflection: 0.6
      },
      { fx: { ...DEFAULT_CONFIG.fx, enabled: false } }
    )
  }
];

// node_modules/mp4-muxer/build/mp4-muxer.mjs
var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var __privateWrapper = (obj, member, setter, getter) => ({
  set _(value) {
    __privateSet(obj, member, value, setter);
  },
  get _() {
    return __privateGet(obj, member, getter);
  }
});
var __privateMethod = (obj, member, method) => {
  __accessCheck(obj, member, "access private method");
  return method;
};
var bytes = new Uint8Array(8);
var view = new DataView(bytes.buffer);
var u8 = (value) => {
  return [(value % 256 + 256) % 256];
};
var u16 = (value) => {
  view.setUint16(0, value, false);
  return [bytes[0], bytes[1]];
};
var i16 = (value) => {
  view.setInt16(0, value, false);
  return [bytes[0], bytes[1]];
};
var u24 = (value) => {
  view.setUint32(0, value, false);
  return [bytes[1], bytes[2], bytes[3]];
};
var u32 = (value) => {
  view.setUint32(0, value, false);
  return [bytes[0], bytes[1], bytes[2], bytes[3]];
};
var i32 = (value) => {
  view.setInt32(0, value, false);
  return [bytes[0], bytes[1], bytes[2], bytes[3]];
};
var u64 = (value) => {
  view.setUint32(0, Math.floor(value / 2 ** 32), false);
  view.setUint32(4, value, false);
  return [bytes[0], bytes[1], bytes[2], bytes[3], bytes[4], bytes[5], bytes[6], bytes[7]];
};
var fixed_8_8 = (value) => {
  view.setInt16(0, 2 ** 8 * value, false);
  return [bytes[0], bytes[1]];
};
var fixed_16_16 = (value) => {
  view.setInt32(0, 2 ** 16 * value, false);
  return [bytes[0], bytes[1], bytes[2], bytes[3]];
};
var fixed_2_30 = (value) => {
  view.setInt32(0, 2 ** 30 * value, false);
  return [bytes[0], bytes[1], bytes[2], bytes[3]];
};
var ascii = (text, nullTerminated = false) => {
  let bytes2 = Array(text.length).fill(null).map((_, i) => text.charCodeAt(i));
  if (nullTerminated)
    bytes2.push(0);
  return bytes2;
};
var last = (arr) => {
  return arr && arr[arr.length - 1];
};
var lastPresentedSample = (samples) => {
  let result = void 0;
  for (let sample of samples) {
    if (!result || sample.presentationTimestamp > result.presentationTimestamp) {
      result = sample;
    }
  }
  return result;
};
var intoTimescale = (timeInSeconds, timescale, round = true) => {
  let value = timeInSeconds * timescale;
  return round ? Math.round(value) : value;
};
var rotationMatrix = (rotationInDegrees) => {
  let theta = rotationInDegrees * (Math.PI / 180);
  let cosTheta = Math.cos(theta);
  let sinTheta = Math.sin(theta);
  return [
    cosTheta,
    sinTheta,
    0,
    -sinTheta,
    cosTheta,
    0,
    0,
    0,
    1
  ];
};
var IDENTITY_MATRIX = rotationMatrix(0);
var matrixToBytes = (matrix) => {
  return [
    fixed_16_16(matrix[0]),
    fixed_16_16(matrix[1]),
    fixed_2_30(matrix[2]),
    fixed_16_16(matrix[3]),
    fixed_16_16(matrix[4]),
    fixed_2_30(matrix[5]),
    fixed_16_16(matrix[6]),
    fixed_16_16(matrix[7]),
    fixed_2_30(matrix[8])
  ];
};
var deepClone = (x) => {
  if (!x)
    return x;
  if (typeof x !== "object")
    return x;
  if (Array.isArray(x))
    return x.map(deepClone);
  return Object.fromEntries(Object.entries(x).map(([key, value]) => [key, deepClone(value)]));
};
var isU32 = (value) => {
  return value >= 0 && value < 2 ** 32;
};
var box = (type, contents, children) => ({
  type,
  contents: contents && new Uint8Array(contents.flat(10)),
  children
});
var fullBox = (type, version, flags, contents, children) => box(
  type,
  [u8(version), u24(flags), contents ?? []],
  children
);
var ftyp = (details) => {
  let minorVersion = 512;
  if (details.fragmented)
    return box("ftyp", [
      ascii("iso5"),
      // Major brand
      u32(minorVersion),
      // Minor version
      // Compatible brands
      ascii("iso5"),
      ascii("iso6"),
      ascii("mp41")
    ]);
  return box("ftyp", [
    ascii("isom"),
    // Major brand
    u32(minorVersion),
    // Minor version
    // Compatible brands
    ascii("isom"),
    details.holdsAvc ? ascii("avc1") : [],
    ascii("mp41")
  ]);
};
var mdat = (reserveLargeSize) => ({ type: "mdat", largeSize: reserveLargeSize });
var free = (size) => ({ type: "free", size });
var moov = (tracks, creationTime, fragmented = false) => box("moov", null, [
  mvhd(creationTime, tracks),
  ...tracks.map((x) => trak(x, creationTime)),
  fragmented ? mvex(tracks) : null
]);
var mvhd = (creationTime, tracks) => {
  let duration = intoTimescale(Math.max(
    0,
    ...tracks.filter((x) => x.samples.length > 0).map((x) => {
      const lastSample = lastPresentedSample(x.samples);
      return lastSample.presentationTimestamp + lastSample.duration;
    })
  ), GLOBAL_TIMESCALE);
  let nextTrackId = Math.max(...tracks.map((x) => x.id)) + 1;
  let needsU64 = !isU32(creationTime) || !isU32(duration);
  let u32OrU64 = needsU64 ? u64 : u32;
  return fullBox("mvhd", +needsU64, 0, [
    u32OrU64(creationTime),
    // Creation time
    u32OrU64(creationTime),
    // Modification time
    u32(GLOBAL_TIMESCALE),
    // Timescale
    u32OrU64(duration),
    // Duration
    fixed_16_16(1),
    // Preferred rate
    fixed_8_8(1),
    // Preferred volume
    Array(10).fill(0),
    // Reserved
    matrixToBytes(IDENTITY_MATRIX),
    // Matrix
    Array(24).fill(0),
    // Pre-defined
    u32(nextTrackId)
    // Next track ID
  ]);
};
var trak = (track, creationTime) => box("trak", null, [
  tkhd(track, creationTime),
  mdia(track, creationTime)
]);
var tkhd = (track, creationTime) => {
  let lastSample = lastPresentedSample(track.samples);
  let durationInGlobalTimescale = intoTimescale(
    lastSample ? lastSample.presentationTimestamp + lastSample.duration : 0,
    GLOBAL_TIMESCALE
  );
  let needsU64 = !isU32(creationTime) || !isU32(durationInGlobalTimescale);
  let u32OrU64 = needsU64 ? u64 : u32;
  let matrix;
  if (track.info.type === "video") {
    matrix = typeof track.info.rotation === "number" ? rotationMatrix(track.info.rotation) : track.info.rotation;
  } else {
    matrix = IDENTITY_MATRIX;
  }
  return fullBox("tkhd", +needsU64, 3, [
    u32OrU64(creationTime),
    // Creation time
    u32OrU64(creationTime),
    // Modification time
    u32(track.id),
    // Track ID
    u32(0),
    // Reserved
    u32OrU64(durationInGlobalTimescale),
    // Duration
    Array(8).fill(0),
    // Reserved
    u16(0),
    // Layer
    u16(0),
    // Alternate group
    fixed_8_8(track.info.type === "audio" ? 1 : 0),
    // Volume
    u16(0),
    // Reserved
    matrixToBytes(matrix),
    // Matrix
    fixed_16_16(track.info.type === "video" ? track.info.width : 0),
    // Track width
    fixed_16_16(track.info.type === "video" ? track.info.height : 0)
    // Track height
  ]);
};
var mdia = (track, creationTime) => box("mdia", null, [
  mdhd(track, creationTime),
  hdlr(track.info.type === "video" ? "vide" : "soun"),
  minf(track)
]);
var mdhd = (track, creationTime) => {
  let lastSample = lastPresentedSample(track.samples);
  let localDuration = intoTimescale(
    lastSample ? lastSample.presentationTimestamp + lastSample.duration : 0,
    track.timescale
  );
  let needsU64 = !isU32(creationTime) || !isU32(localDuration);
  let u32OrU64 = needsU64 ? u64 : u32;
  return fullBox("mdhd", +needsU64, 0, [
    u32OrU64(creationTime),
    // Creation time
    u32OrU64(creationTime),
    // Modification time
    u32(track.timescale),
    // Timescale
    u32OrU64(localDuration),
    // Duration
    u16(21956),
    // Language ("und", undetermined)
    u16(0)
    // Quality
  ]);
};
var hdlr = (componentSubtype) => fullBox("hdlr", 0, 0, [
  ascii("mhlr"),
  // Component type
  ascii(componentSubtype),
  // Component subtype
  u32(0),
  // Component manufacturer
  u32(0),
  // Component flags
  u32(0),
  // Component flags mask
  ascii("mp4-muxer-hdlr", true)
  // Component name
]);
var minf = (track) => box("minf", null, [
  track.info.type === "video" ? vmhd() : smhd(),
  dinf(),
  stbl(track)
]);
var vmhd = () => fullBox("vmhd", 0, 1, [
  u16(0),
  // Graphics mode
  u16(0),
  // Opcolor R
  u16(0),
  // Opcolor G
  u16(0)
  // Opcolor B
]);
var smhd = () => fullBox("smhd", 0, 0, [
  u16(0),
  // Balance
  u16(0)
  // Reserved
]);
var dinf = () => box("dinf", null, [
  dref()
]);
var dref = () => fullBox("dref", 0, 0, [
  u32(1)
  // Entry count
], [
  url()
]);
var url = () => fullBox("url ", 0, 1);
var stbl = (track) => {
  const needsCtts = track.compositionTimeOffsetTable.length > 1 || track.compositionTimeOffsetTable.some((x) => x.sampleCompositionTimeOffset !== 0);
  return box("stbl", null, [
    stsd(track),
    stts(track),
    stss(track),
    stsc(track),
    stsz(track),
    stco(track),
    needsCtts ? ctts(track) : null
  ]);
};
var stsd = (track) => fullBox("stsd", 0, 0, [
  u32(1)
  // Entry count
], [
  track.info.type === "video" ? videoSampleDescription(
    VIDEO_CODEC_TO_BOX_NAME[track.info.codec],
    track
  ) : soundSampleDescription(
    AUDIO_CODEC_TO_BOX_NAME[track.info.codec],
    track
  )
]);
var videoSampleDescription = (compressionType, track) => box(compressionType, [
  Array(6).fill(0),
  // Reserved
  u16(1),
  // Data reference index
  u16(0),
  // Pre-defined
  u16(0),
  // Reserved
  Array(12).fill(0),
  // Pre-defined
  u16(track.info.width),
  // Width
  u16(track.info.height),
  // Height
  u32(4718592),
  // Horizontal resolution
  u32(4718592),
  // Vertical resolution
  u32(0),
  // Reserved
  u16(1),
  // Frame count
  Array(32).fill(0),
  // Compressor name
  u16(24),
  // Depth
  i16(65535)
  // Pre-defined
], [
  VIDEO_CODEC_TO_CONFIGURATION_BOX[track.info.codec](track),
  track.info.decoderConfig.colorSpace ? colr(track) : null
]);
var COLOR_PRIMARIES_MAP = {
  "bt709": 1,
  // ITU-R BT.709
  "bt470bg": 5,
  // ITU-R BT.470BG
  "smpte170m": 6
  // ITU-R BT.601 525 - SMPTE 170M
};
var TRANSFER_CHARACTERISTICS_MAP = {
  "bt709": 1,
  // ITU-R BT.709
  "smpte170m": 6,
  // SMPTE 170M
  "iec61966-2-1": 13
  // IEC 61966-2-1
};
var MATRIX_COEFFICIENTS_MAP = {
  "rgb": 0,
  // Identity
  "bt709": 1,
  // ITU-R BT.709
  "bt470bg": 5,
  // ITU-R BT.470BG
  "smpte170m": 6
  // SMPTE 170M
};
var colr = (track) => box("colr", [
  ascii("nclx"),
  // Colour type
  u16(COLOR_PRIMARIES_MAP[track.info.decoderConfig.colorSpace.primaries]),
  // Colour primaries
  u16(TRANSFER_CHARACTERISTICS_MAP[track.info.decoderConfig.colorSpace.transfer]),
  // Transfer characteristics
  u16(MATRIX_COEFFICIENTS_MAP[track.info.decoderConfig.colorSpace.matrix]),
  // Matrix coefficients
  u8((track.info.decoderConfig.colorSpace.fullRange ? 1 : 0) << 7)
  // Full range flag
]);
var avcC = (track) => track.info.decoderConfig && box("avcC", [
  // For AVC, description is an AVCDecoderConfigurationRecord, so nothing else to do here
  ...new Uint8Array(track.info.decoderConfig.description)
]);
var hvcC = (track) => track.info.decoderConfig && box("hvcC", [
  // For HEVC, description is a HEVCDecoderConfigurationRecord, so nothing else to do here
  ...new Uint8Array(track.info.decoderConfig.description)
]);
var vpcC = (track) => {
  if (!track.info.decoderConfig) {
    return null;
  }
  let decoderConfig = track.info.decoderConfig;
  if (!decoderConfig.colorSpace) {
    throw new Error(`'colorSpace' is required in the decoder config for VP9.`);
  }
  let parts = decoderConfig.codec.split(".");
  let profile = Number(parts[1]);
  let level = Number(parts[2]);
  let bitDepth = Number(parts[3]);
  let chromaSubsampling = 0;
  let thirdByte = (bitDepth << 4) + (chromaSubsampling << 1) + Number(decoderConfig.colorSpace.fullRange);
  let colourPrimaries = 2;
  let transferCharacteristics = 2;
  let matrixCoefficients = 2;
  return fullBox("vpcC", 1, 0, [
    u8(profile),
    // Profile
    u8(level),
    // Level
    u8(thirdByte),
    // Bit depth, chroma subsampling, full range
    u8(colourPrimaries),
    // Colour primaries
    u8(transferCharacteristics),
    // Transfer characteristics
    u8(matrixCoefficients),
    // Matrix coefficients
    u16(0)
    // Codec initialization data size
  ]);
};
var av1C = () => {
  let marker = 1;
  let version = 1;
  let firstByte = (marker << 7) + version;
  return box("av1C", [
    firstByte,
    0,
    0,
    0
  ]);
};
var soundSampleDescription = (compressionType, track) => box(compressionType, [
  Array(6).fill(0),
  // Reserved
  u16(1),
  // Data reference index
  u16(0),
  // Version
  u16(0),
  // Revision level
  u32(0),
  // Vendor
  u16(track.info.numberOfChannels),
  // Number of channels
  u16(16),
  // Sample size (bits)
  u16(0),
  // Compression ID
  u16(0),
  // Packet size
  fixed_16_16(track.info.sampleRate)
  // Sample rate
], [
  AUDIO_CODEC_TO_CONFIGURATION_BOX[track.info.codec](track)
]);
var esds = (track) => {
  let description = new Uint8Array(track.info.decoderConfig.description);
  return fullBox("esds", 0, 0, [
    // https://stackoverflow.com/a/54803118
    u32(58753152),
    // TAG(3) = Object Descriptor ([2])
    u8(32 + description.byteLength),
    // length of this OD (which includes the next 2 tags)
    u16(1),
    // ES_ID = 1
    u8(0),
    // flags etc = 0
    u32(75530368),
    // TAG(4) = ES Descriptor ([2]) embedded in above OD
    u8(18 + description.byteLength),
    // length of this ESD
    u8(64),
    // MPEG-4 Audio
    u8(21),
    // stream type(6bits)=5 audio, flags(2bits)=1
    u24(0),
    // 24bit buffer size
    u32(130071),
    // max bitrate
    u32(130071),
    // avg bitrate
    u32(92307584),
    // TAG(5) = ASC ([2],[3]) embedded in above OD
    u8(description.byteLength),
    // length
    ...description,
    u32(109084800),
    // TAG(6)
    u8(1),
    // length
    u8(2)
    // data
  ]);
};
var dOps = (track) => {
  let preskip = 3840;
  let gain = 0;
  const description = track.info.decoderConfig?.description;
  if (description) {
    if (description.byteLength < 18) {
      throw new TypeError("Invalid decoder description provided for Opus; must be at least 18 bytes long.");
    }
    const view2 = ArrayBuffer.isView(description) ? new DataView(description.buffer, description.byteOffset, description.byteLength) : new DataView(description);
    preskip = view2.getUint16(10, true);
    gain = view2.getInt16(14, true);
  }
  return box("dOps", [
    u8(0),
    // Version
    u8(track.info.numberOfChannels),
    // OutputChannelCount
    u16(preskip),
    u32(track.info.sampleRate),
    // InputSampleRate
    fixed_8_8(gain),
    // OutputGain
    u8(0)
    // ChannelMappingFamily
  ]);
};
var stts = (track) => {
  return fullBox("stts", 0, 0, [
    u32(track.timeToSampleTable.length),
    // Number of entries
    track.timeToSampleTable.map((x) => [
      // Time-to-sample table
      u32(x.sampleCount),
      // Sample count
      u32(x.sampleDelta)
      // Sample duration
    ])
  ]);
};
var stss = (track) => {
  if (track.samples.every((x) => x.type === "key"))
    return null;
  let keySamples = [...track.samples.entries()].filter(([, sample]) => sample.type === "key");
  return fullBox("stss", 0, 0, [
    u32(keySamples.length),
    // Number of entries
    keySamples.map(([index]) => u32(index + 1))
    // Sync sample table
  ]);
};
var stsc = (track) => {
  return fullBox("stsc", 0, 0, [
    u32(track.compactlyCodedChunkTable.length),
    // Number of entries
    track.compactlyCodedChunkTable.map((x) => [
      // Sample-to-chunk table
      u32(x.firstChunk),
      // First chunk
      u32(x.samplesPerChunk),
      // Samples per chunk
      u32(1)
      // Sample description index
    ])
  ]);
};
var stsz = (track) => fullBox("stsz", 0, 0, [
  u32(0),
  // Sample size (0 means non-constant size)
  u32(track.samples.length),
  // Number of entries
  track.samples.map((x) => u32(x.size))
  // Sample size table
]);
var stco = (track) => {
  if (track.finalizedChunks.length > 0 && last(track.finalizedChunks).offset >= 2 ** 32) {
    return fullBox("co64", 0, 0, [
      u32(track.finalizedChunks.length),
      // Number of entries
      track.finalizedChunks.map((x) => u64(x.offset))
      // Chunk offset table
    ]);
  }
  return fullBox("stco", 0, 0, [
    u32(track.finalizedChunks.length),
    // Number of entries
    track.finalizedChunks.map((x) => u32(x.offset))
    // Chunk offset table
  ]);
};
var ctts = (track) => {
  return fullBox("ctts", 0, 0, [
    u32(track.compositionTimeOffsetTable.length),
    // Number of entries
    track.compositionTimeOffsetTable.map((x) => [
      // Time-to-sample table
      u32(x.sampleCount),
      // Sample count
      u32(x.sampleCompositionTimeOffset)
      // Sample offset
    ])
  ]);
};
var mvex = (tracks) => {
  return box("mvex", null, tracks.map(trex));
};
var trex = (track) => {
  return fullBox("trex", 0, 0, [
    u32(track.id),
    // Track ID
    u32(1),
    // Default sample description index
    u32(0),
    // Default sample duration
    u32(0),
    // Default sample size
    u32(0)
    // Default sample flags
  ]);
};
var moof = (sequenceNumber, tracks) => {
  return box("moof", null, [
    mfhd(sequenceNumber),
    ...tracks.map(traf)
  ]);
};
var mfhd = (sequenceNumber) => {
  return fullBox("mfhd", 0, 0, [
    u32(sequenceNumber)
    // Sequence number
  ]);
};
var fragmentSampleFlags = (sample) => {
  let byte1 = 0;
  let byte2 = 0;
  let byte3 = 0;
  let byte4 = 0;
  let sampleIsDifferenceSample = sample.type === "delta";
  byte2 |= +sampleIsDifferenceSample;
  if (sampleIsDifferenceSample) {
    byte1 |= 1;
  } else {
    byte1 |= 2;
  }
  return byte1 << 24 | byte2 << 16 | byte3 << 8 | byte4;
};
var traf = (track) => {
  return box("traf", null, [
    tfhd(track),
    tfdt(track),
    trun(track)
  ]);
};
var tfhd = (track) => {
  let tfFlags = 0;
  tfFlags |= 8;
  tfFlags |= 16;
  tfFlags |= 32;
  tfFlags |= 131072;
  let referenceSample = track.currentChunk.samples[1] ?? track.currentChunk.samples[0];
  let referenceSampleInfo = {
    duration: referenceSample.timescaleUnitsToNextSample,
    size: referenceSample.size,
    flags: fragmentSampleFlags(referenceSample)
  };
  return fullBox("tfhd", 0, tfFlags, [
    u32(track.id),
    // Track ID
    u32(referenceSampleInfo.duration),
    // Default sample duration
    u32(referenceSampleInfo.size),
    // Default sample size
    u32(referenceSampleInfo.flags)
    // Default sample flags
  ]);
};
var tfdt = (track) => {
  return fullBox("tfdt", 1, 0, [
    u64(intoTimescale(track.currentChunk.startTimestamp, track.timescale))
    // Base Media Decode Time
  ]);
};
var trun = (track) => {
  let allSampleDurations = track.currentChunk.samples.map((x) => x.timescaleUnitsToNextSample);
  let allSampleSizes = track.currentChunk.samples.map((x) => x.size);
  let allSampleFlags = track.currentChunk.samples.map(fragmentSampleFlags);
  let allSampleCompositionTimeOffsets = track.currentChunk.samples.map((x) => intoTimescale(x.presentationTimestamp - x.decodeTimestamp, track.timescale));
  let uniqueSampleDurations = new Set(allSampleDurations);
  let uniqueSampleSizes = new Set(allSampleSizes);
  let uniqueSampleFlags = new Set(allSampleFlags);
  let uniqueSampleCompositionTimeOffsets = new Set(allSampleCompositionTimeOffsets);
  let firstSampleFlagsPresent = uniqueSampleFlags.size === 2 && allSampleFlags[0] !== allSampleFlags[1];
  let sampleDurationPresent = uniqueSampleDurations.size > 1;
  let sampleSizePresent = uniqueSampleSizes.size > 1;
  let sampleFlagsPresent = !firstSampleFlagsPresent && uniqueSampleFlags.size > 1;
  let sampleCompositionTimeOffsetsPresent = uniqueSampleCompositionTimeOffsets.size > 1 || [...uniqueSampleCompositionTimeOffsets].some((x) => x !== 0);
  let flags = 0;
  flags |= 1;
  flags |= 4 * +firstSampleFlagsPresent;
  flags |= 256 * +sampleDurationPresent;
  flags |= 512 * +sampleSizePresent;
  flags |= 1024 * +sampleFlagsPresent;
  flags |= 2048 * +sampleCompositionTimeOffsetsPresent;
  return fullBox("trun", 1, flags, [
    u32(track.currentChunk.samples.length),
    // Sample count
    u32(track.currentChunk.offset - track.currentChunk.moofOffset || 0),
    // Data offset
    firstSampleFlagsPresent ? u32(allSampleFlags[0]) : [],
    track.currentChunk.samples.map((_, i) => [
      sampleDurationPresent ? u32(allSampleDurations[i]) : [],
      // Sample duration
      sampleSizePresent ? u32(allSampleSizes[i]) : [],
      // Sample size
      sampleFlagsPresent ? u32(allSampleFlags[i]) : [],
      // Sample flags
      // Sample composition time offsets
      sampleCompositionTimeOffsetsPresent ? i32(allSampleCompositionTimeOffsets[i]) : []
    ])
  ]);
};
var mfra = (tracks) => {
  return box("mfra", null, [
    ...tracks.map(tfra),
    mfro()
  ]);
};
var tfra = (track, trackIndex) => {
  let version = 1;
  return fullBox("tfra", version, 0, [
    u32(track.id),
    // Track ID
    u32(63),
    // This specifies that traf number, trun number and sample number are 32-bit ints
    u32(track.finalizedChunks.length),
    // Number of entries
    track.finalizedChunks.map((chunk) => [
      u64(intoTimescale(chunk.startTimestamp, track.timescale)),
      // Time
      u64(chunk.moofOffset),
      // moof offset
      u32(trackIndex + 1),
      // traf number
      u32(1),
      // trun number
      u32(1)
      // Sample number
    ])
  ]);
};
var mfro = () => {
  return fullBox("mfro", 0, 0, [
    // This value needs to be overwritten manually from the outside, where the actual size of the enclosing mfra box
    // is known
    u32(0)
    // Size
  ]);
};
var VIDEO_CODEC_TO_BOX_NAME = {
  "avc": "avc1",
  "hevc": "hvc1",
  "vp9": "vp09",
  "av1": "av01"
};
var VIDEO_CODEC_TO_CONFIGURATION_BOX = {
  "avc": avcC,
  "hevc": hvcC,
  "vp9": vpcC,
  "av1": av1C
};
var AUDIO_CODEC_TO_BOX_NAME = {
  "aac": "mp4a",
  "opus": "Opus"
};
var AUDIO_CODEC_TO_CONFIGURATION_BOX = {
  "aac": esds,
  "opus": dOps
};
var Target = class {
};
var ArrayBufferTarget = class extends Target {
  constructor() {
    super(...arguments);
    this.buffer = null;
  }
};
var StreamTarget = class extends Target {
  constructor(options) {
    super();
    this.options = options;
    if (typeof options !== "object") {
      throw new TypeError("StreamTarget requires an options object to be passed to its constructor.");
    }
    if (options.onData) {
      if (typeof options.onData !== "function") {
        throw new TypeError("options.onData, when provided, must be a function.");
      }
      if (options.onData.length < 2) {
        throw new TypeError(
          "options.onData, when provided, must be a function that takes in at least two arguments (data and position). Ignoring the position argument, which specifies the byte offset at which the data is to be written, can lead to broken outputs."
        );
      }
    }
    if (options.chunked !== void 0 && typeof options.chunked !== "boolean") {
      throw new TypeError("options.chunked, when provided, must be a boolean.");
    }
    if (options.chunkSize !== void 0 && (!Number.isInteger(options.chunkSize) || options.chunkSize < 1024)) {
      throw new TypeError("options.chunkSize, when provided, must be an integer and not smaller than 1024.");
    }
  }
};
var FileSystemWritableFileStreamTarget = class extends Target {
  constructor(stream, options) {
    super();
    this.stream = stream;
    this.options = options;
    if (!(stream instanceof FileSystemWritableFileStream)) {
      throw new TypeError("FileSystemWritableFileStreamTarget requires a FileSystemWritableFileStream instance.");
    }
    if (options !== void 0 && typeof options !== "object") {
      throw new TypeError("FileSystemWritableFileStreamTarget's options, when provided, must be an object.");
    }
    if (options) {
      if (options.chunkSize !== void 0 && (!Number.isInteger(options.chunkSize) || options.chunkSize <= 0)) {
        throw new TypeError("options.chunkSize, when provided, must be a positive integer");
      }
    }
  }
};
var _helper;
var _helperView;
var Writer = class {
  constructor() {
    this.pos = 0;
    __privateAdd(this, _helper, new Uint8Array(8));
    __privateAdd(this, _helperView, new DataView(__privateGet(this, _helper).buffer));
    this.offsets = /* @__PURE__ */ new WeakMap();
  }
  /** Sets the current position for future writes to a new one. */
  seek(newPos) {
    this.pos = newPos;
  }
  writeU32(value) {
    __privateGet(this, _helperView).setUint32(0, value, false);
    this.write(__privateGet(this, _helper).subarray(0, 4));
  }
  writeU64(value) {
    __privateGet(this, _helperView).setUint32(0, Math.floor(value / 2 ** 32), false);
    __privateGet(this, _helperView).setUint32(4, value, false);
    this.write(__privateGet(this, _helper).subarray(0, 8));
  }
  writeAscii(text) {
    for (let i = 0; i < text.length; i++) {
      __privateGet(this, _helperView).setUint8(i % 8, text.charCodeAt(i));
      if (i % 8 === 7)
        this.write(__privateGet(this, _helper));
    }
    if (text.length % 8 !== 0) {
      this.write(__privateGet(this, _helper).subarray(0, text.length % 8));
    }
  }
  writeBox(box2) {
    this.offsets.set(box2, this.pos);
    if (box2.contents && !box2.children) {
      this.writeBoxHeader(box2, box2.size ?? box2.contents.byteLength + 8);
      this.write(box2.contents);
    } else {
      let startPos = this.pos;
      this.writeBoxHeader(box2, 0);
      if (box2.contents)
        this.write(box2.contents);
      if (box2.children) {
        for (let child of box2.children)
          if (child)
            this.writeBox(child);
      }
      let endPos = this.pos;
      let size = box2.size ?? endPos - startPos;
      this.seek(startPos);
      this.writeBoxHeader(box2, size);
      this.seek(endPos);
    }
  }
  writeBoxHeader(box2, size) {
    this.writeU32(box2.largeSize ? 1 : size);
    this.writeAscii(box2.type);
    if (box2.largeSize)
      this.writeU64(size);
  }
  measureBoxHeader(box2) {
    return 8 + (box2.largeSize ? 8 : 0);
  }
  patchBox(box2) {
    let endPos = this.pos;
    this.seek(this.offsets.get(box2));
    this.writeBox(box2);
    this.seek(endPos);
  }
  measureBox(box2) {
    if (box2.contents && !box2.children) {
      let headerSize = this.measureBoxHeader(box2);
      return headerSize + box2.contents.byteLength;
    } else {
      let result = this.measureBoxHeader(box2);
      if (box2.contents)
        result += box2.contents.byteLength;
      if (box2.children) {
        for (let child of box2.children)
          if (child)
            result += this.measureBox(child);
      }
      return result;
    }
  }
};
_helper = /* @__PURE__ */ new WeakMap();
_helperView = /* @__PURE__ */ new WeakMap();
var _target;
var _buffer;
var _bytes;
var _maxPos;
var _ensureSize;
var ensureSize_fn;
var ArrayBufferTargetWriter = class extends Writer {
  constructor(target) {
    super();
    __privateAdd(this, _ensureSize);
    __privateAdd(this, _target, void 0);
    __privateAdd(this, _buffer, new ArrayBuffer(2 ** 16));
    __privateAdd(this, _bytes, new Uint8Array(__privateGet(this, _buffer)));
    __privateAdd(this, _maxPos, 0);
    __privateSet(this, _target, target);
  }
  write(data) {
    __privateMethod(this, _ensureSize, ensureSize_fn).call(this, this.pos + data.byteLength);
    __privateGet(this, _bytes).set(data, this.pos);
    this.pos += data.byteLength;
    __privateSet(this, _maxPos, Math.max(__privateGet(this, _maxPos), this.pos));
  }
  finalize() {
    __privateMethod(this, _ensureSize, ensureSize_fn).call(this, this.pos);
    __privateGet(this, _target).buffer = __privateGet(this, _buffer).slice(0, Math.max(__privateGet(this, _maxPos), this.pos));
  }
};
_target = /* @__PURE__ */ new WeakMap();
_buffer = /* @__PURE__ */ new WeakMap();
_bytes = /* @__PURE__ */ new WeakMap();
_maxPos = /* @__PURE__ */ new WeakMap();
_ensureSize = /* @__PURE__ */ new WeakSet();
ensureSize_fn = function(size) {
  let newLength = __privateGet(this, _buffer).byteLength;
  while (newLength < size)
    newLength *= 2;
  if (newLength === __privateGet(this, _buffer).byteLength)
    return;
  let newBuffer = new ArrayBuffer(newLength);
  let newBytes = new Uint8Array(newBuffer);
  newBytes.set(__privateGet(this, _bytes), 0);
  __privateSet(this, _buffer, newBuffer);
  __privateSet(this, _bytes, newBytes);
};
var DEFAULT_CHUNK_SIZE = 2 ** 24;
var MAX_CHUNKS_AT_ONCE = 2;
var _target2;
var _sections;
var _chunked;
var _chunkSize;
var _chunks;
var _writeDataIntoChunks;
var writeDataIntoChunks_fn;
var _insertSectionIntoChunk;
var insertSectionIntoChunk_fn;
var _createChunk;
var createChunk_fn;
var _flushChunks;
var flushChunks_fn;
var StreamTargetWriter = class extends Writer {
  constructor(target) {
    super();
    __privateAdd(this, _writeDataIntoChunks);
    __privateAdd(this, _insertSectionIntoChunk);
    __privateAdd(this, _createChunk);
    __privateAdd(this, _flushChunks);
    __privateAdd(this, _target2, void 0);
    __privateAdd(this, _sections, []);
    __privateAdd(this, _chunked, void 0);
    __privateAdd(this, _chunkSize, void 0);
    __privateAdd(this, _chunks, []);
    __privateSet(this, _target2, target);
    __privateSet(this, _chunked, target.options?.chunked ?? false);
    __privateSet(this, _chunkSize, target.options?.chunkSize ?? DEFAULT_CHUNK_SIZE);
  }
  write(data) {
    __privateGet(this, _sections).push({
      data: data.slice(),
      start: this.pos
    });
    this.pos += data.byteLength;
  }
  flush() {
    if (__privateGet(this, _sections).length === 0)
      return;
    let chunks = [];
    let sorted = [...__privateGet(this, _sections)].sort((a, b) => a.start - b.start);
    chunks.push({
      start: sorted[0].start,
      size: sorted[0].data.byteLength
    });
    for (let i = 1; i < sorted.length; i++) {
      let lastChunk = chunks[chunks.length - 1];
      let section = sorted[i];
      if (section.start <= lastChunk.start + lastChunk.size) {
        lastChunk.size = Math.max(lastChunk.size, section.start + section.data.byteLength - lastChunk.start);
      } else {
        chunks.push({
          start: section.start,
          size: section.data.byteLength
        });
      }
    }
    for (let chunk of chunks) {
      chunk.data = new Uint8Array(chunk.size);
      for (let section of __privateGet(this, _sections)) {
        if (chunk.start <= section.start && section.start < chunk.start + chunk.size) {
          chunk.data.set(section.data, section.start - chunk.start);
        }
      }
      if (__privateGet(this, _chunked)) {
        __privateMethod(this, _writeDataIntoChunks, writeDataIntoChunks_fn).call(this, chunk.data, chunk.start);
        __privateMethod(this, _flushChunks, flushChunks_fn).call(this);
      } else {
        __privateGet(this, _target2).options.onData?.(chunk.data, chunk.start);
      }
    }
    __privateGet(this, _sections).length = 0;
  }
  finalize() {
    if (__privateGet(this, _chunked)) {
      __privateMethod(this, _flushChunks, flushChunks_fn).call(this, true);
    }
  }
};
_target2 = /* @__PURE__ */ new WeakMap();
_sections = /* @__PURE__ */ new WeakMap();
_chunked = /* @__PURE__ */ new WeakMap();
_chunkSize = /* @__PURE__ */ new WeakMap();
_chunks = /* @__PURE__ */ new WeakMap();
_writeDataIntoChunks = /* @__PURE__ */ new WeakSet();
writeDataIntoChunks_fn = function(data, position) {
  let chunkIndex = __privateGet(this, _chunks).findIndex((x) => x.start <= position && position < x.start + __privateGet(this, _chunkSize));
  if (chunkIndex === -1)
    chunkIndex = __privateMethod(this, _createChunk, createChunk_fn).call(this, position);
  let chunk = __privateGet(this, _chunks)[chunkIndex];
  let relativePosition = position - chunk.start;
  let toWrite = data.subarray(0, Math.min(__privateGet(this, _chunkSize) - relativePosition, data.byteLength));
  chunk.data.set(toWrite, relativePosition);
  let section = {
    start: relativePosition,
    end: relativePosition + toWrite.byteLength
  };
  __privateMethod(this, _insertSectionIntoChunk, insertSectionIntoChunk_fn).call(this, chunk, section);
  if (chunk.written[0].start === 0 && chunk.written[0].end === __privateGet(this, _chunkSize)) {
    chunk.shouldFlush = true;
  }
  if (__privateGet(this, _chunks).length > MAX_CHUNKS_AT_ONCE) {
    for (let i = 0; i < __privateGet(this, _chunks).length - 1; i++) {
      __privateGet(this, _chunks)[i].shouldFlush = true;
    }
    __privateMethod(this, _flushChunks, flushChunks_fn).call(this);
  }
  if (toWrite.byteLength < data.byteLength) {
    __privateMethod(this, _writeDataIntoChunks, writeDataIntoChunks_fn).call(this, data.subarray(toWrite.byteLength), position + toWrite.byteLength);
  }
};
_insertSectionIntoChunk = /* @__PURE__ */ new WeakSet();
insertSectionIntoChunk_fn = function(chunk, section) {
  let low = 0;
  let high = chunk.written.length - 1;
  let index = -1;
  while (low <= high) {
    let mid = Math.floor(low + (high - low + 1) / 2);
    if (chunk.written[mid].start <= section.start) {
      low = mid + 1;
      index = mid;
    } else {
      high = mid - 1;
    }
  }
  chunk.written.splice(index + 1, 0, section);
  if (index === -1 || chunk.written[index].end < section.start)
    index++;
  while (index < chunk.written.length - 1 && chunk.written[index].end >= chunk.written[index + 1].start) {
    chunk.written[index].end = Math.max(chunk.written[index].end, chunk.written[index + 1].end);
    chunk.written.splice(index + 1, 1);
  }
};
_createChunk = /* @__PURE__ */ new WeakSet();
createChunk_fn = function(includesPosition) {
  let start = Math.floor(includesPosition / __privateGet(this, _chunkSize)) * __privateGet(this, _chunkSize);
  let chunk = {
    start,
    data: new Uint8Array(__privateGet(this, _chunkSize)),
    written: [],
    shouldFlush: false
  };
  __privateGet(this, _chunks).push(chunk);
  __privateGet(this, _chunks).sort((a, b) => a.start - b.start);
  return __privateGet(this, _chunks).indexOf(chunk);
};
_flushChunks = /* @__PURE__ */ new WeakSet();
flushChunks_fn = function(force = false) {
  for (let i = 0; i < __privateGet(this, _chunks).length; i++) {
    let chunk = __privateGet(this, _chunks)[i];
    if (!chunk.shouldFlush && !force)
      continue;
    for (let section of chunk.written) {
      __privateGet(this, _target2).options.onData?.(
        chunk.data.subarray(section.start, section.end),
        chunk.start + section.start
      );
    }
    __privateGet(this, _chunks).splice(i--, 1);
  }
};
var FileSystemWritableFileStreamTargetWriter = class extends StreamTargetWriter {
  constructor(target) {
    super(new StreamTarget({
      onData: (data, position) => target.stream.write({
        type: "write",
        data,
        position
      }),
      chunked: true,
      chunkSize: target.options?.chunkSize
    }));
  }
};
var GLOBAL_TIMESCALE = 1e3;
var SUPPORTED_VIDEO_CODECS = ["avc", "hevc", "vp9", "av1"];
var SUPPORTED_AUDIO_CODECS = ["aac", "opus"];
var TIMESTAMP_OFFSET = 2082844800;
var FIRST_TIMESTAMP_BEHAVIORS = ["strict", "offset", "cross-track-offset"];
var _options;
var _writer;
var _ftypSize;
var _mdat;
var _videoTrack;
var _audioTrack;
var _creationTime;
var _finalizedChunks;
var _nextFragmentNumber;
var _videoSampleQueue;
var _audioSampleQueue;
var _finalized;
var _validateOptions;
var validateOptions_fn;
var _writeHeader;
var writeHeader_fn;
var _computeMoovSizeUpperBound;
var computeMoovSizeUpperBound_fn;
var _prepareTracks;
var prepareTracks_fn;
var _generateMpeg4AudioSpecificConfig;
var generateMpeg4AudioSpecificConfig_fn;
var _createSampleForTrack;
var createSampleForTrack_fn;
var _addSampleToTrack;
var addSampleToTrack_fn;
var _validateTimestamp;
var validateTimestamp_fn;
var _finalizeCurrentChunk;
var finalizeCurrentChunk_fn;
var _finalizeFragment;
var finalizeFragment_fn;
var _maybeFlushStreamingTargetWriter;
var maybeFlushStreamingTargetWriter_fn;
var _ensureNotFinalized;
var ensureNotFinalized_fn;
var Muxer = class {
  constructor(options) {
    __privateAdd(this, _validateOptions);
    __privateAdd(this, _writeHeader);
    __privateAdd(this, _computeMoovSizeUpperBound);
    __privateAdd(this, _prepareTracks);
    __privateAdd(this, _generateMpeg4AudioSpecificConfig);
    __privateAdd(this, _createSampleForTrack);
    __privateAdd(this, _addSampleToTrack);
    __privateAdd(this, _validateTimestamp);
    __privateAdd(this, _finalizeCurrentChunk);
    __privateAdd(this, _finalizeFragment);
    __privateAdd(this, _maybeFlushStreamingTargetWriter);
    __privateAdd(this, _ensureNotFinalized);
    __privateAdd(this, _options, void 0);
    __privateAdd(this, _writer, void 0);
    __privateAdd(this, _ftypSize, void 0);
    __privateAdd(this, _mdat, void 0);
    __privateAdd(this, _videoTrack, null);
    __privateAdd(this, _audioTrack, null);
    __privateAdd(this, _creationTime, Math.floor(Date.now() / 1e3) + TIMESTAMP_OFFSET);
    __privateAdd(this, _finalizedChunks, []);
    __privateAdd(this, _nextFragmentNumber, 1);
    __privateAdd(this, _videoSampleQueue, []);
    __privateAdd(this, _audioSampleQueue, []);
    __privateAdd(this, _finalized, false);
    __privateMethod(this, _validateOptions, validateOptions_fn).call(this, options);
    options.video = deepClone(options.video);
    options.audio = deepClone(options.audio);
    options.fastStart = deepClone(options.fastStart);
    this.target = options.target;
    __privateSet(this, _options, {
      firstTimestampBehavior: "strict",
      ...options
    });
    if (options.target instanceof ArrayBufferTarget) {
      __privateSet(this, _writer, new ArrayBufferTargetWriter(options.target));
    } else if (options.target instanceof StreamTarget) {
      __privateSet(this, _writer, new StreamTargetWriter(options.target));
    } else if (options.target instanceof FileSystemWritableFileStreamTarget) {
      __privateSet(this, _writer, new FileSystemWritableFileStreamTargetWriter(options.target));
    } else {
      throw new Error(`Invalid target: ${options.target}`);
    }
    __privateMethod(this, _prepareTracks, prepareTracks_fn).call(this);
    __privateMethod(this, _writeHeader, writeHeader_fn).call(this);
  }
  addVideoChunk(sample, meta, timestamp, compositionTimeOffset) {
    if (!(sample instanceof EncodedVideoChunk)) {
      throw new TypeError("addVideoChunk's first argument (sample) must be of type EncodedVideoChunk.");
    }
    if (meta && typeof meta !== "object") {
      throw new TypeError("addVideoChunk's second argument (meta), when provided, must be an object.");
    }
    if (timestamp !== void 0 && (!Number.isFinite(timestamp) || timestamp < 0)) {
      throw new TypeError(
        "addVideoChunk's third argument (timestamp), when provided, must be a non-negative real number."
      );
    }
    if (compositionTimeOffset !== void 0 && !Number.isFinite(compositionTimeOffset)) {
      throw new TypeError(
        "addVideoChunk's fourth argument (compositionTimeOffset), when provided, must be a real number."
      );
    }
    let data = new Uint8Array(sample.byteLength);
    sample.copyTo(data);
    this.addVideoChunkRaw(
      data,
      sample.type,
      timestamp ?? sample.timestamp,
      sample.duration,
      meta,
      compositionTimeOffset
    );
  }
  addVideoChunkRaw(data, type, timestamp, duration, meta, compositionTimeOffset) {
    if (!(data instanceof Uint8Array)) {
      throw new TypeError("addVideoChunkRaw's first argument (data) must be an instance of Uint8Array.");
    }
    if (type !== "key" && type !== "delta") {
      throw new TypeError("addVideoChunkRaw's second argument (type) must be either 'key' or 'delta'.");
    }
    if (!Number.isFinite(timestamp) || timestamp < 0) {
      throw new TypeError("addVideoChunkRaw's third argument (timestamp) must be a non-negative real number.");
    }
    if (!Number.isFinite(duration) || duration < 0) {
      throw new TypeError("addVideoChunkRaw's fourth argument (duration) must be a non-negative real number.");
    }
    if (meta && typeof meta !== "object") {
      throw new TypeError("addVideoChunkRaw's fifth argument (meta), when provided, must be an object.");
    }
    if (compositionTimeOffset !== void 0 && !Number.isFinite(compositionTimeOffset)) {
      throw new TypeError(
        "addVideoChunkRaw's sixth argument (compositionTimeOffset), when provided, must be a real number."
      );
    }
    __privateMethod(this, _ensureNotFinalized, ensureNotFinalized_fn).call(this);
    if (!__privateGet(this, _options).video)
      throw new Error("No video track declared.");
    if (typeof __privateGet(this, _options).fastStart === "object" && __privateGet(this, _videoTrack).samples.length === __privateGet(this, _options).fastStart.expectedVideoChunks) {
      throw new Error(`Cannot add more video chunks than specified in 'fastStart' (${__privateGet(this, _options).fastStart.expectedVideoChunks}).`);
    }
    let videoSample = __privateMethod(this, _createSampleForTrack, createSampleForTrack_fn).call(this, __privateGet(this, _videoTrack), data, type, timestamp, duration, meta, compositionTimeOffset);
    if (__privateGet(this, _options).fastStart === "fragmented" && __privateGet(this, _audioTrack)) {
      while (__privateGet(this, _audioSampleQueue).length > 0 && __privateGet(this, _audioSampleQueue)[0].decodeTimestamp <= videoSample.decodeTimestamp) {
        let audioSample = __privateGet(this, _audioSampleQueue).shift();
        __privateMethod(this, _addSampleToTrack, addSampleToTrack_fn).call(this, __privateGet(this, _audioTrack), audioSample);
      }
      if (videoSample.decodeTimestamp <= __privateGet(this, _audioTrack).lastDecodeTimestamp) {
        __privateMethod(this, _addSampleToTrack, addSampleToTrack_fn).call(this, __privateGet(this, _videoTrack), videoSample);
      } else {
        __privateGet(this, _videoSampleQueue).push(videoSample);
      }
    } else {
      __privateMethod(this, _addSampleToTrack, addSampleToTrack_fn).call(this, __privateGet(this, _videoTrack), videoSample);
    }
  }
  addAudioChunk(sample, meta, timestamp) {
    if (!(sample instanceof EncodedAudioChunk)) {
      throw new TypeError("addAudioChunk's first argument (sample) must be of type EncodedAudioChunk.");
    }
    if (meta && typeof meta !== "object") {
      throw new TypeError("addAudioChunk's second argument (meta), when provided, must be an object.");
    }
    if (timestamp !== void 0 && (!Number.isFinite(timestamp) || timestamp < 0)) {
      throw new TypeError(
        "addAudioChunk's third argument (timestamp), when provided, must be a non-negative real number."
      );
    }
    let data = new Uint8Array(sample.byteLength);
    sample.copyTo(data);
    this.addAudioChunkRaw(data, sample.type, timestamp ?? sample.timestamp, sample.duration, meta);
  }
  addAudioChunkRaw(data, type, timestamp, duration, meta) {
    if (!(data instanceof Uint8Array)) {
      throw new TypeError("addAudioChunkRaw's first argument (data) must be an instance of Uint8Array.");
    }
    if (type !== "key" && type !== "delta") {
      throw new TypeError("addAudioChunkRaw's second argument (type) must be either 'key' or 'delta'.");
    }
    if (!Number.isFinite(timestamp) || timestamp < 0) {
      throw new TypeError("addAudioChunkRaw's third argument (timestamp) must be a non-negative real number.");
    }
    if (!Number.isFinite(duration) || duration < 0) {
      throw new TypeError("addAudioChunkRaw's fourth argument (duration) must be a non-negative real number.");
    }
    if (meta && typeof meta !== "object") {
      throw new TypeError("addAudioChunkRaw's fifth argument (meta), when provided, must be an object.");
    }
    __privateMethod(this, _ensureNotFinalized, ensureNotFinalized_fn).call(this);
    if (!__privateGet(this, _options).audio)
      throw new Error("No audio track declared.");
    if (typeof __privateGet(this, _options).fastStart === "object" && __privateGet(this, _audioTrack).samples.length === __privateGet(this, _options).fastStart.expectedAudioChunks) {
      throw new Error(`Cannot add more audio chunks than specified in 'fastStart' (${__privateGet(this, _options).fastStart.expectedAudioChunks}).`);
    }
    let audioSample = __privateMethod(this, _createSampleForTrack, createSampleForTrack_fn).call(this, __privateGet(this, _audioTrack), data, type, timestamp, duration, meta);
    if (__privateGet(this, _options).fastStart === "fragmented" && __privateGet(this, _videoTrack)) {
      while (__privateGet(this, _videoSampleQueue).length > 0 && __privateGet(this, _videoSampleQueue)[0].decodeTimestamp <= audioSample.decodeTimestamp) {
        let videoSample = __privateGet(this, _videoSampleQueue).shift();
        __privateMethod(this, _addSampleToTrack, addSampleToTrack_fn).call(this, __privateGet(this, _videoTrack), videoSample);
      }
      if (audioSample.decodeTimestamp <= __privateGet(this, _videoTrack).lastDecodeTimestamp) {
        __privateMethod(this, _addSampleToTrack, addSampleToTrack_fn).call(this, __privateGet(this, _audioTrack), audioSample);
      } else {
        __privateGet(this, _audioSampleQueue).push(audioSample);
      }
    } else {
      __privateMethod(this, _addSampleToTrack, addSampleToTrack_fn).call(this, __privateGet(this, _audioTrack), audioSample);
    }
  }
  /** Finalizes the file, making it ready for use. Must be called after all video and audio chunks have been added. */
  finalize() {
    if (__privateGet(this, _finalized)) {
      throw new Error("Cannot finalize a muxer more than once.");
    }
    if (__privateGet(this, _options).fastStart === "fragmented") {
      for (let videoSample of __privateGet(this, _videoSampleQueue))
        __privateMethod(this, _addSampleToTrack, addSampleToTrack_fn).call(this, __privateGet(this, _videoTrack), videoSample);
      for (let audioSample of __privateGet(this, _audioSampleQueue))
        __privateMethod(this, _addSampleToTrack, addSampleToTrack_fn).call(this, __privateGet(this, _audioTrack), audioSample);
      __privateMethod(this, _finalizeFragment, finalizeFragment_fn).call(this, false);
    } else {
      if (__privateGet(this, _videoTrack))
        __privateMethod(this, _finalizeCurrentChunk, finalizeCurrentChunk_fn).call(this, __privateGet(this, _videoTrack));
      if (__privateGet(this, _audioTrack))
        __privateMethod(this, _finalizeCurrentChunk, finalizeCurrentChunk_fn).call(this, __privateGet(this, _audioTrack));
    }
    let tracks = [__privateGet(this, _videoTrack), __privateGet(this, _audioTrack)].filter(Boolean);
    if (__privateGet(this, _options).fastStart === "in-memory") {
      let mdatSize;
      for (let i = 0; i < 2; i++) {
        let movieBox2 = moov(tracks, __privateGet(this, _creationTime));
        let movieBoxSize = __privateGet(this, _writer).measureBox(movieBox2);
        mdatSize = __privateGet(this, _writer).measureBox(__privateGet(this, _mdat));
        let currentChunkPos = __privateGet(this, _writer).pos + movieBoxSize + mdatSize;
        for (let chunk of __privateGet(this, _finalizedChunks)) {
          chunk.offset = currentChunkPos;
          for (let { data } of chunk.samples) {
            currentChunkPos += data.byteLength;
            mdatSize += data.byteLength;
          }
        }
        if (currentChunkPos < 2 ** 32)
          break;
        if (mdatSize >= 2 ** 32)
          __privateGet(this, _mdat).largeSize = true;
      }
      let movieBox = moov(tracks, __privateGet(this, _creationTime));
      __privateGet(this, _writer).writeBox(movieBox);
      __privateGet(this, _mdat).size = mdatSize;
      __privateGet(this, _writer).writeBox(__privateGet(this, _mdat));
      for (let chunk of __privateGet(this, _finalizedChunks)) {
        for (let sample of chunk.samples) {
          __privateGet(this, _writer).write(sample.data);
          sample.data = null;
        }
      }
    } else if (__privateGet(this, _options).fastStart === "fragmented") {
      let startPos = __privateGet(this, _writer).pos;
      let mfraBox = mfra(tracks);
      __privateGet(this, _writer).writeBox(mfraBox);
      let mfraBoxSize = __privateGet(this, _writer).pos - startPos;
      __privateGet(this, _writer).seek(__privateGet(this, _writer).pos - 4);
      __privateGet(this, _writer).writeU32(mfraBoxSize);
    } else {
      let mdatPos = __privateGet(this, _writer).offsets.get(__privateGet(this, _mdat));
      let mdatSize = __privateGet(this, _writer).pos - mdatPos;
      __privateGet(this, _mdat).size = mdatSize;
      __privateGet(this, _mdat).largeSize = mdatSize >= 2 ** 32;
      __privateGet(this, _writer).patchBox(__privateGet(this, _mdat));
      let movieBox = moov(tracks, __privateGet(this, _creationTime));
      if (typeof __privateGet(this, _options).fastStart === "object") {
        __privateGet(this, _writer).seek(__privateGet(this, _ftypSize));
        __privateGet(this, _writer).writeBox(movieBox);
        let remainingBytes = mdatPos - __privateGet(this, _writer).pos;
        __privateGet(this, _writer).writeBox(free(remainingBytes));
      } else {
        __privateGet(this, _writer).writeBox(movieBox);
      }
    }
    __privateMethod(this, _maybeFlushStreamingTargetWriter, maybeFlushStreamingTargetWriter_fn).call(this);
    __privateGet(this, _writer).finalize();
    __privateSet(this, _finalized, true);
  }
};
_options = /* @__PURE__ */ new WeakMap();
_writer = /* @__PURE__ */ new WeakMap();
_ftypSize = /* @__PURE__ */ new WeakMap();
_mdat = /* @__PURE__ */ new WeakMap();
_videoTrack = /* @__PURE__ */ new WeakMap();
_audioTrack = /* @__PURE__ */ new WeakMap();
_creationTime = /* @__PURE__ */ new WeakMap();
_finalizedChunks = /* @__PURE__ */ new WeakMap();
_nextFragmentNumber = /* @__PURE__ */ new WeakMap();
_videoSampleQueue = /* @__PURE__ */ new WeakMap();
_audioSampleQueue = /* @__PURE__ */ new WeakMap();
_finalized = /* @__PURE__ */ new WeakMap();
_validateOptions = /* @__PURE__ */ new WeakSet();
validateOptions_fn = function(options) {
  if (typeof options !== "object") {
    throw new TypeError("The muxer requires an options object to be passed to its constructor.");
  }
  if (!(options.target instanceof Target)) {
    throw new TypeError("The target must be provided and an instance of Target.");
  }
  if (options.video) {
    if (!SUPPORTED_VIDEO_CODECS.includes(options.video.codec)) {
      throw new TypeError(`Unsupported video codec: ${options.video.codec}`);
    }
    if (!Number.isInteger(options.video.width) || options.video.width <= 0) {
      throw new TypeError(`Invalid video width: ${options.video.width}. Must be a positive integer.`);
    }
    if (!Number.isInteger(options.video.height) || options.video.height <= 0) {
      throw new TypeError(`Invalid video height: ${options.video.height}. Must be a positive integer.`);
    }
    const videoRotation = options.video.rotation;
    if (typeof videoRotation === "number" && ![0, 90, 180, 270].includes(videoRotation)) {
      throw new TypeError(`Invalid video rotation: ${videoRotation}. Has to be 0, 90, 180 or 270.`);
    } else if (Array.isArray(videoRotation) && (videoRotation.length !== 9 || videoRotation.some((value) => typeof value !== "number"))) {
      throw new TypeError(`Invalid video transformation matrix: ${videoRotation.join()}`);
    }
    if (options.video.frameRate !== void 0 && (!Number.isInteger(options.video.frameRate) || options.video.frameRate <= 0)) {
      throw new TypeError(
        `Invalid video frame rate: ${options.video.frameRate}. Must be a positive integer.`
      );
    }
  }
  if (options.audio) {
    if (!SUPPORTED_AUDIO_CODECS.includes(options.audio.codec)) {
      throw new TypeError(`Unsupported audio codec: ${options.audio.codec}`);
    }
    if (!Number.isInteger(options.audio.numberOfChannels) || options.audio.numberOfChannels <= 0) {
      throw new TypeError(
        `Invalid number of audio channels: ${options.audio.numberOfChannels}. Must be a positive integer.`
      );
    }
    if (!Number.isInteger(options.audio.sampleRate) || options.audio.sampleRate <= 0) {
      throw new TypeError(
        `Invalid audio sample rate: ${options.audio.sampleRate}. Must be a positive integer.`
      );
    }
  }
  if (options.firstTimestampBehavior && !FIRST_TIMESTAMP_BEHAVIORS.includes(options.firstTimestampBehavior)) {
    throw new TypeError(`Invalid first timestamp behavior: ${options.firstTimestampBehavior}`);
  }
  if (typeof options.fastStart === "object") {
    if (options.video) {
      if (options.fastStart.expectedVideoChunks === void 0) {
        throw new TypeError(`'fastStart' is an object but is missing property 'expectedVideoChunks'.`);
      } else if (!Number.isInteger(options.fastStart.expectedVideoChunks) || options.fastStart.expectedVideoChunks < 0) {
        throw new TypeError(`'expectedVideoChunks' must be a non-negative integer.`);
      }
    }
    if (options.audio) {
      if (options.fastStart.expectedAudioChunks === void 0) {
        throw new TypeError(`'fastStart' is an object but is missing property 'expectedAudioChunks'.`);
      } else if (!Number.isInteger(options.fastStart.expectedAudioChunks) || options.fastStart.expectedAudioChunks < 0) {
        throw new TypeError(`'expectedAudioChunks' must be a non-negative integer.`);
      }
    }
  } else if (![false, "in-memory", "fragmented"].includes(options.fastStart)) {
    throw new TypeError(`'fastStart' option must be false, 'in-memory', 'fragmented' or an object.`);
  }
  if (options.minFragmentDuration !== void 0 && (!Number.isFinite(options.minFragmentDuration) || options.minFragmentDuration < 0)) {
    throw new TypeError(`'minFragmentDuration' must be a non-negative number.`);
  }
};
_writeHeader = /* @__PURE__ */ new WeakSet();
writeHeader_fn = function() {
  __privateGet(this, _writer).writeBox(ftyp({
    holdsAvc: __privateGet(this, _options).video?.codec === "avc",
    fragmented: __privateGet(this, _options).fastStart === "fragmented"
  }));
  __privateSet(this, _ftypSize, __privateGet(this, _writer).pos);
  if (__privateGet(this, _options).fastStart === "in-memory") {
    __privateSet(this, _mdat, mdat(false));
  } else if (__privateGet(this, _options).fastStart === "fragmented") {
  } else {
    if (typeof __privateGet(this, _options).fastStart === "object") {
      let moovSizeUpperBound = __privateMethod(this, _computeMoovSizeUpperBound, computeMoovSizeUpperBound_fn).call(this);
      __privateGet(this, _writer).seek(__privateGet(this, _writer).pos + moovSizeUpperBound);
    }
    __privateSet(this, _mdat, mdat(true));
    __privateGet(this, _writer).writeBox(__privateGet(this, _mdat));
  }
  __privateMethod(this, _maybeFlushStreamingTargetWriter, maybeFlushStreamingTargetWriter_fn).call(this);
};
_computeMoovSizeUpperBound = /* @__PURE__ */ new WeakSet();
computeMoovSizeUpperBound_fn = function() {
  if (typeof __privateGet(this, _options).fastStart !== "object")
    return;
  let upperBound = 0;
  let sampleCounts = [
    __privateGet(this, _options).fastStart.expectedVideoChunks,
    __privateGet(this, _options).fastStart.expectedAudioChunks
  ];
  for (let n of sampleCounts) {
    if (!n)
      continue;
    upperBound += (4 + 4) * Math.ceil(2 / 3 * n);
    upperBound += 4 * n;
    upperBound += (4 + 4 + 4) * Math.ceil(2 / 3 * n);
    upperBound += 4 * n;
    upperBound += 8 * n;
  }
  upperBound += 4096;
  return upperBound;
};
_prepareTracks = /* @__PURE__ */ new WeakSet();
prepareTracks_fn = function() {
  if (__privateGet(this, _options).video) {
    __privateSet(this, _videoTrack, {
      id: 1,
      info: {
        type: "video",
        codec: __privateGet(this, _options).video.codec,
        width: __privateGet(this, _options).video.width,
        height: __privateGet(this, _options).video.height,
        rotation: __privateGet(this, _options).video.rotation ?? 0,
        decoderConfig: null
      },
      // The fallback contains many common frame rates as factors
      timescale: __privateGet(this, _options).video.frameRate ?? 57600,
      samples: [],
      finalizedChunks: [],
      currentChunk: null,
      firstDecodeTimestamp: void 0,
      lastDecodeTimestamp: -1,
      timeToSampleTable: [],
      compositionTimeOffsetTable: [],
      lastTimescaleUnits: null,
      lastSample: null,
      compactlyCodedChunkTable: []
    });
  }
  if (__privateGet(this, _options).audio) {
    __privateSet(this, _audioTrack, {
      id: __privateGet(this, _options).video ? 2 : 1,
      info: {
        type: "audio",
        codec: __privateGet(this, _options).audio.codec,
        numberOfChannels: __privateGet(this, _options).audio.numberOfChannels,
        sampleRate: __privateGet(this, _options).audio.sampleRate,
        decoderConfig: null
      },
      timescale: __privateGet(this, _options).audio.sampleRate,
      samples: [],
      finalizedChunks: [],
      currentChunk: null,
      firstDecodeTimestamp: void 0,
      lastDecodeTimestamp: -1,
      timeToSampleTable: [],
      compositionTimeOffsetTable: [],
      lastTimescaleUnits: null,
      lastSample: null,
      compactlyCodedChunkTable: []
    });
    if (__privateGet(this, _options).audio.codec === "aac") {
      let guessedCodecPrivate = __privateMethod(this, _generateMpeg4AudioSpecificConfig, generateMpeg4AudioSpecificConfig_fn).call(
        this,
        2,
        // Object type for AAC-LC, since it's the most common
        __privateGet(this, _options).audio.sampleRate,
        __privateGet(this, _options).audio.numberOfChannels
      );
      __privateGet(this, _audioTrack).info.decoderConfig = {
        codec: __privateGet(this, _options).audio.codec,
        description: guessedCodecPrivate,
        numberOfChannels: __privateGet(this, _options).audio.numberOfChannels,
        sampleRate: __privateGet(this, _options).audio.sampleRate
      };
    }
  }
};
_generateMpeg4AudioSpecificConfig = /* @__PURE__ */ new WeakSet();
generateMpeg4AudioSpecificConfig_fn = function(objectType, sampleRate, numberOfChannels) {
  let frequencyIndices = [96e3, 88200, 64e3, 48e3, 44100, 32e3, 24e3, 22050, 16e3, 12e3, 11025, 8e3, 7350];
  let frequencyIndex = frequencyIndices.indexOf(sampleRate);
  let channelConfig = numberOfChannels;
  let configBits = "";
  configBits += objectType.toString(2).padStart(5, "0");
  configBits += frequencyIndex.toString(2).padStart(4, "0");
  if (frequencyIndex === 15)
    configBits += sampleRate.toString(2).padStart(24, "0");
  configBits += channelConfig.toString(2).padStart(4, "0");
  let paddingLength = Math.ceil(configBits.length / 8) * 8;
  configBits = configBits.padEnd(paddingLength, "0");
  let configBytes = new Uint8Array(configBits.length / 8);
  for (let i = 0; i < configBits.length; i += 8) {
    configBytes[i / 8] = parseInt(configBits.slice(i, i + 8), 2);
  }
  return configBytes;
};
_createSampleForTrack = /* @__PURE__ */ new WeakSet();
createSampleForTrack_fn = function(track, data, type, timestamp, duration, meta, compositionTimeOffset) {
  let presentationTimestampInSeconds = timestamp / 1e6;
  let decodeTimestampInSeconds = (timestamp - (compositionTimeOffset ?? 0)) / 1e6;
  let durationInSeconds = duration / 1e6;
  let adjusted = __privateMethod(this, _validateTimestamp, validateTimestamp_fn).call(this, presentationTimestampInSeconds, decodeTimestampInSeconds, track);
  presentationTimestampInSeconds = adjusted.presentationTimestamp;
  decodeTimestampInSeconds = adjusted.decodeTimestamp;
  if (meta?.decoderConfig) {
    if (track.info.decoderConfig === null) {
      track.info.decoderConfig = meta.decoderConfig;
    } else {
      Object.assign(track.info.decoderConfig, meta.decoderConfig);
    }
  }
  let sample = {
    presentationTimestamp: presentationTimestampInSeconds,
    decodeTimestamp: decodeTimestampInSeconds,
    duration: durationInSeconds,
    data,
    size: data.byteLength,
    type,
    // Will be refined once the next sample comes in
    timescaleUnitsToNextSample: intoTimescale(durationInSeconds, track.timescale)
  };
  return sample;
};
_addSampleToTrack = /* @__PURE__ */ new WeakSet();
addSampleToTrack_fn = function(track, sample) {
  if (__privateGet(this, _options).fastStart !== "fragmented") {
    track.samples.push(sample);
  }
  const sampleCompositionTimeOffset = intoTimescale(sample.presentationTimestamp - sample.decodeTimestamp, track.timescale);
  if (track.lastTimescaleUnits !== null) {
    let timescaleUnits = intoTimescale(sample.decodeTimestamp, track.timescale, false);
    let delta = Math.round(timescaleUnits - track.lastTimescaleUnits);
    track.lastTimescaleUnits += delta;
    track.lastSample.timescaleUnitsToNextSample = delta;
    if (__privateGet(this, _options).fastStart !== "fragmented") {
      let lastTableEntry = last(track.timeToSampleTable);
      if (lastTableEntry.sampleCount === 1) {
        lastTableEntry.sampleDelta = delta;
        lastTableEntry.sampleCount++;
      } else if (lastTableEntry.sampleDelta === delta) {
        lastTableEntry.sampleCount++;
      } else {
        lastTableEntry.sampleCount--;
        track.timeToSampleTable.push({
          sampleCount: 2,
          sampleDelta: delta
        });
      }
      const lastCompositionTimeOffsetTableEntry = last(track.compositionTimeOffsetTable);
      if (lastCompositionTimeOffsetTableEntry.sampleCompositionTimeOffset === sampleCompositionTimeOffset) {
        lastCompositionTimeOffsetTableEntry.sampleCount++;
      } else {
        track.compositionTimeOffsetTable.push({
          sampleCount: 1,
          sampleCompositionTimeOffset
        });
      }
    }
  } else {
    track.lastTimescaleUnits = 0;
    if (__privateGet(this, _options).fastStart !== "fragmented") {
      track.timeToSampleTable.push({
        sampleCount: 1,
        sampleDelta: intoTimescale(sample.duration, track.timescale)
      });
      track.compositionTimeOffsetTable.push({
        sampleCount: 1,
        sampleCompositionTimeOffset
      });
    }
  }
  track.lastSample = sample;
  let beginNewChunk = false;
  if (!track.currentChunk) {
    beginNewChunk = true;
  } else {
    let currentChunkDuration = sample.presentationTimestamp - track.currentChunk.startTimestamp;
    if (__privateGet(this, _options).fastStart === "fragmented") {
      let mostImportantTrack = __privateGet(this, _videoTrack) ?? __privateGet(this, _audioTrack);
      const chunkDuration = __privateGet(this, _options).minFragmentDuration ?? 1;
      if (track === mostImportantTrack && sample.type === "key" && currentChunkDuration >= chunkDuration) {
        beginNewChunk = true;
        __privateMethod(this, _finalizeFragment, finalizeFragment_fn).call(this);
      }
    } else {
      beginNewChunk = currentChunkDuration >= 0.5;
    }
  }
  if (beginNewChunk) {
    if (track.currentChunk) {
      __privateMethod(this, _finalizeCurrentChunk, finalizeCurrentChunk_fn).call(this, track);
    }
    track.currentChunk = {
      startTimestamp: sample.presentationTimestamp,
      samples: []
    };
  }
  track.currentChunk.samples.push(sample);
};
_validateTimestamp = /* @__PURE__ */ new WeakSet();
validateTimestamp_fn = function(presentationTimestamp, decodeTimestamp, track) {
  const strictTimestampBehavior = __privateGet(this, _options).firstTimestampBehavior === "strict";
  const noLastDecodeTimestamp = track.lastDecodeTimestamp === -1;
  const timestampNonZero = decodeTimestamp !== 0;
  if (strictTimestampBehavior && noLastDecodeTimestamp && timestampNonZero) {
    throw new Error(
      `The first chunk for your media track must have a timestamp of 0 (received DTS=${decodeTimestamp}).Non-zero first timestamps are often caused by directly piping frames or audio data from a MediaStreamTrack into the encoder. Their timestamps are typically relative to the age of thedocument, which is probably what you want.

If you want to offset all timestamps of a track such that the first one is zero, set firstTimestampBehavior: 'offset' in the options.
`
    );
  } else if (__privateGet(this, _options).firstTimestampBehavior === "offset" || __privateGet(this, _options).firstTimestampBehavior === "cross-track-offset") {
    if (track.firstDecodeTimestamp === void 0) {
      track.firstDecodeTimestamp = decodeTimestamp;
    }
    let baseDecodeTimestamp;
    if (__privateGet(this, _options).firstTimestampBehavior === "offset") {
      baseDecodeTimestamp = track.firstDecodeTimestamp;
    } else {
      baseDecodeTimestamp = Math.min(
        __privateGet(this, _videoTrack)?.firstDecodeTimestamp ?? Infinity,
        __privateGet(this, _audioTrack)?.firstDecodeTimestamp ?? Infinity
      );
    }
    decodeTimestamp -= baseDecodeTimestamp;
    presentationTimestamp -= baseDecodeTimestamp;
  }
  if (decodeTimestamp < track.lastDecodeTimestamp) {
    throw new Error(
      `Timestamps must be monotonically increasing (DTS went from ${track.lastDecodeTimestamp * 1e6} to ${decodeTimestamp * 1e6}).`
    );
  }
  track.lastDecodeTimestamp = decodeTimestamp;
  return { presentationTimestamp, decodeTimestamp };
};
_finalizeCurrentChunk = /* @__PURE__ */ new WeakSet();
finalizeCurrentChunk_fn = function(track) {
  if (__privateGet(this, _options).fastStart === "fragmented") {
    throw new Error("Can't finalize individual chunks if 'fastStart' is set to 'fragmented'.");
  }
  if (!track.currentChunk)
    return;
  track.finalizedChunks.push(track.currentChunk);
  __privateGet(this, _finalizedChunks).push(track.currentChunk);
  if (track.compactlyCodedChunkTable.length === 0 || last(track.compactlyCodedChunkTable).samplesPerChunk !== track.currentChunk.samples.length) {
    track.compactlyCodedChunkTable.push({
      firstChunk: track.finalizedChunks.length,
      // 1-indexed
      samplesPerChunk: track.currentChunk.samples.length
    });
  }
  if (__privateGet(this, _options).fastStart === "in-memory") {
    track.currentChunk.offset = 0;
    return;
  }
  track.currentChunk.offset = __privateGet(this, _writer).pos;
  for (let sample of track.currentChunk.samples) {
    __privateGet(this, _writer).write(sample.data);
    sample.data = null;
  }
  __privateMethod(this, _maybeFlushStreamingTargetWriter, maybeFlushStreamingTargetWriter_fn).call(this);
};
_finalizeFragment = /* @__PURE__ */ new WeakSet();
finalizeFragment_fn = function(flushStreamingWriter = true) {
  if (__privateGet(this, _options).fastStart !== "fragmented") {
    throw new Error("Can't finalize a fragment unless 'fastStart' is set to 'fragmented'.");
  }
  let tracks = [__privateGet(this, _videoTrack), __privateGet(this, _audioTrack)].filter((track) => track && track.currentChunk);
  if (tracks.length === 0)
    return;
  let fragmentNumber = __privateWrapper(this, _nextFragmentNumber)._++;
  if (fragmentNumber === 1) {
    let movieBox = moov(tracks, __privateGet(this, _creationTime), true);
    __privateGet(this, _writer).writeBox(movieBox);
  }
  let moofOffset = __privateGet(this, _writer).pos;
  let moofBox = moof(fragmentNumber, tracks);
  __privateGet(this, _writer).writeBox(moofBox);
  {
    let mdatBox = mdat(false);
    let totalTrackSampleSize = 0;
    for (let track of tracks) {
      for (let sample of track.currentChunk.samples) {
        totalTrackSampleSize += sample.size;
      }
    }
    let mdatSize = __privateGet(this, _writer).measureBox(mdatBox) + totalTrackSampleSize;
    if (mdatSize >= 2 ** 32) {
      mdatBox.largeSize = true;
      mdatSize = __privateGet(this, _writer).measureBox(mdatBox) + totalTrackSampleSize;
    }
    mdatBox.size = mdatSize;
    __privateGet(this, _writer).writeBox(mdatBox);
  }
  for (let track of tracks) {
    track.currentChunk.offset = __privateGet(this, _writer).pos;
    track.currentChunk.moofOffset = moofOffset;
    for (let sample of track.currentChunk.samples) {
      __privateGet(this, _writer).write(sample.data);
      sample.data = null;
    }
  }
  let endPos = __privateGet(this, _writer).pos;
  __privateGet(this, _writer).seek(__privateGet(this, _writer).offsets.get(moofBox));
  let newMoofBox = moof(fragmentNumber, tracks);
  __privateGet(this, _writer).writeBox(newMoofBox);
  __privateGet(this, _writer).seek(endPos);
  for (let track of tracks) {
    track.finalizedChunks.push(track.currentChunk);
    __privateGet(this, _finalizedChunks).push(track.currentChunk);
    track.currentChunk = null;
  }
  if (flushStreamingWriter) {
    __privateMethod(this, _maybeFlushStreamingTargetWriter, maybeFlushStreamingTargetWriter_fn).call(this);
  }
};
_maybeFlushStreamingTargetWriter = /* @__PURE__ */ new WeakSet();
maybeFlushStreamingTargetWriter_fn = function() {
  if (__privateGet(this, _writer) instanceof StreamTargetWriter) {
    __privateGet(this, _writer).flush();
  }
};
_ensureNotFinalized = /* @__PURE__ */ new WeakSet();
ensureNotFinalized_fn = function() {
  if (__privateGet(this, _finalized)) {
    throw new Error("Cannot add new video or audio chunks after the file has been finalized.");
  }
};

// src/audio/analyzer.ts
var FFT_SIZE = 8192;
var ANALYSIS_FPS = 60;
var ANALYSER_MIN_DB = -85;
var ANALYSER_MAX_DB = -25;
var SPECTRUM_GAMMA = 1.35;
var BASS_RANGE = [20, 250];
var MID_RANGE = [250, 4e3];
var HIGH_RANGE = [4e3, 16e3];
function freqToBin(freq, fftSize, sampleRate) {
  return Math.round(freq * fftSize / sampleRate);
}
function bandEnergy(data, fromBin, toBin) {
  const lo = Math.max(1, Math.min(fromBin, data.length - 1));
  const hi = Math.max(lo + 1, Math.min(toBin, data.length));
  let sum = 0;
  for (let i = lo; i < hi; i++) sum += data[i];
  return sum / ((hi - lo) * 255);
}
var BeatDetector = class {
  /** 阈值：当前低频能量 > 滑动均值 × threshold（1.3–1.5 可调） */
  threshold;
  /** 不应期（秒），防止同一鼓点重复触发 */
  refractory = 0.2;
  /** 脉冲指数衰减时间常数（秒） */
  tau = 0.16;
  /** 能量历史环形缓冲（约 0.7s @ 60fps） */
  history = [];
  historySize = 43;
  lastBeatTime = -Infinity;
  pulse = 0;
  lastT = null;
  constructor(threshold = 1.4) {
    this.threshold = threshold;
  }
  reset() {
    this.history = [];
    this.lastBeatTime = -Infinity;
    this.pulse = 0;
    this.lastT = null;
  }
  /**
   * 喂入一帧的低频能量，返回当前节拍脉冲强度 0..1。
   * 必须按时间轴顺序调用（预览逐帧 / 离线分析顺序遍历均满足）。
   */
  update(t, bassEnergy) {
    const dt = this.lastT === null ? 1 / 60 : Math.max(0, t - this.lastT);
    this.lastT = t;
    this.pulse *= Math.exp(-dt / this.tau);
    if (this.pulse < 1e-3) this.pulse = 0;
    const avg = this.history.length > 0 ? this.history.reduce((a, b) => a + b, 0) / this.history.length : 0;
    if (this.history.length >= this.historySize / 2 && bassEnergy > avg * this.threshold && bassEnergy > 0.02 && // 绝对能量下限，避免静音段噪声触发
    t - this.lastBeatTime >= this.refractory) {
      this.lastBeatTime = t;
      this.pulse = 1;
    }
    this.history.push(bassEnergy);
    if (this.history.length > this.historySize) this.history.shift();
    return this.pulse;
  }
};
var BandNormalizer = class {
  peaks = { bass: 0.1, mid: 0.1, high: 0.1, level: 0.1 };
  /** 峰值衰减系数（每帧），约 3s 内跟踪到新的峰值水平 */
  decay = 0.995;
  norm(key, v) {
    const p = this.peaks;
    p[key] = Math.max(p[key] * this.decay, v, 0.05);
    return Math.min(1, v / (p[key] * 1.2));
  }
  apply(bass, mid, high, level) {
    return {
      bass: this.norm("bass", bass),
      mid: this.norm("mid", mid),
      high: this.norm("high", high),
      level: this.norm("level", level)
    };
  }
  reset() {
    this.peaks = { bass: 0.1, mid: 0.1, high: 0.1, level: 0.1 };
  }
};
function buildFrame(t, byteSpectrum, sampleRate, beat) {
  const fftSize = FFT_SIZE;
  const spectrum = new Float32Array(byteSpectrum.length);
  let levelSum = 0;
  for (let i = 0; i < byteSpectrum.length; i++) {
    const v = byteSpectrum[i] / 255;
    spectrum[i] = Math.pow(v, SPECTRUM_GAMMA);
    levelSum += byteSpectrum[i];
  }
  const level = levelSum / (byteSpectrum.length * 255);
  const bass = bandEnergy(byteSpectrum, freqToBin(BASS_RANGE[0], fftSize, sampleRate), freqToBin(BASS_RANGE[1], fftSize, sampleRate));
  const mid = bandEnergy(byteSpectrum, freqToBin(MID_RANGE[0], fftSize, sampleRate), freqToBin(MID_RANGE[1], fftSize, sampleRate));
  const high = bandEnergy(byteSpectrum, freqToBin(HIGH_RANGE[0], fftSize, sampleRate), freqToBin(HIGH_RANGE[1], fftSize, sampleRate));
  return { t, spectrum, bass, mid, high, level, beat };
}

// src/audio/offlineAnalysis.ts
async function analyzeOffline(buffer, opts) {
  const sampleRate = 44100;
  const duration = buffer.duration;
  const fps = ANALYSIS_FPS;
  const totalFrames = Math.max(1, Math.floor(duration * fps));
  const offline = new OfflineAudioContext(1, Math.ceil(duration * sampleRate) + sampleRate, sampleRate);
  const src = offline.createBufferSource();
  src.buffer = buffer;
  const analyser = offline.createAnalyser();
  analyser.fftSize = FFT_SIZE;
  analyser.smoothingTimeConstant = opts.analyserSmoothing;
  analyser.minDecibels = ANALYSER_MIN_DB;
  analyser.maxDecibels = ANALYSER_MAX_DB;
  src.connect(analyser);
  analyser.connect(offline.destination);
  src.start(0);
  const detector = new BeatDetector(opts.beatThreshold);
  const rawFrames = new Array(totalFrames);
  const byteData = new Uint8Array(analyser.frequencyBinCount);
  let sampled = 0;
  for (let i = 0; i < totalFrames; i++) {
    const t = i / fps;
    void offline.suspend(t).then(() => {
      analyser.getByteFrequencyData(byteData);
      const frame = buildFrame(t, byteData, sampleRate, 0);
      frame.beat = detector.update(t, frame.bass);
      rawFrames[i] = frame;
      sampled++;
      opts.onProgress?.(sampled / totalFrames);
      void offline.resume();
    });
  }
  if (opts.signal?.aborted) throw new DOMException("\u5DF2\u53D6\u6D88", "AbortError");
  await offline.startRendering();
  if (opts.signal?.aborted) throw new DOMException("\u5DF2\u53D6\u6D88", "AbortError");
  for (let i = 0; i < totalFrames; i++) {
    if (!rawFrames[i]) {
      const t = i / fps;
      rawFrames[i] = i > 0 ? { ...rawFrames[i - 1], t } : buildFrame(t, new Uint8Array(analyser.frequencyBinCount), sampleRate, 0);
    }
  }
  smoothFrames(rawFrames);
  const normalizer = new BandNormalizer();
  for (const f of rawFrames) {
    const n = normalizer.apply(f.bass, f.mid, f.high, f.level);
    f.bass = n.bass;
    f.mid = n.mid;
    f.high = n.high;
    f.level = n.level;
  }
  return { frames: rawFrames, fps, duration };
}
function smoothFrames(frames) {
  if (frames.length < 2) return;
  const kAttack = 0.65;
  const kRelease = 0.22;
  const n = frames[0].spectrum.length;
  for (let i = 1; i < frames.length; i++) {
    const prev = frames[i - 1];
    const cur = frames[i];
    for (let j = 0; j < n; j++) {
      const p = prev.spectrum[j];
      const k = cur.spectrum[j] > p ? kAttack : kRelease;
      cur.spectrum[j] = p + (cur.spectrum[j] - p) * k;
    }
    cur.bass = prev.bass + (cur.bass - prev.bass) * (cur.bass > prev.bass ? kAttack : kRelease);
    cur.mid = prev.mid + (cur.mid - prev.mid) * (cur.mid > prev.mid ? kAttack : kRelease);
    cur.high = prev.high + (cur.high - prev.high) * (cur.high > prev.high ? kAttack : kRelease);
    cur.level = prev.level + (cur.level - prev.level) * (cur.level > prev.level ? kAttack : kRelease);
  }
}
function frameAt(analysis, t) {
  const idx = Math.max(0, Math.min(analysis.frames.length - 1, Math.round(t * analysis.fps)));
  return analysis.frames[idx];
}

// src/state/bgVideo.ts
function seekVideoFrame(video, time, timeoutMs = 500) {
  return new Promise((resolve) => {
    if (video.readyState < 2) return resolve();
    if (Math.abs(video.currentTime - time) < 1e-3) return resolve();
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      video.removeEventListener("seeked", finish);
      resolve();
    };
    video.addEventListener("seeked", finish);
    setTimeout(finish, timeoutMs);
    try {
      video.currentTime = time;
    } catch {
      finish();
    }
  });
}

// src/export/exporter.ts
function checkEncoderSupport() {
  const video = typeof VideoEncoder !== "undefined";
  const audio = typeof AudioEncoder !== "undefined";
  if (!video) {
    return { video, audio, message: "\u5F53\u524D\u6D4F\u89C8\u5668\u4E0D\u652F\u6301 WebCodecs \u89C6\u9891\u7F16\u7801\uFF0C\u8BF7\u4F7F\u7528 Chrome / Edge 94+ \u5BFC\u51FA\u89C6\u9891\u3002" };
  }
  if (!audio) {
    return { video, audio, message: "\u5F53\u524D\u6D4F\u89C8\u5668\u4E0D\u652F\u6301 AudioEncoder\uFF0C\u5BFC\u51FA\u7684\u89C6\u9891\u5C06\u6CA1\u6709\u58F0\u97F3\uFF08\u5EFA\u8BAE Chrome / Edge \u6700\u65B0\u7248\uFF09\u3002" };
  }
  return { video, audio, message: null };
}
function avcCodecString(resolution, fps) {
  if (resolution === "720p") return fps > 30 ? "avc1.640028" : "avc1.64001f";
  return fps > 30 ? "avc1.64002a" : "avc1.640028";
}
function exportVideo(opts) {
  const abort = new AbortController();
  const promise = runExport(opts, abort.signal);
  return { promise, cancel: () => abort.abort() };
}
async function runExport(opts, signal) {
  const { audioBuffer, config, settings, start, duration, onProgress } = opts;
  const throwIfAborted = () => {
    if (signal.aborted) throw new DOMException("\u5BFC\u51FA\u5DF2\u53D6\u6D88", "AbortError");
  };
  onProgress({ ratio: 0, stage: "\u6B63\u5728\u5206\u6790\u97F3\u9891\u2026", etaSeconds: 0 });
  let analysis;
  try {
    analysis = await analyzeOffline(audioBuffer, {
      beatThreshold: config.analysis.beatThreshold,
      analyserSmoothing: config.analysis.analyserSmoothing,
      onProgress: (r) => onProgress({ ratio: r * 0.2, stage: "\u6B63\u5728\u5206\u6790\u97F3\u9891\u2026", etaSeconds: 0 }),
      signal
    });
  } catch (e) {
    if (e.name === "AbortError") throw e;
    throw new Error("\u97F3\u9891\u5206\u6790\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5\u6216\u66F4\u6362\u97F3\u9891\u6587\u4EF6\u3002");
  }
  throwIfAborted();
  onProgress({ ratio: 0.22, stage: "\u6B63\u5728\u6E32\u67D3\u97F3\u8F68\u2026", etaSeconds: 0 });
  const support = checkEncoderSupport();
  let pcmBuffer = null;
  if (support.audio) {
    const sr = 44100;
    const channels = Math.min(2, audioBuffer.numberOfChannels);
    const offline = new OfflineAudioContext(channels, Math.ceil(duration * sr), sr);
    const src = offline.createBufferSource();
    src.buffer = audioBuffer;
    src.connect(offline.destination);
    src.start(0, start, duration);
    pcmBuffer = await offline.startRendering();
    throwIfAborted();
  }
  const shifted = shiftAnalysis(analysis, -start);
  return encodeTimeline(
    { analysis: shifted, pcmBuffer, duration, config, assets: opts.assets, settings, onProgress },
    signal
  );
}
function shiftAnalysis(analysis, dt) {
  if (dt === 0) return analysis;
  for (const f of analysis.frames) f.t += dt;
  return analysis;
}
async function encodeTimeline(opts, signal) {
  const { analysis, config, settings, duration, onProgress, segments } = opts;
  const t0 = performance.now();
  const throwIfAborted = () => {
    if (signal.aborted) throw new DOMException("\u5BFC\u51FA\u5DF2\u53D6\u6D88", "AbortError");
  };
  const layout = LAYOUTS[config.layout];
  const scaleFactor = settings.resolution === "720p" ? 720 / layout.height : 1;
  const toEven = (n) => Math.max(2, Math.round(n) & ~1);
  const outW = toEven(layout.width * scaleFactor);
  const outH = toEven(layout.height * scaleFactor);
  const fps = settings.fps;
  const totalFrames = Math.round(duration * fps);
  const isLoop = settings.mode === "loop";
  onProgress({ ratio: 0.24, stage: "\u6B63\u5728\u51C6\u5907\u7F16\u7801\u5668\u2026", etaSeconds: 0 });
  const support = checkEncoderSupport();
  let muxerAudio;
  let pcmBuffer = opts.pcmBuffer;
  if (support.audio && pcmBuffer) {
    const sr = pcmBuffer.sampleRate;
    const channels = pcmBuffer.numberOfChannels;
    const audioConfig = {
      codec: "mp4a.40.2",
      sampleRate: sr,
      numberOfChannels: channels,
      bitrate: 192e3
    };
    const audioSupport = await AudioEncoder.isConfigSupported(audioConfig);
    if (audioSupport.supported) {
      muxerAudio = { codec: "aac", sampleRate: sr, numberOfChannels: channels };
    } else {
      pcmBuffer = null;
    }
  } else {
    pcmBuffer = null;
  }
  const muxer = new Muxer({
    target: new ArrayBufferTarget(),
    video: { codec: "avc", width: outW, height: outH, frameRate: fps },
    audio: muxerAudio,
    fastStart: "in-memory"
  });
  const errBox = { e: null };
  const videoEncoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (e) => {
      errBox.e = e;
    }
  });
  const bitrate = settings.bitrate * 1e6;
  const videoConfig = {
    codec: avcCodecString(settings.resolution, fps),
    width: outW,
    height: outH,
    bitrate,
    framerate: fps
  };
  let configured = false;
  for (const candidate of [videoConfig.codec, "avc1.4d002a", "avc1.42002a"]) {
    try {
      const res = await VideoEncoder.isConfigSupported({ ...videoConfig, codec: candidate });
      if (res.supported) {
        videoEncoder.configure({ ...videoConfig, codec: candidate });
        configured = true;
        break;
      }
    } catch {
    }
  }
  if (!configured) throw new Error("\u5F53\u524D\u6D4F\u89C8\u5668\u4E0D\u652F\u6301\u6240\u9700\u7684 H.264 \u7F16\u7801\u914D\u7F6E\uFF0C\u8BF7\u66F4\u6362\u6D4F\u89C8\u5668\u6216\u964D\u4F4E\u5BFC\u51FA\u89C4\u683C\u3002");
  let audioEncoder = null;
  if (muxerAudio && pcmBuffer) {
    audioEncoder = new AudioEncoder({
      output: (chunk, meta) => muxer.addAudioChunk(chunk, meta),
      error: () => {
      }
    });
    audioEncoder.configure({
      codec: "mp4a.40.2",
      sampleRate: muxerAudio.sampleRate,
      numberOfChannels: muxerAudio.numberOfChannels,
      bitrate: 192e3
    });
  }
  if (audioEncoder && pcmBuffer && muxerAudio) {
    const sr = muxerAudio.sampleRate;
    const ch = muxerAudio.numberOfChannels;
    const chunkFrames = 4096;
    const total = pcmBuffer.length;
    for (let offset = 0; offset < total; offset += chunkFrames) {
      throwIfAborted();
      const frames = Math.min(chunkFrames, total - offset);
      const data = new Float32Array(frames * ch);
      for (let c = 0; c < ch; c++) {
        const channelData = pcmBuffer.getChannelData(c);
        data.set(channelData.subarray(offset, offset + frames), c * frames);
      }
      const audioData = new AudioData({
        format: "f32-planar",
        sampleRate: sr,
        numberOfFrames: frames,
        numberOfChannels: ch,
        timestamp: Math.round(offset / sr * 1e6),
        data: data.buffer
      });
      audioEncoder.encode(audioData);
      audioData.close();
      if (audioEncoder.encodeQueueSize > 8) {
        await new Promise((r) => audioEncoder.addEventListener("dequeue", r, { once: true }));
      }
    }
    await audioEncoder.flush();
    audioEncoder.close();
  }
  throwIfAborted();
  onProgress({ ratio: 0.3, stage: "\u6B63\u5728\u9010\u5E27\u6E32\u67D3\u2026", etaSeconds: 0 });
  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d", { alpha: false });
  const renderAssets = {
    ...opts.assets,
    duration,
    loopPeriod: isLoop ? duration : void 0
  };
  const frameDurationUs = Math.round(1e6 / fps);
  const bgVideo = renderAssets.bgVideo ?? null;
  if (bgVideo) bgVideo.pause();
  let lastSegIdx = -1;
  for (let i = 0; i < totalFrames; i++) {
    throwIfAborted();
    if (errBox.e) throw new Error(`\u89C6\u9891\u7F16\u7801\u5931\u8D25\uFF1A${errBox.e.message}`);
    const t = i / fps;
    if (bgVideo) {
      const vd = bgVideo.duration || duration;
      await seekVideoFrame(bgVideo, t % vd, 400);
    }
    let frameConfig = config;
    let frameAssets = renderAssets;
    if (segments && segments.length > 0) {
      let segIdx = segments.findIndex((s) => t >= s.start && t < s.end);
      if (segIdx < 0) segIdx = segments.length - 1;
      const seg = segments[segIdx];
      frameConfig = {
        ...config,
        title: { ...config.title, title: seg.title, artist: seg.artist, startOffset: seg.start }
      };
      if (seg.cover) frameAssets = { ...renderAssets, cover: seg.cover };
      if (segIdx !== lastSegIdx) lastSegIdx = segIdx;
    }
    const audioFrame = frameAt(analysis, t);
    renderFrame(ctx, t, audioFrame, frameConfig, frameAssets);
    const frame = new VideoFrame(canvas, { timestamp: i * frameDurationUs, duration: frameDurationUs });
    videoEncoder.encode(frame, { keyFrame: i % (fps * 2) === 0 });
    frame.close();
    if (videoEncoder.encodeQueueSize > 6) {
      await new Promise((r) => videoEncoder.addEventListener("dequeue", r, { once: true }));
    }
    if (i % 10 === 0) {
      const elapsed = (performance.now() - t0) / 1e3;
      const ratio = 0.3 + i / totalFrames * 0.68;
      const eta = i > 0 ? elapsed / i * (totalFrames - i) : 0;
      onProgress({ ratio, stage: `\u6B63\u5728\u9010\u5E27\u6E32\u67D3\u2026 ${i}/${totalFrames}`, etaSeconds: eta });
      await new Promise((r) => setTimeout(r, 0));
    }
  }
  await videoEncoder.flush();
  videoEncoder.close();
  throwIfAborted();
  onProgress({ ratio: 0.99, stage: "\u6B63\u5728\u5C01\u88C5 MP4\u2026", etaSeconds: 0 });
  muxer.finalize();
  const { buffer } = muxer.target;
  onProgress({ ratio: 1, stage: "\u5B8C\u6210", etaSeconds: 0 });
  return new Blob([buffer], { type: "video/mp4" });
}

// smoke2-entry.tmp.ts
var R = {};
window.__r = R;
function makeBeatWav(seconds) {
  const sr = 22050;
  const n = Math.floor(seconds * sr);
  const buf = new ArrayBuffer(44 + n * 2);
  const v = new DataView(buf);
  const ws = (o, s) => {
    for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i));
  };
  ws(0, "RIFF");
  v.setUint32(4, 36 + n * 2, true);
  ws(8, "WAVE");
  ws(12, "fmt ");
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, sr, true);
  v.setUint32(28, sr * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  ws(36, "data");
  v.setUint32(40, n * 2, true);
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    const beatPhase = t % 0.5;
    const kick = beatPhase < 0.12 ? Math.sin(t * 55 * 2 * Math.PI) * Math.exp(-beatPhase * 25) : 0;
    const tone = 0.25 * Math.sin(t * 440 * 2 * Math.PI) + 0.15 * Math.sin(t * 1320 * 2 * Math.PI);
    v.setInt16(44 + i * 2, Math.max(-1, Math.min(1, kick * 0.9 + tone)) * 32767, true);
  }
  return new Blob([buf], { type: "audio/wav" });
}
function parseMp4(buf) {
  const v = new DataView(buf);
  const str = (o, n) => {
    let s = "";
    for (let i = 0; i < n; i++) s += String.fromCharCode(v.getUint8(o + i));
    return s;
  };
  const boxes = [];
  const handlers = [];
  let mvhdDuration = 0;
  let mvhdTimescale = 1;
  const walk = (start, end, depth) => {
    let p = start;
    while (p + 8 <= end) {
      const size = v.getUint32(p);
      const type = str(p + 4, 4);
      if (size < 8 || p + size > end) break;
      if (depth === 0) boxes.push(type);
      if (type === "hdlr") handlers.push(str(p + 16, 4));
      if (type === "mvhd") {
        const ver = v.getUint8(p + 8);
        if (ver === 1) {
          mvhdTimescale = v.getUint32(p + 28);
          mvhdDuration = Number(v.getBigUint64(p + 32));
        } else {
          mvhdTimescale = v.getUint32(p + 20);
          mvhdDuration = v.getUint32(p + 24);
        }
      }
      if (type === "moov" || type === "trak" || type === "mdia") walk(p + 8, p + size, depth + 1);
      p += size;
    }
  };
  walk(0, buf.byteLength, 0);
  return { boxes, handlers, durationSec: mvhdDuration / mvhdTimescale, bytes: buf.byteLength };
}
function beatFrame(t) {
  const n = 512;
  const spectrum = new Float32Array(n);
  const beatPhase = t % 0.5;
  const kickEnv = Math.exp(-beatPhase * 9);
  for (let i = 0; i < n; i++) {
    const x = i / n;
    spectrum[i] = kickEnv * 0.9 * Math.exp(-x * 6) + 0.35 * Math.exp(-x * 2.2) * (0.6 + 0.4 * Math.sin(t * 2 + x * 10)) + 0.12 * Math.abs(Math.sin(x * 25 + t * 3));
  }
  const beat = beatPhase < 0.05 ? 1 : Math.exp(-(beatPhase - 0.05) * 8);
  return { t, spectrum, bass: Math.min(1, kickEnv), mid: 0.5, high: 0.35, level: 0.55, beat };
}
async function main() {
  const studio = BUILTIN_PRESETS.find((p) => p.id === "studio");
  if (!studio) throw new Error("studio \u9884\u8BBE\u672A\u6CE8\u518C");
  const W = 1280;
  const H = 720;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  canvas.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;";
  document.body.style.margin = "0";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  const cfg = {
    ...studio.config,
    layout: "16:9",
    title: { ...studio.config.title, enabled: true, title: "Studio Smoke", artist: "WaveCraft" }
  };
  const FRAMES = Math.round(2.7 * 60);
  for (let i = 0; i <= FRAMES; i++) {
    const t = i / 60;
    renderFrame(ctx, t, beatFrame(t), cfg, { duration: 2.7 });
  }
  const img = ctx.getImageData(0, 0, W, H).data;
  const isBlue = (px) => img[px + 2] > 150 && img[px + 1] > 120 && img[px + 2] > img[px];
  let blueCount = 0;
  for (let p = 0; p < img.length; p += 4) if (isBlue(p)) blueCount++;
  let floatingCols = 0;
  let sampleCapY = -1;
  let sampleTopY = -1;
  for (let colX = Math.round(W * 0.06); colX < Math.round(W * 0.95); colX++) {
    let cCap = -1;
    let cTop = -1;
    let gapRun = 0;
    for (let yy = Math.round(H * 0.55); yy < Math.round(H * 0.92); yy++) {
      const px = (yy * W + colX) * 4;
      if (isBlue(px)) {
        if (cCap < 0) cCap = yy;
        if (cCap >= 0 && gapRun > 3 && cTop < 0) cTop = yy;
        gapRun = 0;
      } else if (cCap >= 0 && cTop < 0) {
        gapRun++;
      }
    }
    if (cCap > 0 && cTop > 0 && cTop - cCap > 4) {
      floatingCols++;
      if (sampleCapY < 0) {
        sampleCapY = cCap;
        sampleTopY = cTop;
      }
    }
  }
  let refCount = 0;
  for (let yy = 662; yy < 692; yy++) {
    for (let xx = Math.round(W * 0.1); xx < Math.round(W * 0.9); xx++) {
      const px = (yy * W + xx) * 4;
      if (img[px + 2] > 25 && img[px + 2] > img[px] + 6) refCount++;
    }
  }
  R.t5 = {
    presetRegistered: true,
    bluePixels: blueCount,
    floatingCols,
    sampleCapY,
    sampleTopY,
    capFloats: floatingCols >= 5,
    reflectionPixels: refCount,
    hasReflection: refCount > 50
  };
  window.__e2e = "t5-done";
  for (let i = 0; i < 600 && window.__go !== 1; i++) {
    await new Promise((r) => setTimeout(r, 200));
  }
  const audioCtx = new AudioContext();
  const wav = makeBeatWav(5);
  const audioBuffer = await audioCtx.decodeAudioData(await wav.arrayBuffer());
  void audioCtx.close();
  const blob = await exportVideo({
    audioBuffer,
    config: { ...cfg, title: { ...cfg.title, enabled: false } },
    assets: { duration: 2 },
    settings: { resolution: "720p", fps: 30, bitrate: 8, mode: "trim", loopStart: 0, trimStart: 1, trimEnd: 3 },
    start: 1,
    duration: 2,
    onProgress: () => {
    }
  }).promise;
  const mp4 = parseMp4(await blob.arrayBuffer());
  R.t6 = {
    bytes: mp4.bytes,
    boxes: mp4.boxes,
    handlers: mp4.handlers,
    durationSec: Math.round(mp4.durationSec * 100) / 100,
    hasVide: mp4.handlers.includes("vide"),
    hasSoun: mp4.handlers.includes("soun"),
    durationOk: Math.abs(mp4.durationSec - 2) < 0.3
  };
  window.__e2e = "done";
}
main().catch((e) => {
  window.__err = e instanceof Error ? `${e.message}
${e.stack}` : String(e);
  window.__e2e = "error";
});
/*! Bundled license information:

react/cjs/react.development.js:
  (**
   * @license React
   * react.development.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)
*/
