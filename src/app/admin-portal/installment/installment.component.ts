import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { UserData } from '../../UserData/userdata';
import { AdminModuleService } from '../admin-portal.service';
import { ModalContentComponent } from '../../modal-content/modal-content.component';

@Component({
  selector: 'app-installment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './installment.component.html',
  styleUrl: './installment.component.css'
})
export class InstallmentComponent {
  @ViewChild('ConfirmationModal', { static: true }) ConfirmationModal !: ElementRef;
  @ViewChild('ApprovalConfirmationModal', { static: true }) ApprovalConfirmationModal !: ElementRef;

  InstallmentForm !: FormGroup;
  PendingRequest !: any[];
  PendingInstallment !: any[];
  InstallmentDetails !: any[];
  UserType = 'admin';
  UserData: any;
  months = [
    { name: 'January', value: 0 },
    { name: 'February', value: 1 },
    { name: 'March', value: 2 },
    { name: 'April', value: 3 },
    { name: 'May', value: 4 },
    { name: 'June', value: 5 },
    { name: 'July', value: 6 },
    { name: 'August', value: 7 },
    { name: 'September', value: 8 },
    { name: 'October', value: 9 },
    { name: 'November', value: 10 },
    { name: 'December', value: 11 },
  ];
  currentYear = new Date().getFullYear();
  years = Array.from({ length: 21 }, (_, index) => (this.currentYear - 10) + index);
  CurrentRequest: any;

  constructor(
    private _ModalService: NgbModal,
    private _ADMS: AdminModuleService,
  ) {
  }

  ngOnInit() {  
    let now = new Date();
    this.UserData = new UserData().getData('userdata');
    this.UserType = this.UserData.user.UserType;
    this.InstallmentForm = new FormGroup({
      Month: new FormControl(now.getMonth(), [Validators.required]),
      Year: new FormControl(now.getFullYear(), [Validators.required]),
      Amount: new FormControl(0, [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]),
      MandaliId: new FormControl(this.UserData.user.MandaliId),
      UserId: new FormControl(this.UserData.user.UserId),
      UserType: new FormControl(this.UserType),
      Penalty: new FormControl(false),
      // Approved: new FormControl(false)
    });

    this._ADMS.readInstallment({
      MandaliId: this.UserData.user.MandaliId,
      UserId: this.UserData.user.UserId,
      UserType: this.UserType,
    }).subscribe(
      (data: any) => {
        this.InstallmentDetails = data.data.monthly_installment;
        console.log(this.InstallmentDetails);    
      },
      (e) => {
        console.log(e);
      }
    );

    this._ADMS.readRemainingInstallment({
      MandaliId: this.UserData.user.MandaliId,
    }).subscribe(
      (data: any) => {
        console.log(data);    
        this.PendingInstallment = data.data.pending_installment;
      },
      (e) => {
        console.log(e);
      }
    );

    // this.PendingRequest = [
    //   { "No": 1, "Member_Name": "John Doe1", "Amount": 50000, "Date": "Nov-2023", "_id": '1234' },
    //   { "No": 2, "Member_Name": "John Doe2", "Amount": 50000, "Date": "Nov-2023", "_id": '1234' },
    //   { "No": 3, "Member_Name": "John Doe3", "Amount": 50000, "Date": "Nov-2023", "_id": '1234' },
    //   { "No": 4, "Member_Name": "John Doe4", "Amount": 50000, "Date": "Nov-2023", "_id": '1234' },
    // ];

    // this.InstallmentDetails = [
    //   { "No": 1, "Member_Name": "John Doe1", "Amount": 50000, "Date": "Nov-2023", "Total": 9500015 },
    //   { "No": 2, "Member_Name": "John Doe2", "Amount": 50000, "Date": "Nov-2023", "Total": 9500015 },
    //   { "No": 3, "Member_Name": "John Doe3", "Amount": 50000, "Date": "Nov-2023", "Total": 9500015 },
    //   { "No": 4, "Member_Name": "John Doe4", "Amount": 50000, "Date": "Nov-2023", "Total": 9500015 },
    // ];
  }

  // handleDateChange() {
  //   const selectedMonth = (document.getElementById('Month') as HTMLSelectElement).value;
  //   const selectedYear = (document.getElementById('Year') as HTMLSelectElement).value;
  //   const selectedDate = `${selectedYear}-${selectedMonth}`;
  //   console.log('Selected Date:', selectedDate);

  //   // You can perform further actions with the selected date if needed
  // }

  create_installment() {
    console.log(this.InstallmentForm.value); 
    this._ADMS.createInstallment(
      this.InstallmentForm.value
    ).subscribe(
      (data: any) => {
        console.log(data);  
        this._ModalService.dismissAll();
        this.openErrorMsg(data.statusMessage);
        this.ngOnInit();  
      },
      (err) => {
        console.log(err);
        this.openErrorMsg(err.statusMessage);
        this.ngOnInit();  
      }
    );
  }

  approveDeleteRequest(approveData: any) {
    // this.InstallmentForm.get('Approved')?.setValue(Active);
    
    this._ADMS.approveDeletePendingRequest({
      data: approveData,
      MandaliId: this.UserData.user.MandaliId,
      UserId: this.UserData.user.UserId
    }).subscribe(
      (data: any) => {
        this._ModalService.dismissAll();
        this.openErrorMsg(data.statusMessage);
        this.ngOnInit();  
      },
      (e) => {
        console.log(e);
        this.ngOnInit();  
      }
    );
  }

  openConfirmationModal() {
    if(this.UserType != "admin") {
      this.openErrorMsg("You don't have access to create installment. Please contact admin.");
      return;
    } 
    this._ModalService.open(this.ConfirmationModal, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
    });
  }

  openApprovalConfirmationModal(approveData: any) {
    if(this.UserType != "admin") {
      this.openErrorMsg("You don't have access for approve request. Please contact admin.");
      return;
    } 
    this.CurrentRequest = approveData;
    this._ModalService.open(this.ApprovalConfirmationModal, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
    });
  }

  openErrorMsg(str: any) {
    let cfm = this._ModalService.open(ModalContentComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
    });
    cfm.componentInstance.name = str;

    cfm.result.then((res) => {
      if (res) {
      }
    });
  }

}
