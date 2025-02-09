import { Component, Input } from "@angular/core";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ConfigurationService } from "src/app/services/configuration.service";
import { DonationEventService } from "src/app/services/donationevent.service";
import { MemberService } from "src/app/services/member.service";
import { errorToast, successToast } from "src/app/services/toast.service";

@Component({
  selector: "app-delete-confirmation",
  standalone: true,
  imports: [],
  templateUrl: "./delete-confirmation.component.html",
  styleUrl: "./delete-confirmation.component.scss",
})
export class DeleteConfirmationComponent {
  @Input() memberIdToDelete: string = "";
  @Input() deleteType: string = "";


  constructor(
    private controlService: MemberService,
    private configurationService: ConfigurationService,
    private eventService: DonationEventService,
    private activeModal: NgbActiveModal
  ) {}

  confirmDelete() {
    if (this.deleteType == "memberType") {
      this.deleteMemberType();
    } else if (this.deleteType == "member") {
      this.delteMember();
    }
    else if (this.deleteType=="donationEvent"){
      this.deleteEvent();
    }
  }

  delteMember() {
    this.controlService.deleteMember(this.memberIdToDelete).subscribe({
      next: (res) => {
        if (res.success) {
          successToast(res.message);
          this.closeModal();
        } else {
          errorToast(res.message);
        }
      },
    });
  }
  deleteMemberType() {
    this.configurationService
      .deleteMembershipType(this.memberIdToDelete)
      .subscribe({
        next: (res) => {
          if (res.success) {
            successToast(res.message);
            this.closeModal();
          } else {
            errorToast(res.message);
          }
        },
      });
  }

  deleteEvent(){
  
    this.eventService.remove(this.memberIdToDelete).subscribe({
      next:((res)=>{
        if (res.success){
          successToast(res.message)
          this.closeModal()
        }
        else {
          errorToast(res.errorCode!||res.message,res.message)
        }
      })
    })
  }
  closeModal() {
    this.activeModal.close();
  }
}
