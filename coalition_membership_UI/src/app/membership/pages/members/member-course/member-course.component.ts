import { Component, OnInit } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

import { CommonService } from "src/app/services/common.service";
import { ConfigurationService } from "src/app/services/configuration.service";
import { MemberService } from "src/app/services/member.service";
import { UserService } from "src/app/services/user.service";

import { Router } from "@angular/router";
import { IMembersGetDto } from "src/app/models/auth/membersDto";
import { UserView } from "src/app/models/auth/userDto";
import { ICourseGetDto } from "src/app/models/configuration/ICourseDto";
import { DonationEventGetDto } from "src/app/models/configuration/IdonationDto";
import { DonationEventService } from "src/app/services/donationevent.service";
import {
  IDonationData,
  IMakeDonation,
} from "src/app/models/payment/IPaymentDto";
import { PaymentService } from "src/app/services/payment.service";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-member-course",
  templateUrl: "./member-course.component.html",
  styleUrls: ["./member-course.component.scss"],
})
export class MemberCourseComponent implements OnInit {
  first: number = 0;
  rows: number = 3;
  returnUrl = environment.clienUrl + "/auth/donation-verfication/";
  Course: DonationEventGetDto[];
  paginatedCourse: DonationEventGetDto[];
  member: IMembersGetDto;
  userview: UserView;
  ngOnInit(): void {
    this.getCourses();
  }

  constructor(
    private userService: UserService,
    private commonService: CommonService,
    // private confirmationService: ConfirmationService,
    private memberService: MemberService,
    private router: Router,
    private modalService: NgbModal,
    private paymentService: PaymentService,
    private donationEventService: DonationEventService
  ) {}

  getCourses() {
    this.donationEventService.getAll().subscribe({
      next: (res) => {
        if (res.success) {
          this.Course = res.data;
          this.paginateCourse();
        }
      },
    });
  }

  onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
    this.paginateCourse();
  }
  getImage(url: string) {
    return this.commonService.createImgPath(url);
  }

  paginateCourse() {
    this.paginatedCourse = this.Course.slice(
      this.first,
      this.first + this.rows
    );
  }

  onDonate(event: DonationEventGetDto): void {
    var donationDto: IDonationData = {
      amount: event.amount,
      currency: "ETB",
      return_url: this.returnUrl,
    };

    this.paymentService.donation(donationDto).subscribe({
      next: (res) => {
        var mapayment: IMakeDonation = {
          eventId: event.id,
          payment: event.amount,
          text_Rn: res.response.tx_ref,
          url: res.response.data.checkout_url,
        };
        var url = res.response.data.checkout_url;
        this.makePayment(mapayment, url);
      },
      error: (err) => {
        //this.messageService.add({ severity: 'error', summary: 'Something went wron!!!', detail: err.message });
      },
    });
  }
  makePayment(makePay: IMakeDonation, url: string) {
    this.paymentService.MakeDonation(makePay).subscribe({
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
}
