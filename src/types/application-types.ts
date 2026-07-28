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
