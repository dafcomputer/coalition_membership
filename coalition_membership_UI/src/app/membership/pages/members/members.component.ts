import { Component, OnInit } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

import { CommonService } from "src/app/services/common.service";
import { ConfigurationService } from "src/app/services/configuration.service";
import { MemberService } from "src/app/services/member.service";

import { MemberDetailComponent } from "./member-detail/member-detail.component";
import { RegisterMembersAdminComponent } from "./register-members-admin/register-members-admin.component";
import { UserService } from "src/app/services/user.service";
import { IMembersGetDto } from "src/app/models/auth/membersDto";
import { UserView } from "src/app/models/auth/userDto";
import { DeleteConfirmationComponent } from "../delete-confirmation/delete-confirmation.component";

@Component({
  selector: "app-members",
  templateUrl: "./members.component.html",
  styleUrls: ["./members.component.scss"],
})
export class MembersComponent implements OnInit {
  first: number = 0;
  rows: number = 5;
  Members: IMembersGetDto[] = [];
  paginatedMembers: IMembersGetDto[] = [];
  searchTerm: string = "";
  selectedFile: File | null = null;
  user: UserView;

  currentPage: number = 1;
  totalPages: number;
  pagesArray: number[] = [];
  totalRecords: number;

  ngOnInit(): void {
    this.getMemberss();
    this.user = this.userService.getCurrentUser();
  }

  constructor(
    private modalService: NgbModal,
    private commonService: CommonService,

    private userService: UserService,
    private controlService: MemberService
  ) {}

  getMemberss() {
    this.controlService.getMembers().subscribe({
      next: (res) => {
        this.Members = res;
        this.totalRecords = this.Members.length;
        this.calculateTotalPages();
        this.updatePagesArray();
      },
    });
  }

  updatePagesArray(): void {
    const maxVisiblePages = 3; // Number of visible pages before the "..." 
    const pages: number[] = [];

    // Always show the first page
    pages.push(1);

    // Add dots before the current page if it's beyond the visible range
    if (this.currentPage > maxVisiblePages + 1) {
      pages.push(-1); // Use -1 as a placeholder for "..."
    }

    // Determine start and end of the visible range
    const start = Math.max(2, this.currentPage - 1);
    const end = Math.min(this.totalPages - 1, this.currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Add dots after the current page if there's more to show
    if (this.currentPage < this.totalPages - maxVisiblePages) {
      pages.push(-1); // Use -1 as a placeholder for "..."
    }

    // Always show the last page if it's not already included
    if (this.totalPages > 1) {
      pages.push(this.totalPages);
    }

    this.pagesArray = pages;
  }


  onPageChange() {
    const start = (this.currentPage - 1) * this.rows;
    const end = start + this.rows;
    this.paginatedMembers = this.Members.slice(start, end);
  }

  getImagePath(url: string) {
    return this.commonService.createImgPath(url);
  }



  applyFilter() {
    const searchTerm = this.searchTerm.toLowerCase();

    this.paginatedMembers = this.Members.filter((item) => {
      return (
        item.fullName.toLowerCase().includes(searchTerm) ||
        item.phoneNumber.toLowerCase().includes(searchTerm) ||
        (item.memberId &&
          item.memberId.toLocaleLowerCase().includes(searchTerm)) ||
        item.membershipType.toLowerCase().includes(searchTerm) ||
        (item.region && item.region.toLowerCase().includes(searchTerm)) ||
        (item.gender && item.gender.toLowerCase().includes(searchTerm)) ||
        item.paymentStatus.toLowerCase().includes(searchTerm) ||
        item.expiredDate.toString().includes(searchTerm)
      );
    });
  }

  goToDetail(member: IMembersGetDto) {
    let modalRef = this.modalService.open(MemberDetailComponent, {
      size: "xxl",
      backdrop: "static",
      windowClass: "custom-modal-width",
    });
    modalRef.componentInstance.member = member;
    modalRef.result.then(() => {
      this.getMemberss();
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] as File;
    if (!this.selectedFile) {
      return;
    }
    this.importFromExcel();
  }
  importFromExcel() {
    const formData = new FormData();
    formData.append("ExcelFile", this.selectedFile);
    this.controlService.importFromExcel(formData).subscribe({
      next: (res) => {
        if (res.success) {
          // this.messageService.add({ severity: 'success', summary: res.message, detail: res.data })
          this.getMemberss();
        } else {
          //this.messageService.add({ severity: 'error', summary: res.message, detail: res.data })
          this.getMemberss();
        }
      },
      error: (err) => {
        //this.messageService.add({ severity: 'error', summary: 'Something went wrong', detail: err })
      },
    });
  }

  DeleteMember(memberId: string) {
    let modalRef = this.modalService.open(DeleteConfirmationComponent, {
      backdrop: "static",
    });
    modalRef.componentInstance.memberIdToDelete = memberId;
    modalRef.componentInstance.deleteType = "member";

    modalRef.result.then(() => {
      this.getMemberss();
    });

    // this.confirmationService.confirm({
    //   message: 'Are You sure you want to delete this Member?',
    //   header: 'Delete Confirmation',
    //   icon: 'pi pi-info-circle',
    //   accept: () => {
    //     this.controlService.deleteMember(memberId).subscribe({
    //       next: (res) => {

    //         if (res.success) {
    //           this.messageService.add({ severity: 'success', summary: 'Confirmed', detail: res.message });
    //           this.getMemberss()
    //         }
    //         else {
    //           this.messageService.add({ severity: 'error', summary: 'Rejected', detail: res.message });
    //         }
    //       }, error: (err) => {

    //         this.messageService.add({ severity: 'error', summary: 'Rejected', detail: err });

    //       }
    //     })

    //   },
    //   reject: (type: ConfirmEventType) => {
    //     switch (type) {
    //       case ConfirmEventType.REJECT:
    //         this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected' });
    //         break;
    //       case ConfirmEventType.CANCEL:
    //         this.messageService.add({ severity: 'warn', summary: 'Cancelled', detail: 'You have cancelled' });
    //         break;
    //     }
    //   },
    //   key: 'positionDialog'
    // });
  }

  RegisterMember() {
    let modalRef = this.modalService.open(RegisterMembersAdminComponent, {
      size: "lg",
      backdrop: "static",
    });
    modalRef.result.then(() => {
      this.getMemberss();
    });
  }

  //pageination

  calculateTotalPages() {
    this.totalPages = Math.ceil(this.totalRecords / this.rows);
    this.pagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.goToPage(1);
  }

  goToPage(page: number) {
    if (page > 0 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagesArray();
      this.onPageChange();
    }
  }
}
