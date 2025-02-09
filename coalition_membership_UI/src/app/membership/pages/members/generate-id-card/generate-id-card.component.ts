import { Component, Input, OnInit } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { CommonService } from "src/app/services/common.service";
import * as html2pdf from "html2pdf.js";

import { HttpClient } from "@angular/common/http";

import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { IMembersGetDto } from "src/app/models/auth/membersDto";

@Component({
  selector: "app-generate-id-card",
  templateUrl: "./generate-id-card.component.html",
  styleUrls: ["./generate-id-card.component.scss"],
})
export class GenerateIdCardComponent implements OnInit {
  @Input() member: IMembersGetDto;
  imagePath: string = "'../../../../../assets/logo-transparent.png'";
  isMobile: boolean;
  expiryDate!: Date;
  constructor(
    private commonService: CommonService,
    private http: HttpClient,
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit(): void {
    this.getImage2();
    this.breakpointObserver
      .observe([Breakpoints.Handset, Breakpoints.Small, Breakpoints.XSmall])
      .subscribe((result) => {
        this.isMobile = result.matches;
      });

      if (this.member) {
        const createdDate = new Date(this.member.lastPaid!);
        createdDate.setFullYear(createdDate.getFullYear() + 1); // Add one year
        this.expiryDate = createdDate;
      }
  }

  getImage(url: string) {
    return this.commonService.createImgPath(url);
  }
  async getImage2() {
    if (
      this.member &&
      this.member.imagePath != "" &&
      this.member.imagePath != null
    ) {
      const imageBlob = await this.http
        .get(this.getImage(this.member.imagePath!), { responseType: "blob" })
        .toPromise();

      const imageUrl = URL.createObjectURL(imageBlob);

      this.imagePath = imageUrl;
    }
  }
  async generatePdf() {
    if (this.isMobile) {
      this.isMobile = false;
    }
  
    const frontSide = document.getElementById("front-side");
    const backSide = document.getElementById("back-side");
  
    if (frontSide && backSide) {
      const membername = `${this.member.fullName} Id Card.pdf`;
  
      // Get all images in the card element
      const frontImages = frontSide.getElementsByTagName("img");
      const backImages = backSide.getElementsByTagName("img");
  
      let loadedImages = 0;
      const totalImages = frontImages.length + backImages.length;
  
      const checkImagesLoaded = () => {
        if (++loadedImages === totalImages) {
          this.createPdf(frontSide, backSide, membername);
        }
      };
  
      // Add load event listeners to each image
      Array.from(frontImages).forEach((img: HTMLImageElement) => {
        img.onload = checkImagesLoaded;
        if (img.complete) {
          checkImagesLoaded(); // If image is already loaded, count it immediately
        }
      });
  
      Array.from(backImages).forEach((img: HTMLImageElement) => {
        img.onload = checkImagesLoaded;
        if (img.complete) {
          checkImagesLoaded(); // If image is already loaded, count it immediately
        }
      });
  
      if (totalImages === 0) {
        this.createPdf(frontSide, backSide, membername);
      }
    } else {
      console.error("Card elements not found.");
    }
  }
  
  createPdf(frontSide: HTMLElement, backSide: HTMLElement, membername: string) {
    // Prepare content by combining front and back with a forced page break
    const combinedElement = document.createElement('div');
    combinedElement.appendChild(frontSide.cloneNode(true)); 
    // Clone to avoid display issues
    combinedElement.appendChild(backSide.cloneNode(true));
  
    html2pdf()
      .from(combinedElement)
      .set({
        margin: 10,
        dpi: 300,
        filename: membername,
        html2canvas: {
          scale: 4,
          useCORS: true,
        },
        pagebreak: { mode: 'always' }, // Force a page break between front and back
        orientation: 'landscape', // Landscape could be changed if you prefer
      })
      .save()
      .then(() => {
        this.breakpointObserver
          .observe([
            Breakpoints.Handset,
            Breakpoints.Small,
            Breakpoints.XSmall,
          ])
          .subscribe((result) => {
            this.isMobile = result.matches;
            if (this.isMobile) {
              frontSide.style.display = 'none';
            }
          });
      })
      .catch((error) => {
        console.error("Error generating PDF:", error);
      });
  }
  
  
  
}
