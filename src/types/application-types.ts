/** Shared domain types used across pages, API clients, fixtures, and tests. */

export interface User {
  name: string;
  email: string;
  password: string;
  title?: 'Mr' | 'Mrs';
  birthDate?: { day: string; month: string; year: string };
  firstName?: string;
  lastName?: string;
  company?: string;
  address1?: string;
  address2?: string;
  country?: string;
  state?: string;
  city?: string;
  zipcode?: string;
  mobileNumber?: string;
}

export interface Product {
  id: number;
  name: string;
  price: string;
  brand: string;
  category: {
    usertype: { usertype: string };
    category: string;
  };
}

export interface ProductsApiResponse {
  responseCode: number;
  products: Product[];
}

export interface ApiResponseEnvelope<T> {
  status: number;
  ok: boolean;
  body: T;
}

export interface CreateAccountResponse {
  responseCode: number;
  message: string;
}

export interface VerifyLoginResponse {
  responseCode: number;
  message: string;
}

export interface CartItem {
  productName: string;
  price: string;
  quantity: number;
  total: string;
}

/** Shape of test-data/users.json — static, reviewable boundary/invalid-input fixtures. */
export interface StaticUsersData {
  description: string;
  boundaryUsers: Array<{ case: string; name: string; email: string; password: string }>;
  invalidUsers: Array<{ case: string; email: string; password: string }>;
}

/** Shape of test-data/products.json. */
export interface StaticProductsData {
  description: string;
  knownSearchTerms: string[];
  invalidSearchTerms: string[];
  expectedCategories: Array<{ usertype: string; category: string }>;
}

/** Shape of test-data/cart.json. */
export interface StaticCartData {
  description: string;
  validQuantities: number[];
  boundaryQuantities: Array<{ case: string; value: number }>;
  invalidQuantities: Array<{ case: string; value: number | string }>;
}

export interface StaticTestData {
  users: StaticUsersData;
  products: StaticProductsData;
  cart: StaticCartData;
}
