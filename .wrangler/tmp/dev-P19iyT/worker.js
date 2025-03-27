var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-8l1lLN/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// src/worker.js
async function getLocalKvValue(key, options = {}) {
  try {
    const filePath = `./dev-data/${key}.json`;
    let data;
    try {
      const file = Bun ? Bun.file(filePath) : null;
      if (file && await file.exists()) {
        data = await file.text();
      } else {
        const response = await fetch(`file://${filePath}`);
        if (response.ok) {
          data = await response.text();
        } else {
          return null;
        }
      }
      return options.type === "json" ? JSON.parse(data) : data;
    } catch (e) {
      console.error("File read error:", e);
      return null;
    }
  } catch (error) {
    console.error(`Error reading local KV value for key ${key}:`, error);
    return null;
  }
}
__name(getLocalKvValue, "getLocalKvValue");
async function putLocalKvValue(key, value) {
  try {
    const filePath = `./dev-data/${key}.json`;
    const stringValue = typeof value === "string" ? value : JSON.stringify(value, null, 2);
    if (typeof Bun !== "undefined") {
      await Bun.write(filePath, stringValue);
    } else {
      console.warn("Writing to local filesystem is not supported in this environment");
    }
    return true;
  } catch (error) {
    console.error(`Error writing local KV value for key ${key}:`, error);
    return false;
  }
}
__name(putLocalKvValue, "putLocalKvValue");
var worker_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const isLocalDev = env.STORE_DATA === void 0;
    const kv = isLocalDev ? {
      get: (key, options) => getLocalKvValue(key, options),
      put: (key, value) => putLocalKvValue(key, value)
    } : env.STORE_DATA;
    if (url.pathname.startsWith("/api/")) {
      if (url.pathname === "/api/data" && request.method === "GET") {
        try {
          const stores = await kv.get("stores", { type: "json" });
          const footerLinks = await kv.get("footerLinks", { type: "json" });
          const admins = await kv.get("admins", { type: "json" });
          return new Response(JSON.stringify({
            stores: stores || {},
            footerLinks: footerLinks || {},
            admins: admins || []
          }), {
            headers: {
              "Content-Type": "application/json"
            }
          });
        } catch (error) {
          return new Response(
            JSON.stringify({
              success: false,
              error: error.message
            }),
            {
              status: 500,
              headers: {
                "Content-Type": "application/json"
              }
            }
          );
        }
      }
      if (url.pathname === "/api/admin/save" && request.method === "POST") {
        try {
          const data = await request.json();
          if (data.stores) {
            await kv.put("stores", JSON.stringify(data.stores));
          }
          if (data.footerLinks) {
            await kv.put("footerLinks", JSON.stringify(data.footerLinks));
          }
          return new Response(JSON.stringify({ success: true }), {
            headers: {
              "Content-Type": "application/json"
            }
          });
        } catch (error) {
          return new Response(
            JSON.stringify({
              success: false,
              error: error.message
            }),
            {
              status: 500,
              headers: {
                "Content-Type": "application/json"
              }
            }
          );
        }
      }
      if (url.pathname === "/api/admin/init-kv" && request.method === "POST") {
        try {
          return new Response(JSON.stringify({
            success: true,
            message: "Use the bun run init-kv command to initialize the KV store"
          }), {
            headers: {
              "Content-Type": "application/json"
            }
          });
        } catch (error) {
          return new Response(
            JSON.stringify({
              success: false,
              error: error.message
            }),
            {
              status: 500,
              headers: {
                "Content-Type": "application/json"
              }
            }
          );
        }
      }
      return new Response(JSON.stringify({
        success: false,
        error: "API endpoint not found"
      }), {
        status: 404,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    if (env.ASSETS) {
      return await env.ASSETS.fetch(request);
    }
    if (url.pathname === "/" || url.pathname === "") {
      return new Response("Welcome to stores.deals API. Web app is served from Cloudflare Pages.", {
        headers: {
          "Content-Type": "text/plain"
        }
      });
    }
    return new Response("Not found", {
      status: 404,
      headers: {
        "Content-Type": "text/plain"
      }
    });
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-8l1lLN/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-8l1lLN/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
__name(__Facade_ScheduledController__, "__Facade_ScheduledController__");
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=worker.js.map
