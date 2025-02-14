import { Component, OnInit } from '@angular/core';
import {ProductService} from "../../services/product.service";
import {Product} from "../../common/product";
import {ActivatedRoute} from "@angular/router";
import {CartItem} from "../../common/cart-item";
import {CartService} from "../../services/cart.service";

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list-grid.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {

  constructor(private productService: ProductService,
              private cartService: CartService,
              private route: ActivatedRoute) { }

  products: Product[] = [];
  previousCategoryId: number = 1;
  currentCategoryId: number = 1;
  currentCategoryName: string = "";
  searchMode: boolean = false;
  previousKeyword: string = "";
  thePageNumber: number = 1;
  thePageSize: number = 5;
  theTotalElements:number = 0;

  ngOnInit(): void {
    this.route.paramMap.subscribe(()=>{
      this.listProducts();
    })
  }

  listProducts() {
    this.searchMode = this.route.snapshot.paramMap.has('keyword');
    if (this.searchMode) {
      this.handleSearchProducts();
    } else {
      this.handleListProducts();
    }
  }

  handleListProducts(){
    // check if "id" parameter is available
    const hasCategoryId: boolean = this.route.snapshot.paramMap.has('id');

    if (hasCategoryId) {
      // get the categoryId and convert it to a number using "+" symbol
      this.currentCategoryId = +this.route.snapshot.paramMap.get('id')!;
      this.currentCategoryName = this.route.snapshot.paramMap.get('name')!;
    } else {
      // not category id available ... default to category id 1
      this.currentCategoryId = 1;
      this.currentCategoryName = 'Books';
    }
    if (this.previousCategoryId != this.currentCategoryId){
      this.thePageNumber = 1;
    }
    this.previousCategoryId = this.currentCategoryId;

    this.productService.getProductListPaginate(this.thePageNumber - 1, this.thePageSize, this.currentCategoryId).subscribe(this.processResult());
  }

  handleSearchProducts() {
    const theKeyword: string = this.route.snapshot.paramMap.get('keyword')!;

    if (this.previousKeyword != theKeyword){
      this.thePageNumber = 1;
    }
    this.previousKeyword = theKeyword;
    this.productService.searchProductsPaginate(this.thePageNumber - 1, this.thePageSize, theKeyword).subscribe(this.processResult());
  }

  updatePageSize(pageSize:string){
    this.thePageSize = +pageSize;
    this.thePageNumber = 1;
    this.listProducts();
  }

  private processResult(){
    return (data: any) => {
      this.products = data._embedded.products;
      this.thePageNumber = data.page.number + 1;
      this.thePageSize = data.page.size;
      this.theTotalElements = data.page.totalElements;
    }
  }

  addToCart(theProduct: Product){
    console.log(`Adding to cart: ${theProduct.name}, ${theProduct.unitPrice}`)

    const theCartItem = new CartItem(theProduct);
    this.cartService.addToCart(theCartItem);
  }
}
