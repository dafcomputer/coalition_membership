import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, ActivatedRouteSnapshot, RouterModule } from '@angular/router';
import { DonationDetailModalComponent } from './donation-detail-modal/donation-detail-modal.component';
import { environment } from 'src/environments/environment';
import { errorToast, successToast } from 'src/app/services/toast.service';
import { PaymentService } from 'src/app/services/payment.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-donation-verification',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './donation-verification.component.html',
  styleUrl: './donation-verification.component.scss'
})
export class DonationVerificationComponent implements OnInit {
  txt_rn: string;
  phoneNumber:string
  baseUrl = environment.clienUrl;
  message :string



  constructor(
    private route: ActivatedRoute,
    private paymentService: PaymentService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    const snapshot: ActivatedRouteSnapshot = this.route.snapshot;
    this.txt_rn = snapshot.paramMap.get("txt_rn");

    
    this.verifyPayment();

  }

  verifyPayment() {
    this.paymentService.verifyPayment(this.txt_rn).subscribe({
      next: (res) => {
        if (res.response) {
          if (res.response.data.status == "success") {

            

            this.phoneNumber = res.response.data.phone_number
            this.MakePaymentConfirmation();
          } else {
            
            errorToast(res.response.status || res.message, res.message);
            // this.messageService.add({ severity: 'error', summary: 'Something went Wrong', detail: res.response.data.status });
          }
        } else {
          errorToast(res.response.status || res.message, res.message);
          //this.messageService.add({ severity: 'error', summary: 'Something went Wrong', detail: res.message });
        }
      },
      error: (err) => {
        errorToast(err);
        // this.messageService.add({ severity: 'success', summary: 'Successfull', detail: err });
      },
    });
  }

  MakePaymentConfirmation() {
    this.paymentService.MakeDonationConfirmation(this.txt_rn,this.phoneNumber).subscribe({
      next: (res) => {
        if(res.success){
          successToast("Your Payment was successfull");
          this.message = `${res.message}\n${res.data}`;
        }

        this.openModal();
      },
    });
  }


  openModal() {
    let modalRef = this.modalService.open(DonationDetailModalComponent, {
      size: "lg",
      backdrop:'static'
    });

   

    modalRef.componentInstance.phone_number = this.phoneNumber
    modalRef.componentInstance.message  = this.message

    modalRef.result.then(() => {
      window.location.href = this.baseUrl;
    });
  }
}
