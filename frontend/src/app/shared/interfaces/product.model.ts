export interface ProductModel {
  _id: string;
  image: string;
  title: string;
  description: string;
  price: string;
  category: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}
