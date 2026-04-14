import {
  HttpClient,
  HttpParams,
  environment,
  inject,
  ɵɵdefineInjectable
} from "./chunk-XK4KG74O.js";

// src/app/core/models/appointment.model.ts
var AppointmentStatus;
(function(AppointmentStatus2) {
  AppointmentStatus2["BOOKED"] = "BOOKED";
  AppointmentStatus2["CANCELLED"] = "CANCELLED";
  AppointmentStatus2["DONE"] = "DONE";
})(AppointmentStatus || (AppointmentStatus = {}));
var STATUS_LABEL = {
  BOOKED: "Confirm\xE9",
  CANCELLED: "Annul\xE9",
  DONE: "Termin\xE9"
};

// src/app/core/services/appointment.service.ts
var AppointmentService = class _AppointmentService {
  constructor() {
    this.http = inject(HttpClient);
    this.base = `${environment.apiUrl}/appointments`;
  }
  getAll() {
    return this.http.get(this.base);
  }
  getByDateRange(start, end) {
    const params = new HttpParams().set("start", start).set("end", end);
    return this.http.get(`${this.base}/range`, { params });
  }
  create(payload) {
    return this.http.post(this.base, payload);
  }
  updateStatus(id, status) {
    return this.http.patch(`${this.base}/${id}/status`, { status });
  }
  cancel(id) {
    return this.updateStatus(id, AppointmentStatus.CANCELLED);
  }
  getAvailableSlots(date, serviceId) {
    const params = new HttpParams().set("date", date).set("serviceId", serviceId);
    return this.http.get(`${this.base}/slots`, { params });
  }
  static {
    this.\u0275fac = function AppointmentService_Factory(t) {
      return new (t || _AppointmentService)();
    };
  }
  static {
    this.\u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _AppointmentService, factory: _AppointmentService.\u0275fac, providedIn: "root" });
  }
};

export {
  AppointmentStatus,
  STATUS_LABEL,
  AppointmentService
};
//# sourceMappingURL=chunk-L26RLP3U.js.map
