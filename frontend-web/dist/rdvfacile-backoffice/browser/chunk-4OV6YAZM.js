import {
  AuthService,
  Router,
  RouterLink
} from "./chunk-HKVVDLZ3.js";
import {
  MatInput,
  MatInputModule,
  MatSnackBar,
  MatSnackBarModule
} from "./chunk-B2WSOSFV.js";
import {
  MatButton,
  MatButtonModule,
  MatIconButton
} from "./chunk-SBXOYABV.js";
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardModule,
  MatCardSubtitle,
  MatError,
  MatFormField,
  MatFormFieldModule,
  MatLabel,
  MatProgressSpinner,
  MatProgressSpinnerModule,
  MatSuffix
} from "./chunk-QHYTZ6PU.js";
import {
  DefaultValueAccessor,
  FormBuilder,
  FormControlName,
  FormGroupDirective,
  MatIcon,
  MatIconModule,
  NgControlStatus,
  NgControlStatusGroup,
  ReactiveFormsModule,
  Validators,
  ɵNgNoValidate
} from "./chunk-7IXS3RK7.js";
import {
  inject,
  signal,
  ɵsetClassDebugInfo,
  ɵɵStandaloneFeature,
  ɵɵadvance,
  ɵɵconditional,
  ɵɵdefineComponent,
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵlistener,
  ɵɵproperty,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate
} from "./chunk-XK4KG74O.js";

// src/app/features/auth/login/login.component.ts
function LoginComponent_Conditional_18_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "mat-error");
    \u0275\u0275text(1, "L'email est requis");
    \u0275\u0275elementEnd();
  }
}
function LoginComponent_Conditional_19_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "mat-error");
    \u0275\u0275text(1, "Email invalide");
    \u0275\u0275elementEnd();
  }
}
function LoginComponent_Conditional_27_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "mat-error");
    \u0275\u0275text(1, "Le mot de passe est requis");
    \u0275\u0275elementEnd();
  }
}
function LoginComponent_Conditional_29_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "mat-spinner", 10);
  }
}
function LoginComponent_Conditional_30_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275text(0, " Se connecter ");
  }
}
var LoginComponent = class _LoginComponent {
  constructor() {
    this.auth = inject(AuthService);
    this.router = inject(Router);
    this.fb = inject(FormBuilder);
    this.snack = inject(MatSnackBar);
    this.showPassword = signal(false);
    this.loading = signal(false);
    this.form = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", Validators.required]
    });
  }
  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    const { email, password } = this.form.value;
    this.auth.login({ email, password }).subscribe({
      next: () => this.router.navigate(["/dashboard"]),
      error: (err) => {
        this.snack.open(err.error?.message ?? "Email ou mot de passe incorrect", "Fermer", { duration: 4e3 });
        this.loading.set(false);
      }
    });
  }
  static {
    this.\u0275fac = function LoginComponent_Factory(t) {
      return new (t || _LoginComponent)();
    };
  }
  static {
    this.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _LoginComponent, selectors: [["app-login"]], standalone: true, features: [\u0275\u0275StandaloneFeature], decls: 36, vars: 8, consts: [[1, "auth-page"], [1, "auth-card"], [1, "auth-logo"], [3, "ngSubmit", "formGroup"], ["appearance", "outline", 1, "full-width"], ["matInput", "", "type", "email", "formControlName", "email", "autocomplete", "email"], ["matSuffix", ""], ["matInput", "", "formControlName", "password", "autocomplete", "current-password", 3, "type"], ["mat-icon-button", "", "matSuffix", "", "type", "button", 3, "click"], ["mat-raised-button", "", "color", "primary", "type", "submit", 1, "full-width", "submit-btn", 3, "disabled"], ["diameter", "20"], [1, "register-link"], ["routerLink", "/register"]], template: function LoginComponent_Template(rf, ctx) {
      if (rf & 1) {
        \u0275\u0275elementStart(0, "div", 0)(1, "mat-card", 1)(2, "mat-card-header")(3, "div", 2)(4, "mat-icon");
        \u0275\u0275text(5, "event_available");
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(6, "h1");
        \u0275\u0275text(7, "RdvFacile");
        \u0275\u0275elementEnd()();
        \u0275\u0275elementStart(8, "mat-card-subtitle");
        \u0275\u0275text(9, "Connectez-vous \xE0 votre espace marchand");
        \u0275\u0275elementEnd()();
        \u0275\u0275elementStart(10, "mat-card-content")(11, "form", 3);
        \u0275\u0275listener("ngSubmit", function LoginComponent_Template_form_ngSubmit_11_listener() {
          return ctx.onSubmit();
        });
        \u0275\u0275elementStart(12, "mat-form-field", 4)(13, "mat-label");
        \u0275\u0275text(14, "Email");
        \u0275\u0275elementEnd();
        \u0275\u0275element(15, "input", 5);
        \u0275\u0275elementStart(16, "mat-icon", 6);
        \u0275\u0275text(17, "email");
        \u0275\u0275elementEnd();
        \u0275\u0275template(18, LoginComponent_Conditional_18_Template, 2, 0, "mat-error")(19, LoginComponent_Conditional_19_Template, 2, 0, "mat-error");
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(20, "mat-form-field", 4)(21, "mat-label");
        \u0275\u0275text(22, "Mot de passe");
        \u0275\u0275elementEnd();
        \u0275\u0275element(23, "input", 7);
        \u0275\u0275elementStart(24, "button", 8);
        \u0275\u0275listener("click", function LoginComponent_Template_button_click_24_listener() {
          return ctx.showPassword.set(!ctx.showPassword());
        });
        \u0275\u0275elementStart(25, "mat-icon");
        \u0275\u0275text(26);
        \u0275\u0275elementEnd()();
        \u0275\u0275template(27, LoginComponent_Conditional_27_Template, 2, 0, "mat-error");
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(28, "button", 9);
        \u0275\u0275template(29, LoginComponent_Conditional_29_Template, 1, 0, "mat-spinner", 10)(30, LoginComponent_Conditional_30_Template, 1, 0);
        \u0275\u0275elementEnd()()();
        \u0275\u0275elementStart(31, "mat-card-actions")(32, "p", 11);
        \u0275\u0275text(33, " Pas encore de compte ? ");
        \u0275\u0275elementStart(34, "a", 12);
        \u0275\u0275text(35, "Cr\xE9er un compte");
        \u0275\u0275elementEnd()()()()();
      }
      if (rf & 2) {
        let tmp_1_0;
        let tmp_2_0;
        let tmp_5_0;
        \u0275\u0275advance(11);
        \u0275\u0275property("formGroup", ctx.form);
        \u0275\u0275advance(7);
        \u0275\u0275conditional(18, ((tmp_1_0 = ctx.form.get("email")) == null ? null : tmp_1_0.hasError("required")) && ((tmp_1_0 = ctx.form.get("email")) == null ? null : tmp_1_0.touched) ? 18 : -1);
        \u0275\u0275advance();
        \u0275\u0275conditional(19, ((tmp_2_0 = ctx.form.get("email")) == null ? null : tmp_2_0.hasError("email")) ? 19 : -1);
        \u0275\u0275advance(4);
        \u0275\u0275property("type", ctx.showPassword() ? "text" : "password");
        \u0275\u0275advance(3);
        \u0275\u0275textInterpolate(ctx.showPassword() ? "visibility_off" : "visibility");
        \u0275\u0275advance();
        \u0275\u0275conditional(27, ((tmp_5_0 = ctx.form.get("password")) == null ? null : tmp_5_0.hasError("required")) && ((tmp_5_0 = ctx.form.get("password")) == null ? null : tmp_5_0.touched) ? 27 : -1);
        \u0275\u0275advance();
        \u0275\u0275property("disabled", ctx.loading());
        \u0275\u0275advance();
        \u0275\u0275conditional(29, ctx.loading() ? 29 : 30);
      }
    }, dependencies: [
      ReactiveFormsModule,
      \u0275NgNoValidate,
      DefaultValueAccessor,
      NgControlStatus,
      NgControlStatusGroup,
      FormGroupDirective,
      FormControlName,
      RouterLink,
      MatCardModule,
      MatCard,
      MatCardActions,
      MatCardContent,
      MatCardHeader,
      MatCardSubtitle,
      MatFormFieldModule,
      MatFormField,
      MatLabel,
      MatError,
      MatSuffix,
      MatInputModule,
      MatInput,
      MatButtonModule,
      MatButton,
      MatIconButton,
      MatIconModule,
      MatIcon,
      MatSnackBarModule,
      MatProgressSpinnerModule,
      MatProgressSpinner
    ], styles: ["\n\n.auth-page[_ngcontent-%COMP%] {\n  min-height: 100vh;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background:\n    linear-gradient(\n      135deg,\n      #1e7e34 0%,\n      #155724 100%);\n  padding: 16px;\n}\n.auth-card[_ngcontent-%COMP%] {\n  width: 100%;\n  max-width: 420px;\n  padding: 16px;\n  border-radius: 12px;\n}\n.auth-logo[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  width: 100%;\n  margin-bottom: 4px;\n  h1 {\n    margin: 0;\n    font-size: 1.5rem;\n    color: #1e7e34;\n  }\n  mat-icon {\n    color: #1e7e34;\n    font-size: 1.8rem;\n    width: 1.8rem;\n    height: 1.8rem;\n  }\n}\n.full-width[_ngcontent-%COMP%] {\n  width: 100%;\n  margin-bottom: 12px;\n}\n.submit-btn[_ngcontent-%COMP%] {\n  height: 48px;\n  font-size: 1rem;\n  margin-top: 8px;\n}\n.register-link[_ngcontent-%COMP%] {\n  text-align: center;\n  font-size: .875rem;\n  color: #666;\n}\n.register-link[_ngcontent-%COMP%]   a[_ngcontent-%COMP%] {\n  color: #1e7e34;\n  font-weight: 600;\n  text-decoration: none;\n}\nmat-spinner[_ngcontent-%COMP%] {\n  display: inline-block;\n}\n/*# sourceMappingURL=login.component.css.map */"] });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(LoginComponent, { className: "LoginComponent" });
})();
export {
  LoginComponent
};
//# sourceMappingURL=chunk-4OV6YAZM.js.map
