import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validator, Validators} from "@angular/forms";
import {FormServiceService} from "../../services/form-service.service";
import {Country} from "../../common/country";
import {State} from "../../common/state";
import {CustomValidators} from "../../validators/custom-validators";
import {CartService} from "../../services/cart.service";
import {CheckoutService} from "../../services/checkout.service";
import {Router} from "@angular/router";
import {Order} from "../../common/order";
import {OrderItem} from "../../common/order-item";
import {Purchase} from "../../common/purchase";

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  totalPrice: number = 0;
  totalQuantity: number = 0;
  checkoutFormGroup!: FormGroup;
  creditCardMonths: number [] = [];
  creditCardYears: number [] = [];
  constructor(private formBuilder: FormBuilder,
              private formService: FormServiceService,
              private cartService: CartService,
              private checkoutService: CheckoutService,
              private router: Router) { }
  countries: Country[] = [];
  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];

  ngOnInit(): void {
    this.reviewCartDetails();
    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('',
              [Validators.required,
                            Validators.minLength(2),
                            CustomValidators.notOnlyWhiteSpace]),
        lastName: new FormControl('',
              [Validators.required,
                            Validators.minLength(2),
                            CustomValidators.notOnlyWhiteSpace]),
        email: new FormControl('',
                  [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$')]),
      }),
      shippingAddress: this.formBuilder.group({
        country: new FormControl('', [Validators.required]),
        street: new FormControl('',
          [Validators.required,
                        Validators.minLength(2),
                        CustomValidators.notOnlyWhiteSpace]),
        city: new FormControl('',
          [Validators.required,
                        Validators.minLength(2),
                        CustomValidators.notOnlyWhiteSpace]),
        state: new FormControl('', [Validators.required]),
        zipCode: new FormControl('',
          [Validators.required,
                        Validators.minLength(2),
                        CustomValidators.notOnlyWhiteSpace])
      }),
      billingAddress: this.formBuilder.group({
        country: new FormControl('', [Validators.required]),
        street: new FormControl('',
          [Validators.required,
                        Validators.minLength(2),
                        CustomValidators.notOnlyWhiteSpace]),
        city: new FormControl('',
          [Validators.required,
                        Validators.minLength(2),
                        CustomValidators.notOnlyWhiteSpace]),
        state: new FormControl('', [Validators.required]),
        zipCode: new FormControl('',
          [Validators.required,
                        Validators.minLength(2),
                        CustomValidators.notOnlyWhiteSpace])
      }),
      creditCard: this.formBuilder.group({
        cardType : new FormControl('', [Validators.required]),
        nameOnCard: new FormControl('',
          [Validators.required,
                        Validators.minLength(2),
                        CustomValidators.notOnlyWhiteSpace]),
        cardNumber: new FormControl('',[Validators.required, Validators.pattern('[0-9]{16}')]),
        securityCode: new FormControl('',[Validators.required, Validators.pattern('[0-9]{3}')]),
        expirationMonth: [''],
        expirationYear: ['']
      })
    });

    const starMonth: number = new Date().getMonth() + 1;

    this.formService.getCreditCardMonths(starMonth).subscribe(data => this.creditCardMonths = data)

    this.formService.getCreditCardYears().subscribe(data => this.creditCardYears = data)

    this.formService.getCountries().subscribe(data => this.countries = data)
  }

  onSubmit(){
    console.log("Handling the submit button:");

    if (this.checkoutFormGroup.invalid){
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }
    let order = new Order();
    order.totalPrice = this.totalPrice;
    order.totalQuantity = this.totalQuantity;

    let purchase = new Purchase();
    purchase.customer = this.checkoutFormGroup.controls['customer'].value;
    const cartItems = this.cartService.cartItems;
    let orderItems: OrderItem[] = cartItems.map(tempCartItem => new OrderItem(tempCartItem));
    purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value;
    const shippingState : State = JSON.parse(JSON.stringify(purchase.shippingAddress.state));
    const shippingCountry: Country = JSON.parse(JSON.stringify(purchase.shippingAddress.country));
    purchase.shippingAddress.state = shippingState.name;
    purchase.shippingAddress.country = shippingCountry.name

    purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;
    const billingState : State = JSON.parse(JSON.stringify(purchase.billingAddress.state));
    const billingCountry: Country = JSON.parse(JSON.stringify(purchase.billingAddress.country));
    purchase.billingAddress.state = billingState.name;
    purchase.billingAddress.country = billingCountry.name

    purchase.order = order;
    purchase.orderItems = orderItems;

    this.checkoutService.placeOrder(purchase).subscribe(
      {
        next: response => {
          alert(`Your order has been received.\nOrder tracking number: ${response.orderTrackingNumber}`);
          this.resetCart();
        },
        error: err =>{
          alert(`There was an error: ${err.message}`);
        }
      }
    )
  }

  get firstName(){return this.checkoutFormGroup.get('customer.firstName')!;}
  get lastName(){return this.checkoutFormGroup.get('customer.lastName')!;}
  get email(){return this.checkoutFormGroup.get('customer.email')!;}

  get shippingAddressStreet(){return this.checkoutFormGroup.get('shippingAddress.street')!;}
  get shippingAddressCity(){return this.checkoutFormGroup.get('shippingAddress.city')!;}
  get shippingAddressState(){return this.checkoutFormGroup.get('shippingAddress.state')!;}
  get shippingAddressZipCode(){return this.checkoutFormGroup.get('shippingAddress.zipCode')!;}
  get shippingAddressCountry(){return this.checkoutFormGroup.get('shippingAddress.country')!;}

  get billingAddressStreet(){return this.checkoutFormGroup.get('billingAddress.street')!;}
  get billingAddressCity(){return this.checkoutFormGroup.get('billingAddress.city')!;}
  get billingAddressState(){return this.checkoutFormGroup.get('billingAddress.state')!;}
  get billingAddressZipCode(){return this.checkoutFormGroup.get('billingAddress.zipCode')!;}
  get billingAddressCountry(){return this.checkoutFormGroup.get('billingAddress.country')!;}

  get creditCardType(){return this.checkoutFormGroup.get('creditCard.cardType')!;}
  get creditCardNameOnCard(){return this.checkoutFormGroup.get('creditCard.nameOnCard')!;}
  get creditCardNumber(){return this.checkoutFormGroup.get('creditCard.cardNumber')!;}
  get creditCardSecurityCode(){return this.checkoutFormGroup.get('creditCard.securityCode')!;}




  copyShippingAddressToBillingAddress(event: any){
    if(event.target.checked){
      this.checkoutFormGroup.controls['billingAddress'].setValue(this.checkoutFormGroup.controls['shippingAddress'].value);
      this.billingAddressStates = this.shippingAddressStates;
    }else{
      this.checkoutFormGroup.controls['billingAddress'].reset();
      this.billingAddressStates = [];
    }
  }

  handleMonthsAndYears() {
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');
    const currentYear: number = new Date().getFullYear();
    const selectedYear: number = Number(creditCardFormGroup?.value.expirationYear);

    let startMonth: number;

    if (currentYear === selectedYear){
      startMonth = new Date().getMonth() + 1;
    } else {
      startMonth = 1;
    }
    this.formService.getCreditCardMonths(startMonth).subscribe(data => {
      this.creditCardMonths = data;
    })
  }

  getStates(formGroupName: string) {
    const formGroup = this.checkoutFormGroup.get(formGroupName)
    const countryCode = formGroup?.value.country.code;
    console.log(`{formGroupName} country code: ${countryCode}`)
    this.formService.getStates(countryCode).subscribe(
      data => {
        if (formGroupName === 'shippingAddress'){
          this.shippingAddressStates = data;
        } else {
          this.billingAddressStates = data;
        }
        formGroup?.get('state')?.setValue(data[0])
      }
    )
  }

  private reviewCartDetails() {
    this.cartService.totalQuantity.subscribe(data=>this.totalQuantity = data);
    this.cartService.totalPrice.subscribe(data=>this.totalPrice = data);
  }

  private resetCart() {
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);
    this.checkoutFormGroup.reset();
    this.router.navigateByUrl("/products");
  }
}
