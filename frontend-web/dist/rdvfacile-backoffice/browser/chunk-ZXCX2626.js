import {
  MatDivider,
  MatDividerModule
} from "./chunk-HJNXTWMQ.js";
import {
  AuthService
} from "./chunk-HKVVDLZ3.js";
import {
  AppointmentService,
  AppointmentStatus,
  STATUS_LABEL
} from "./chunk-L26RLP3U.js";
import {
  MatChipsModule
} from "./chunk-ZNZY2EC3.js";
import {
  ServiceApiService
} from "./chunk-IRS4YOUZ.js";
import {
  CustomerService
} from "./chunk-2FTMX6CX.js";
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardModule,
  MatCardTitle,
  MatProgressSpinner,
  MatProgressSpinnerModule
} from "./chunk-QHYTZ6PU.js";
import {
  MatIcon,
  MatIconModule
} from "./chunk-7IXS3RK7.js";
import {
  DatePipe,
  computed,
  inject,
  signal,
  ɵsetClassDebugInfo,
  ɵɵStandaloneFeature,
  ɵɵadvance,
  ɵɵclassMapInterpolate1,
  ɵɵconditional,
  ɵɵdefineComponent,
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵnextContext,
  ɵɵpipe,
  ɵɵpipeBind2,
  ɵɵpipeBind4,
  ɵɵrepeater,
  ɵɵrepeaterCreate,
  ɵɵstyleProp,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1,
  ɵɵtextInterpolate2
} from "./chunk-XK4KG74O.js";

// src/app/features/dashboard/dashboard.component.ts
var _forTrack0 = ($index, $item) => $item.label;
var _forTrack1 = ($index, $item) => $item.id;
function DashboardComponent_Conditional_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 3);
    \u0275\u0275element(1, "mat-spinner", 4);
    \u0275\u0275elementEnd();
  }
}
function DashboardComponent_Conditional_7_For_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "mat-card", 6)(1, "div", 9)(2, "mat-icon");
    \u0275\u0275text(3);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(4, "div", 10)(5, "div", 11);
    \u0275\u0275text(6);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "div", 12);
    \u0275\u0275text(8);
    \u0275\u0275elementEnd()()();
  }
  if (rf & 2) {
    const card_r1 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275styleProp("background", card_r1.color);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(card_r1.icon);
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate(card_r1.value);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(card_r1.label);
  }
}
function DashboardComponent_Conditional_7_Conditional_10_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "p", 8);
    \u0275\u0275text(1, "Aucun rendez-vous aujourd'hui");
    \u0275\u0275elementEnd();
  }
}
function DashboardComponent_Conditional_7_Conditional_11_For_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 13)(1, "div", 14);
    \u0275\u0275text(2);
    \u0275\u0275pipe(3, "date");
    \u0275\u0275pipe(4, "date");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "div", 15)(6, "span", 16);
    \u0275\u0275text(7);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(8, "span", 17);
    \u0275\u0275text(9);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(10, "span");
    \u0275\u0275text(11);
    \u0275\u0275elementEnd()();
    \u0275\u0275element(12, "mat-divider");
  }
  if (rf & 2) {
    const appt_r2 = ctx.$implicit;
    const ctx_r2 = \u0275\u0275nextContext(3);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate2(" ", \u0275\u0275pipeBind2(3, 8, appt_r2.startTime, "HH:mm"), " \u2013 ", \u0275\u0275pipeBind2(4, 11, appt_r2.endTime, "HH:mm"), " ");
    \u0275\u0275advance(5);
    \u0275\u0275textInterpolate(appt_r2.customerName);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(appt_r2.serviceName);
    \u0275\u0275advance();
    \u0275\u0275classMapInterpolate1("status-badge ", appt_r2.status.toLowerCase(), "");
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r2.STATUS_LABEL[appt_r2.status], " ");
  }
}
function DashboardComponent_Conditional_7_Conditional_11_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275repeaterCreate(0, DashboardComponent_Conditional_7_Conditional_11_For_1_Template, 13, 14, null, null, _forTrack1);
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext(2);
    \u0275\u0275repeater(ctx_r2.todayAppointments());
  }
}
function DashboardComponent_Conditional_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 5);
    \u0275\u0275repeaterCreate(1, DashboardComponent_Conditional_7_For_2_Template, 9, 5, "mat-card", 6, _forTrack0);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(3, "mat-card", 7)(4, "mat-card-header")(5, "mat-card-title")(6, "mat-icon");
    \u0275\u0275text(7, "today");
    \u0275\u0275elementEnd();
    \u0275\u0275text(8, " Rendez-vous aujourd'hui ");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(9, "mat-card-content");
    \u0275\u0275template(10, DashboardComponent_Conditional_7_Conditional_10_Template, 2, 0, "p", 8)(11, DashboardComponent_Conditional_7_Conditional_11_Template, 2, 0);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r2 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275repeater(ctx_r2.statCards());
    \u0275\u0275advance(9);
    \u0275\u0275conditional(10, ctx_r2.todayAppointments().length === 0 ? 10 : 11);
  }
}
var DashboardComponent = class _DashboardComponent {
  constructor() {
    this.auth = inject(AuthService);
    this.apptSvc = inject(AppointmentService);
    this.serviceSvc = inject(ServiceApiService);
    this.custSvc = inject(CustomerService);
    this.STATUS_LABEL = STATUS_LABEL;
    this.today = /* @__PURE__ */ new Date();
    this.loading = signal(true);
    this.appointments = signal([]);
    this.totalSvcs = signal(0);
    this.totalCusts = signal(0);
    this.todayAppointments = computed(() => {
      const todayStr = this.today.toISOString().slice(0, 10);
      return this.appointments().filter((a) => a.startTime.startsWith(todayStr) && a.status === AppointmentStatus.BOOKED);
    });
    this.statCards = computed(() => [
      {
        label: "RDV aujourd'hui",
        value: this.todayAppointments().length,
        icon: "event",
        color: "#1e7e34"
      },
      {
        label: "Total clients",
        value: this.totalCusts(),
        icon: "people",
        color: "#1976d2"
      },
      {
        label: "Services actifs",
        value: this.totalSvcs(),
        icon: "content_cut",
        color: "#f57c00"
      },
      {
        label: "RDV ce mois",
        value: this.monthCount(),
        icon: "calendar_month",
        color: "#7b1fa2"
      }
    ]);
  }
  monthCount() {
    const now = this.today;
    return this.appointments().filter((a) => {
      const d = new Date(a.startTime);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  }
  ngOnInit() {
    const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const start = fmt(new Date(this.today.getFullYear(), this.today.getMonth(), 1));
    const end = fmt(new Date(this.today.getFullYear(), this.today.getMonth() + 1, 0));
    this.apptSvc.getByDateRange(start, end).subscribe((appts) => this.appointments.set(appts));
    this.serviceSvc.getAll().subscribe((svcs) => this.totalSvcs.set(svcs.length));
    this.custSvc.getAll().subscribe((custs) => {
      this.totalCusts.set(custs.length);
      this.loading.set(false);
    });
  }
  static {
    this.\u0275fac = function DashboardComponent_Factory(t) {
      return new (t || _DashboardComponent)();
    };
  }
  static {
    this.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _DashboardComponent, selectors: [["app-dashboard"]], standalone: true, features: [\u0275\u0275StandaloneFeature], decls: 8, vars: 8, consts: [[1, "dashboard"], [1, "page-title"], [1, "page-subtitle"], [1, "loading-row"], ["diameter", "40"], [1, "stats-grid"], [1, "stat-card"], [1, "today-card"], [1, "empty-state"], [1, "stat-icon"], [1, "stat-info"], [1, "stat-value"], [1, "stat-label"], [1, "appt-row"], [1, "appt-time"], [1, "appt-info"], [1, "appt-customer"], [1, "appt-service"]], template: function DashboardComponent_Template(rf, ctx) {
      if (rf & 1) {
        \u0275\u0275elementStart(0, "div", 0)(1, "h2", 1);
        \u0275\u0275text(2);
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(3, "p", 2);
        \u0275\u0275text(4);
        \u0275\u0275pipe(5, "date");
        \u0275\u0275elementEnd();
        \u0275\u0275template(6, DashboardComponent_Conditional_6_Template, 2, 0, "div", 3)(7, DashboardComponent_Conditional_7_Template, 12, 1);
        \u0275\u0275elementEnd();
      }
      if (rf & 2) {
        let tmp_0_0;
        \u0275\u0275advance(2);
        \u0275\u0275textInterpolate1("Bonjour, ", (tmp_0_0 = ctx.auth.user()) == null ? null : tmp_0_0.businessName, " \u{1F44B}");
        \u0275\u0275advance(2);
        \u0275\u0275textInterpolate(\u0275\u0275pipeBind4(5, 3, ctx.today, "EEEE d MMMM yyyy", "", "fr"));
        \u0275\u0275advance(2);
        \u0275\u0275conditional(6, ctx.loading() ? 6 : 7);
      }
    }, dependencies: [DatePipe, MatCardModule, MatCard, MatCardContent, MatCardHeader, MatCardTitle, MatIconModule, MatIcon, MatDividerModule, MatDivider, MatProgressSpinnerModule, MatProgressSpinner, MatChipsModule], styles: ["\n\n.dashboard[_ngcontent-%COMP%] {\n  max-width: 960px;\n}\n.page-title[_ngcontent-%COMP%] {\n  font-size: 1.6rem;\n  font-weight: 700;\n  margin: 0 0 4px;\n}\n.page-subtitle[_ngcontent-%COMP%] {\n  color: #666;\n  margin: 0 0 24px;\n  text-transform: capitalize;\n}\n.loading-row[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: center;\n  padding: 60px;\n}\n.stats-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));\n  gap: 16px;\n  margin-bottom: 24px;\n}\n.stat-card[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: row;\n  align-items: center;\n  gap: 16px;\n  padding: 20px;\n  border-radius: 12px !important;\n}\n.stat-icon[_ngcontent-%COMP%] {\n  width: 56px;\n  height: 56px;\n  border-radius: 12px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  mat-icon {\n    color: white;\n    font-size: 1.5rem;\n  }\n}\n.stat-value[_ngcontent-%COMP%] {\n  font-size: 1.75rem;\n  font-weight: 700;\n  line-height: 1;\n}\n.stat-label[_ngcontent-%COMP%] {\n  font-size: .85rem;\n  color: #666;\n  margin-top: 4px;\n}\n.today-card[_ngcontent-%COMP%] {\n  border-radius: 12px !important;\n}\nmat-card-title[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n.appt-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 16px;\n  padding: 12px 0;\n}\n.appt-time[_ngcontent-%COMP%] {\n  font-size: .85rem;\n  color: #555;\n  min-width: 100px;\n  font-weight: 500;\n}\n.appt-info[_ngcontent-%COMP%] {\n  flex: 1;\n}\n.appt-customer[_ngcontent-%COMP%] {\n  font-weight: 600;\n  display: block;\n}\n.appt-service[_ngcontent-%COMP%] {\n  font-size: .8rem;\n  color: #777;\n}\n.empty-state[_ngcontent-%COMP%] {\n  color: #999;\n  text-align: center;\n  padding: 24px 0;\n}\n/*# sourceMappingURL=dashboard.component.css.map */"] });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(DashboardComponent, { className: "DashboardComponent" });
})();
export {
  DashboardComponent
};
//# sourceMappingURL=chunk-ZXCX2626.js.map
