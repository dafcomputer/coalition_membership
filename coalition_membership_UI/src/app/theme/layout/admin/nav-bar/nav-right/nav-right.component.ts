// Angular import
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { AuthGuard } from "src/app/auth/auth.guard";
import { EventDescriptionComponent } from "src/app/membership/pages/configuration/event-description/event-description.component";
import { UserView } from "src/app/models/auth/userDto";
import { ICourseGetDto } from "src/app/models/configuration/ICourseDto";
import { DonationEventGetDto } from "src/app/models/configuration/IdonationDto";
import { IDonationData, IMakeDonation } from "src/app/models/payment/IPaymentDto";
import { CommonService } from "src/app/services/common.service";
import { ConfigurationService } from "src/app/services/configuration.service";
import { DonationEventService } from "src/app/services/donationevent.service";
import { PaymentService } from "src/app/services/payment.service";
import { UserService } from "src/app/services/user.service";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-nav-right",
  templateUrl: "./nav-right.component.html",
  styleUrls: ["./nav-right.component.scss"],
})
export class NavRightComponent implements OnInit {
  currentUser: UserView;
  events: DonationEventGetDto[] = [];
 returnUrl = environment.clienUrl + "/auth/donation-verfication/";
 
  ngOnInit(): void {
    this.currentUser = this.userService.getCurrentUser();

    if (this.currentUser.role.toUpperCase() == "MEMBER") {
      this.getAllDonation();
    }
  }

  constructor(
    private donationEventService: DonationEventService,
    private modalService: NgbModal,
    private router: Router,
    private authGuard: AuthGuard,
    private userService: UserService,
    private commonService : CommonService,
    private paymentService: PaymentService
  ) {}

  // getImage(){
  //   return this.commonService.createImgPath(this.currentUser.photo)
  // }

  getAllDonation() {
    this.donationEventService.getAll().subscribe({
      next: (res) => {
        if (res.success) {
          this.events = res.data.slice(0,10);
        } else {
        }
      },
    });
  }

  eventDescription(event: ICourseGetDto) {
    let modalRef = this.modalService.open(EventDescriptionComponent, {
      size: "lg",
      backdrop: "static",
    });

    modalRef.componentInstance.event = event;
  }

  detail(eventId: string) {
    this.router.navigate(["configuration/event-detail", eventId]);
  }


  getImage(url: string) {
    return this.commonService.createImgPath(url);
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

  logOut() {
    this.authGuard.logout();
  }
}
