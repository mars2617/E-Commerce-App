import {Injectable} from '@angular/core';
import {CartItem} from "../common/cart-item";
import {BehaviorSubject, Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class CartService {

  cartItems: CartItem [] = [];
  totalPrice: Subject<number> = new BehaviorSubject<number>(0);
  totalQuantity: Subject<number> = new BehaviorSubject<number>(0);

  constructor() {
  }

  addToCart(theCartItem: CartItem) {
    let alreadyExisting: boolean = false;
    let existingCartItem: CartItem | undefined;

    if (this.cartItems.length > 0) {
      existingCartItem = this.cartItems.find(tempCartItem => tempCartItem.id === theCartItem.id )
      alreadyExisting = (existingCartItem != undefined);
    }

    if (alreadyExisting) {
      existingCartItem!.quantity++;
    } else {
      this.cartItems.push(theCartItem);
    }
    this.computeCartTotals();
  }

  computeCartTotals() {

    let totalPriceValue: number = 0;
    let totalQuantityValue: number = 0;

    for (let currentCartItem of this.cartItems){
      totalPriceValue += currentCartItem.quantity * currentCartItem.unitPrice!;
      totalQuantityValue += currentCartItem.quantity;
    }

    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue);

    this.logCartData(totalPriceValue, totalQuantityValue);

  }

  logCartData(totalPriceValue: number,  totalQuantityValue: number){
    console.log('Contents of the cart');
    for(let tempCartItem of this.cartItems){
      const subTotalPrice = tempCartItem.quantity * tempCartItem.unitPrice!;
      console.log(`name: ${tempCartItem.name}, quantity= ${tempCartItem.quantity}, unitPrice= ${tempCartItem.unitPrice}, subTotalPrice=${subTotalPrice}`)
    }
    console.log(`totalPrice: ${totalPriceValue.toFixed(2)}, totalQuantity: ${totalQuantityValue}`);
    console.log('-------');
  }

  decrementQuantity(cartItem: CartItem){
    cartItem.quantity--;

    if(cartItem.quantity === 0){
      this.remove(cartItem);
    } else {
      this.computeCartTotals();
    }
  }

  remove(cartItem: CartItem){
    const index = this.cartItems.findIndex(tempCartItem => tempCartItem.id === cartItem.id);

    if (index > -1){
      this.cartItems.splice(index, 1);
      this.computeCartTotals();
    }
  }
}
