import {
  HttpClient,
  environment,
  inject,
  ɵɵdefineInjectable
} from "./chunk-XK4KG74O.js";

// src/app/core/services/service-api.service.ts
var ServiceApiService = class _ServiceApiService {
  constructor() {
    this.http = inject(HttpClient);
    this.base = `${environment.apiUrl}/services`;
  }
  getAll() {
    return this.http.get(this.base);
  }
  create(payload) {
    return this.http.post(this.base, payload);
  }
  update(id, payload) {
    return this.http.put(`${this.base}/${id}`, payload);
  }
  delete(id) {
    return this.http.delete(`${this.base}/${id}`);
  }
  static {
    this.\u0275fac = function ServiceApiService_Factory(t) {
      return new (t || _ServiceApiService)();
    };
  }
  static {
    this.\u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _ServiceApiService, factory: _ServiceApiService.\u0275fac, providedIn: "root" });
  }
};

export {
  ServiceApiService
};
//# sourceMappingURL=chunk-IRS4YOUZ.js.map
