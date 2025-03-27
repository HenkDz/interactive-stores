var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-LGk82p/checked-fetch.js
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
function formatStoreDataFromD1(stores, deals) {
  const formattedStores = {};
  for (const store of stores) {
    formattedStores[store.id] = {
      name: store.name,
      logo: store.logo,
      bgColor: store.bg_color,
      color: store.color,
      active: Boolean(store.active),
      deals: []
    };
  }
  for (const deal of deals) {
    if (formattedStores[deal.store_id]) {
      formattedStores[deal.store_id].deals.push({
        id: deal.id.toString(),
        title: deal.title,
        description: deal.description,
        importance: deal.importance,
        link: deal.link,
        active: Boolean(deal.active)
      });
    }
  }
  return formattedStores;
}
__name(formatStoreDataFromD1, "formatStoreDataFromD1");
function formatFooterLinksFromD1(categories, links) {
  const formattedLinks = {};
  for (const category of categories) {
    formattedLinks[category.name] = [];
  }
  for (const link of links) {
    const category = categories.find((c) => c.id === link.category_id);
    if (category) {
      formattedLinks[category.name].push({
        id: link.id.toString(),
        title: link.title,
        link: link.link,
        active: Boolean(link.active)
      });
    }
  }
  return formattedLinks;
}
__name(formatFooterLinksFromD1, "formatFooterLinksFromD1");
var worker_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const isLocalDev = !env.STORES_DB;
    const useD1 = !isLocalDev || isLocalDev && env.STORES_DB;
    const kv = isLocalDev && !useD1 ? {
      get: /* @__PURE__ */ __name((key, options) => getLocalKvValue(key, options), "get"),
      put: /* @__PURE__ */ __name((key, value) => putLocalKvValue(key, value), "put")
    } : env.STORE_DATA;
    const db = useD1 ? env.STORES_DB : null;
    if (url.pathname.startsWith("/api/")) {
      if (url.pathname === "/api/data" && request.method === "GET") {
        try {
          console.log("API request for /api/data");
          console.log("isLocalDev:", isLocalDev);
          console.log("useD1:", useD1);
          console.log("env.STORES_DB:", !!env.STORES_DB);
          if (useD1) {
            console.log("Using D1 database");
            const [stores2, deals, categories, links, admins2] = await Promise.all([
              db.prepare("SELECT * FROM stores WHERE active = 1").all(),
              db.prepare("SELECT * FROM deals WHERE active = 1").all(),
              db.prepare("SELECT * FROM footer_link_categories").all(),
              db.prepare("SELECT * FROM footer_links WHERE active = 1").all(),
              db.prepare("SELECT id, username, role FROM admins").all()
            ]);
            console.log("D1 query results:");
            console.log("stores:", stores2.results.length);
            console.log("deals:", deals.results.length);
            console.log("categories:", categories.results.length);
            console.log("links:", links.results.length);
            console.log("admins:", admins2.results.length);
            const formattedStores = formatStoreDataFromD1(stores2.results, deals.results);
            const formattedFooterLinks = formatFooterLinksFromD1(categories.results, links.results);
            return new Response(JSON.stringify({
              stores: formattedStores,
              footerLinks: formattedFooterLinks,
              admins: admins2.results
            }), {
              headers: {
                "Content-Type": "application/json"
              }
            });
          }
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
          if (useD1) {
            await db.exec("BEGIN TRANSACTION");
            try {
              if (data.stores) {
                for (const [storeId, storeData] of Object.entries(data.stores)) {
                  const existingStore = await db.prepare("SELECT id FROM stores WHERE id = ?").bind(storeId).first();
                  if (existingStore) {
                    await db.prepare(`
                      UPDATE stores 
                      SET name = ?, logo = ?, bg_color = ?, color = ?, active = ?, updated_at = CURRENT_TIMESTAMP
                      WHERE id = ?
                    `).bind(
                      storeData.name,
                      storeData.logo,
                      storeData.bgColor,
                      storeData.color,
                      storeData.active ? 1 : 0,
                      storeId
                    ).run();
                  } else {
                    const result = await db.prepare(`
                      INSERT INTO stores (name, logo, bg_color, color, active)
                      VALUES (?, ?, ?, ?, ?)
                    `).bind(
                      storeData.name,
                      storeData.logo,
                      storeData.bgColor,
                      storeData.color,
                      storeData.active ? 1 : 0
                    ).run();
                  }
                  if (storeData.deals && storeData.deals.length > 0) {
                    await db.prepare("DELETE FROM deals WHERE store_id = ?").bind(storeId).run();
                    for (const deal of storeData.deals) {
                      await db.prepare(`
                        INSERT INTO deals (store_id, title, description, importance, link, active)
                        VALUES (?, ?, ?, ?, ?, ?)
                      `).bind(
                        storeId,
                        deal.title,
                        deal.description || "",
                        deal.importance || "medium",
                        deal.link || "",
                        deal.active ? 1 : 0
                      ).run();
                    }
                  }
                }
              }
              if (data.footerLinks) {
                for (const [categoryName, links] of Object.entries(data.footerLinks)) {
                  const category = await db.prepare("SELECT id FROM footer_link_categories WHERE name = ?").bind(categoryName).first();
                  if (!category) continue;
                  await db.prepare("DELETE FROM footer_links WHERE category_id = ?").bind(category.id).run();
                  if (links && links.length > 0) {
                    for (const link of links) {
                      await db.prepare(`
                        INSERT INTO footer_links (category_id, title, link, active)
                        VALUES (?, ?, ?, ?)
                      `).bind(
                        category.id,
                        link.title,
                        link.link,
                        link.active ? 1 : 0
                      ).run();
                    }
                  }
                }
              }
              await db.exec("COMMIT");
            } catch (error) {
              await db.exec("ROLLBACK");
              throw error;
            }
            return new Response(JSON.stringify({ success: true }), {
              headers: {
                "Content-Type": "application/json"
              }
            });
          }
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
      if (url.pathname === "/api/admin/init-db" && request.method === "POST") {
        try {
          return new Response(JSON.stringify({
            success: true,
            message: "Use the bun run init-d1 command to initialize the database"
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
      if (url.pathname === "/api/admin/stores" && request.method === "GET") {
        try {
          if (useD1) {
            const stores2 = await db.prepare("SELECT * FROM stores ORDER BY name").all();
            return new Response(JSON.stringify({
              success: true,
              stores: stores2.results
            }), {
              headers: {
                "Content-Type": "application/json"
              }
            });
          }
          const stores = await kv.get("stores", { type: "json" });
          return new Response(JSON.stringify({
            success: true,
            stores: stores || {}
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
      if (url.pathname.startsWith("/api/admin/stores/") && request.method === "GET") {
        try {
          const storeId = url.pathname.split("/").pop();
          if (useD1) {
            const [store2, deals] = await Promise.all([
              db.prepare("SELECT * FROM stores WHERE id = ?").bind(storeId).first(),
              db.prepare("SELECT * FROM deals WHERE store_id = ? ORDER BY title").bind(storeId).all()
            ]);
            if (!store2) {
              return new Response(JSON.stringify({
                success: false,
                error: "Store not found"
              }), {
                status: 404,
                headers: {
                  "Content-Type": "application/json"
                }
              });
            }
            return new Response(JSON.stringify({
              success: true,
              store: {
                ...store2,
                deals: deals.results
              }
            }), {
              headers: {
                "Content-Type": "application/json"
              }
            });
          }
          const stores = await kv.get("stores", { type: "json" });
          const store = stores?.[storeId];
          if (!store) {
            return new Response(JSON.stringify({
              success: false,
              error: "Store not found"
            }), {
              status: 404,
              headers: {
                "Content-Type": "application/json"
              }
            });
          }
          return new Response(JSON.stringify({
            success: true,
            store
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
      if (url.pathname === "/api/admin/stores" && request.method === "POST") {
        try {
          const data = await request.json();
          if (useD1) {
            await db.exec("BEGIN TRANSACTION");
            try {
              const result = await db.prepare(`
                INSERT INTO stores (name, logo, bg_color, color, active)
                VALUES (?, ?, ?, ?, ?)
              `).bind(
                data.name,
                data.logo,
                data.bgColor,
                data.color,
                data.active ? 1 : 0
              ).run();
              const storeId2 = result.meta.last_row_id;
              if (data.deals && data.deals.length > 0) {
                for (const deal of data.deals) {
                  await db.prepare(`
                    INSERT INTO deals (store_id, title, description, importance, link, active)
                    VALUES (?, ?, ?, ?, ?, ?)
                  `).bind(
                    storeId2,
                    deal.title,
                    deal.description || "",
                    deal.importance || "medium",
                    deal.link || "",
                    deal.active ? 1 : 0
                  ).run();
                }
              }
              await db.exec("COMMIT");
              return new Response(JSON.stringify({
                success: true,
                storeId: storeId2
              }), {
                headers: {
                  "Content-Type": "application/json"
                }
              });
            } catch (error) {
              await db.exec("ROLLBACK");
              throw error;
            }
          }
          const stores = await kv.get("stores", { type: "json" }) || {};
          const storeId = `store-${Date.now()}`;
          stores[storeId] = {
            name: data.name,
            logo: data.logo,
            bgColor: data.bgColor,
            color: data.color,
            active: data.active,
            deals: data.deals || []
          };
          await kv.put("stores", JSON.stringify(stores));
          return new Response(JSON.stringify({
            success: true,
            storeId
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

// .wrangler/tmp/bundle-LGk82p/middleware-insertion-facade.js
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

// .wrangler/tmp/bundle-LGk82p/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
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
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
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
