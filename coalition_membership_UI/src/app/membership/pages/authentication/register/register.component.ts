import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from "@angular/forms";

import { UserService } from "src/app/services/user.service";

import { DropDownService } from "src/app/services/dropDown.service";

import { MemberService } from "src/app/services/member.service";
import { PaymentService } from "src/app/services/payment.service";
import { environment } from "src/environments/environment";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { IMembersPostDto } from "src/app/models/auth/membersDto";
import { UserView } from "src/app/models/auth/userDto";
import { IPaymentData, IMakePayment } from "src/app/models/payment/IPaymentDto";
import { SelectList } from "src/app/models/ResponseMessage.Model";
import { PendingMembersComponent } from "../../members/pending-members/pending-members.component";
import { errorToast } from "src/app/services/toast.service";
import { NgxIntlTelInputModule } from "ngx-intl-tel-input";
import { countries } from "countries-list";

import {
  SearchCountryField,
  CountryISO,
  PhoneNumberFormat,
} from "ngx-intl-tel-input";
import { TranslateModule, TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-register",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    NgxIntlTelInputModule,
    TranslateModule
  ],
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.scss"],
})
export default class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  user!: UserView;
  selectedCountry: string;
  returnUrl = environment.clienUrl + "/auth/payment-verfication/";
  constructor(
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private router: Router,
    private userService: UserService,
    private dropdownService: DropDownService,
    private modalService: NgbModal,
    private paymentService: PaymentService,
    private memberService: MemberService
  ) {
    translate.setDefaultLang("en");
    translate.use("en");
    if (localStorage.getItem("language") != null) {
      this.translate.use(localStorage.getItem("language"));
    }
  }

  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
  countries: SelectList[];
  regions: SelectList[];
  zones: SelectList[];
  memberships: SelectList[];

  countryType: string = "ETHIOPIAN";

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      firstName: ["", Validators.required],
      lastName: ["", Validators.required],
      phoneNumber: [undefined, [Validators.required]],
      email: ["", [Validators.email]],
      membershipType: ["", Validators.required],
      RegionId: [null, Validators.required],
      Zone: [null],
      woreda: [null],
    });
    this.getRegions(this.countryType);
  }

  getMemberships(category: string) {
    this.dropdownService.getMembershipDropDown(category).subscribe({
      next: (res) => {
        this.memberships = res;
      },
    });
  }

  getCountries() {
    this.dropdownService.getContriesDropdown().subscribe({
      next: (res) => {
        this.countries = res;
      },
    });
  }

  getRegions(countryType: string) {
    if (countryType === "ETHIOPIAN") {
      this.dropdownService.getRegionsDropdown(countryType).subscribe({
        next: (res) => {
          this.regions = res;
        },
      });
    } else {
      this.regions = Object.keys(countries).map((key) => ({
        name: countries[key].name,
        id: countries[key].name,
        value: key,
      }));

      if (this.registerForm.value.phoneNumber) {
        this.registerForm.patchValue({
          RegionId: this.regions.filter(
            (item) =>
              item.value == this.registerForm.value.phoneNumber.countryCode
          )[0].name,
        });
      }
    }
  }

  getZones(regionId: string) {
    this.dropdownService.getZonesDropdown(regionId).subscribe({
      next: (res) => {
        this.zones = res;
      },
    });
  }

  register() {
    var registerFor: IMembersPostDto = {
      firstName: this.registerForm.value.firstName,
      lastName: this.registerForm.value.lastName,
      phoneNumber: this.registerForm.value.phoneNumber.nationalNumber.replace(
        /\s+/g,
        ""
      ),
      email: this.registerForm.value.email,
      Zone: this.registerForm.value.Zone,
      RegionId: this.registerForm.value.RegionId,
      woreda: this.registerForm.value.woreda,
      membershipTypeId: this.registerForm.value.membershipType,
    };

    this.userService.register(registerFor).subscribe({
      next: (res) => {
        if (res.success) {
          var payment: IPaymentData = {
            amount: res.data.amount,
            currency: res.data.currency,
            email: res.data.email,
            first_name: res.data.fullName,
            last_name: "",
            phone_number: res.data.phoneNumber,
            return_url: this.returnUrl,
            title: `Payment for Membership`,
            description: res.data.memberId,
          };

          this.goTOPayment(payment, res.data);
        } else {
          errorToast(res.errorCode! || res.message, res.message);
          //this.messageService.add({ severity: 'error', summary: 'Something went Wrong!!!.', detail: res.message });
        }
      },
    });
  }

  checkIfPhoneNumberExist() {
    var phoneNumber =
      this.registerForm.value.phoneNumber.nationalNumber.replace(/\s+/g, "");

    if (this.registerForm.value.phoneNumber.countryCode == "ET") {
      this.countryType = "ETHIOPIAN";
      this.getRegions("ETHIOPIAN");
    } else {
      this.countryType = "FOREIGN";
      this.getRegions(this.registerForm.value.phoneNumber.countryCode);
    }

    this.memberService.checkIfPhoneNumberExist(phoneNumber).subscribe({
      next: (res) => {
        if (res.exist) {
          let modalRef = this.modalService.open(PendingMembersComponent, {
            size: "xl",
            backdrop: "static",
            scrollable: true,
          });
          modalRef.componentInstance.memberTelegram = res;
          this.registerForm.controls["phoneNumber"].setValue(undefined);
        } else {
        }
      },
    });
  }

  goTOPayment(payment: IPaymentData, member: any) {
    this.paymentService.payment(payment).subscribe({
      next: (res) => {
        var mapayment: IMakePayment = {
          memberId: member.id,
          membershipTypeId: member.membershipTypeId,
          payment: payment.amount,
          text_Rn: res.response.tx_ref,
          url: res.response.data.checkout_url,
        };

        var url = res.response.data.checkout_url;
        this.makePayment(mapayment, url);
      },
      error: (err) => {},
    });
  }
  makePayment(makePay: IMakePayment, url: string) {
    this.paymentService.MakePayment(makePay).subscribe({
      next: (res) => {
        if (res.success) {
          //this.messageService.add({ severity: 'success', summary: 'Successfull', detail: res.message });
          window.location.href = url;
        } else {
          //this.messageService.add({ severity: 'error', summary: 'Authentication failed.', detail: res.message });
        }
      },
      error: (err) => {
        //this.messageService.add({ severity: 'error', summary: 'Something went wron!!!', detail: err.message });
      },
    });
  }
  loginasMember() {
    this.router.navigateByUrl("/auth/membership-login");
  }
}
