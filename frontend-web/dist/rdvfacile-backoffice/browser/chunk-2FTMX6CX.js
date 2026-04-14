import {
  HttpClient,
  environment,
  inject,
  ɵɵdefineInjectable
} from "./chunk-XK4KG74O.js";

// src/app/core/services/customer.service.ts
var CustomerService = class _CustomerService {
  constructor() {
    this.http = inject(HttpClient);
    this.base = `${environment.apiUrl}/customers`;
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
  static {
    this.\u0275fac = function CustomerService_Factory(t) {
      return new (t || _CustomerService)();
    };
  }
  static {
    this.\u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _CustomerService, factory: _CustomerService.\u0275fac, providedIn: "root" });
  }
};

export {
  CustomerService
};
//# sourceMappingURL=chunk-2FTMX6CX.js.map
