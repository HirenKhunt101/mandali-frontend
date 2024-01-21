import { Component, ElementRef, ViewChild } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalContentComponent } from '../../modal-content/modal-content.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { UserData } from '../../UserData/userdata';
import { AdminModuleService } from '../admin-portal.service';
import { StockList } from '../../static-data/static'
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-holding',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './holding.component.html',
  styleUrl: './holding.component.css'
})
export class HoldingComponent {
  @ViewChild('SellHoldingModal', { static: true }) SellHoldingModal !: ElementRef;
  @ViewChild('ConfirmationModal', { static: true }) ConfirmationModal !: ElementRef;

  StockForm !: FormGroup;
  BuyChargesGroup !: FormGroup;
  SellChargesGroup !: FormGroup;
  UserData: any;
  Today !: string;
  StocksList : any;
  BuyingTotalAmount = 0;
  SellingTotalAmount = 0;
  PortFolio: any;
  ActiveTab = "stock_tab";
  SellHoldingForm !: FormGroup;
  UserType = 'member';

  constructor(
    private _ModalService: NgbModal,
    private _ADMS: AdminModuleService
  ) {}

  async ngOnInit () {

    let today = new Date();
    let dd = today.getDate().toString();
    let mm = today.getMonth() + 1 + '';
    let yyyy = today.getFullYear();
    if (mm.toString().length == 1) mm = '0' + mm;
    if (dd.toString().length == 1) dd = '0' + dd;
    this.Today = `${yyyy}-${mm}-${dd}`;
    // this.Today = `${yyyy}-${mm}-${dd}`;
    console.log(this.Today);
    
    this.UserData = new UserData().getData('userdata');
    this.UserType = this.UserData.user.UserType;

    this.BuyChargesGroup = new FormGroup({
      Brokerage: new FormControl(0, [Validators.required, Validators.min(0)]),
      GST: new FormControl(0, [Validators.required, Validators.min(0)]),
      TransactionCharge: new FormControl(0, [Validators.required, Validators.min(0)]),
      // TurnoverTax: new FormControl(0, [Validators.required, Validators.min(0)]),
      SEBICharges: new FormControl(0, [Validators.required, Validators.min(0)]),
      StampDuty: new FormControl(0, [Validators.required, Validators.min(0)]),
      STT: new FormControl(0, [Validators.required, Validators.min(0)]),
      OtherCharges: new FormControl(0, [Validators.required, Validators.min(0)]),
    });

    this.SellChargesGroup = new FormGroup({
      Brokerage: new FormControl(0, [Validators.required, Validators.min(0)]),
      GST: new FormControl(0, [Validators.required, Validators.min(0)]),
      TransactionCharge: new FormControl(0, [Validators.required, Validators.min(0)]),
      // TurnoverTax: new FormControl(0, [Validators.required, Validators.min(0)]),
      SEBICharges: new FormControl(0, [Validators.required, Validators.min(0)]),
      STT: new FormControl(0, [Validators.required, Validators.min(0)]),
      OtherCharges: new FormControl(0, [Validators.required, Validators.min(0)]),
    });

    this.StockForm = new FormGroup({
      Date: new FormControl(this.Today, Validators.required),
      StockIndex: new FormControl('', [Validators.required]),
      StockName: new FormControl(''),
      Symbol: new FormControl(''),
      Amount: new FormControl(0, [Validators.required, Validators.min(0)]),
      Quantity: new FormControl(1, [Validators.required, Validators.min(1)]),
      Exchange: new FormControl('NSE', [Validators.required]),
      MandaliId: new FormControl(this.UserData.user.MandaliId),
      Charges: this.BuyChargesGroup
    });

    this.SellHoldingForm = new FormGroup({
      StockName: new FormControl('', Validators.required),
      Symbol: new FormControl('', Validators.required),
      Exchange: new FormControl('', Validators.required),
      SellingPrice: new FormControl(0, Validators.required),
      ExistQuantity: new FormControl(0),
      SellingQuantity: new FormControl(1, Validators.required),
      MandaliId: new FormControl(this.UserData.user.MandaliId),
      SellingCharge: new FormControl(0, Validators.required),
      Charges: this.SellChargesGroup
    });

    this.updateTotal();
    
    const apiUrl = 'https://twelve-data1.p.rapidapi.com/stocks?exchange=BSE&format=json';

    try {
      // const response = await fetch(apiUrl, { 
      //   method: 'GET', 
      //   headers: {
      //     'X-RapidAPI-Key': 'f1ca2ea9f7msh0f49fd45992f09bp1a6fdfjsnacc37f183acd',
      //     'X-RapidAPI-Host': 'twelve-data1.p.rapidapi.com'
      //   } 
      // });
      // if (!response.ok) {
      //   this.openErrorMsg(`Error in read stock list`);
      // } else {
      //   const data = await response.json();
      //   this.StocksList = data.data; 
      //   console.log(this.StocksList);
      // }
      this.StocksList = new StockList().data;
    } catch (error) {
      console.error('Fetch error:', error);
    }

    this.fetchDate();

  }


  fetchDate() {
    this._ADMS.readStocks({
      MandaliId: this.UserData.user.MandaliId,
    }).subscribe(
      (data: any) => {
        console.log(data);    
        this.PortFolio = data.data.all_stock_detail;
      },
      (e) => {
        console.log(e);
      }
    );
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

  updateTotal() {
    const amount = this.StockForm.get('Amount')?.value;
    const quantity = this.StockForm.get('Quantity')?.value;
    this.BuyingTotalAmount =  amount * quantity;

    this.BuyChargesGroup.get('Brokerage')?.setValue(environment.BROKERAGE_CHARGE);
    this.BuyChargesGroup.get('STT')?.setValue(this.BuyingTotalAmount * environment.STT_CHARGE_PERCENTAGE);
    this.BuyChargesGroup.get('StampDuty')?.setValue(this.BuyingTotalAmount * environment.STAMP_DUTY_CHARGE_PERCENTAGE);
    this.BuyChargesGroup.get('SEBICharges')?.setValue(this.BuyingTotalAmount * environment.SEBI_CHARGES_PERCENTAGE);

    console.log(this.StockForm.value);
    
    if (this.StockForm.get('Exchange')?.value == 'NSE') {
      this.BuyChargesGroup.get('TransactionCharge')?.setValue(this.BuyingTotalAmount * environment.NSE_TRANSACTION_CHARGE_PERCENTAGE);
    } else {
      this.BuyChargesGroup.get('TransactionCharge')?.setValue(this.BuyingTotalAmount * environment.BSE_TRANSACTION_CHARGE_PERCENTAGE);
    }

    this.BuyChargesGroup.get('GST')?.setValue(this.calculate_GST_charge(this.BuyChargesGroup));
  }
  
  selling_update_charges() {
    const amount = this.SellHoldingForm.get('SellingPrice')?.value;
    const quantity = this.SellHoldingForm.get('SellingQuantity')?.value;
    this.SellingTotalAmount =  amount * quantity;

    this.SellChargesGroup.get('Brokerage')?.setValue(environment.BROKERAGE_CHARGE);
    this.SellChargesGroup.get('STT')?.setValue(this.SellingTotalAmount * environment.STT_CHARGE_PERCENTAGE);
    this.SellChargesGroup.get('SEBICharges')?.setValue(this.SellingTotalAmount * environment.SEBI_CHARGES_PERCENTAGE);

    // Uncomment if needed
    // this.SellChargesGroup.get('TurnoverTax')?.setValue(this.SellingTotalAmount * environment.TURNOVER_TAX_CHARGE_PERCENTAGE);

    if (this.SellHoldingForm.get('Exchange')?.value == 'NSE') {
      this.SellChargesGroup.get('TransactionCharge')?.setValue(this.SellingTotalAmount * environment.NSE_TRANSACTION_CHARGE_PERCENTAGE);
    } else {
      this.SellChargesGroup.get('TransactionCharge')?.setValue(this.SellingTotalAmount * environment.BSE_TRANSACTION_CHARGE_PERCENTAGE);
    }

    this.SellChargesGroup.get('GST')?.setValue(this.calculate_GST_charge(this.SellChargesGroup));
  }

  calculate_GST_charge(CurrentForm: FormGroup) {
    return ( CurrentForm.get('Brokerage')?.value + 
             CurrentForm.get('SEBICharges')?.value + 
             CurrentForm.get('TransactionCharge')?.value
           ) * environment.GST_RATE;
  }

  buy_stock() {   
    this._ADMS.buyStock({
      ...this.StockForm.value,
      UserId: this.UserData.user.UserId
    }
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
        // this.ngOnInit();  
      }
    );
  } 

  openConfirmationModal() {

    let index = this.StockForm.get('StockIndex')?.value;
    this.StockForm.get('StockName')?.setValue(this.StocksList[index].name);
    this.StockForm.get('Symbol')?.setValue(this.StocksList[index].symbol);

    if(this.UserType == 'admin') {
      this._ModalService.open(this.ConfirmationModal, {
        centered: true,
        backdrop: 'static',
        keyboard: false,
      });
    }
    else {
      this.openErrorMsg("You don't have access to buy stock");
    }
  }

  change_active_tab(CurrentTab: any) {
    this.ActiveTab = CurrentTab;
  }

  openSellPopup(item: any) {
    this.SellHoldingForm.get('StockName')?.setValue(item.StockName);
    this.SellHoldingForm.get('Symbol')?.setValue(item.Symbol);
    this.SellHoldingForm.get('ExistQuantity')?.setValue(item.Quantity);
    this.SellHoldingForm.get('Exchange')?.setValue(item.Exchange);
    
    if(this.UserType == 'admin') {
      this._ModalService.open(this.SellHoldingModal, {
        centered: true,
        backdrop: 'static',
        keyboard: false,
      });
    } else {
      this.openErrorMsg("You don't have access to sell stock");
    }
  }

  sell_stock() {
    if(this.SellHoldingForm.get('SellingQuantity')?.value <= this.SellHoldingForm.get('ExistQuantity')?.value) {
      this._ADMS.sellStock({
        ...this.SellHoldingForm.value,
        UserId: this.UserData.user.UserId
      }).subscribe(
        (data: any) => {
          console.log(data);  
          this._ModalService.dismissAll();
          this.openErrorMsg(data.statusMessage);
          this.ngOnInit();  
        },
        (err) => {
          console.log(err);
          this.openErrorMsg(err.statusMessage);
          // this.ngOnInit();  
        }
      );
    }
    else {
      this.openErrorMsg('Please enter valid selling quantity');
    }
    
  }
}



