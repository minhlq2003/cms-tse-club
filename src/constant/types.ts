import { ChangeEvent } from "react";

export interface Book {
  import_price: string;
  book_images: {
    id: number;
    url: string;
  }[];
  images?: string[];
  id: number;
  title: string;
  subTitle?: string;
  price: number;
  author: string;
  rating?: number;
  imageUrl: string;
  discount?: number;
  genre?: string;
  publisher?: Publisher;
  publishedDate?: string;
  weight?: number;
  size?: string;
  pages?: number;
  description?: string;
  sold?: number;
  storage?: number;
  categories?: Category;
  category?: string;
  quantity?: number;
  stock?: number;
  publish_year: number;
  is_featured: boolean;
  meta_title?: string;
  meta_desc?: string;
  keywords?: string;
}

export type ApiBook = {
  id: number;
  title: string;
  description?: string;
  price: number;
  author: string;
  rating?: number;
  book_images?: { url: string }[];
  import_price?: number;
  is_featured: boolean;
  stock?: number;
};

export interface PathItem {
  [k: string]: {
    PATH: string;
    LABEL: string;
    BREADCRUMB: Array<string>;
  };
}

export interface BookImage {
  id: string;
  url: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Publisher {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookResponse {
  code: number;
  message?: string;
  data: Book;
}

export interface BookListResponse {
  code: number;
  message?: string;
  data: Book[];
  page: number;
  total: number;
  totalPages: number;
}

export interface PublisherListResponse {
  code: number;
  message?: string;
  data: Publisher[];
  page: number;
  total: number;
  totalPages: number;
}

export interface DiscountListResponse {
  code: number;
  message?: string;
  data: Discount[];
  page: number;
  total: number;
  totalPages: number;
}

export interface Discount {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  code: string;
  percent: number;
  startDate: string;
  endDate: string;
}

export interface BooksResponse {
  code: number;
  message: string;
  data: Book[];
}

export interface Category {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  slug: string;
  description?: string;
}

export interface CategoriesResponse {
  code: number;
  message: string;
  data: Category[];
}

export interface CategoryResponse {
  code: number;
  message: string;
  data: Category;
}

export interface Discount {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  code: string;
  percent: number;
  startDate: string;
  endDate: string;
}

export interface DiscountResponse {
  code: number;
  message: string;
  data: Discount[];
}

export type OrderDetailRequest = {
  bookId: string;
  quantity: number;
  price: number;
};

export type OrderDetail = {
  bookTitle: string;
  slug: string;
  bookImages: { id: string; url: string }[];
  quantity: number;
  price: number;
};

export enum PaymentMethod {
  COD = "COD",
  VN_PAY = "VN_PAY",
}

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  SHIPPING = "SHIPPING",
  COMPLETED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export type Order = {
  id: string;
  receiverName: string;
  receiverPhone: string;
  address: string;
  payment_method: PaymentMethod;
  status: OrderStatus;
  total: number;
  user_id?: string;
  order_details: OrderDetail[];
  created_at: string;
  updated_at: string;
};

export type OrderResponse = {
  code: number;
  pagination?: Pagination;
  data: Order;
};

export type ListOrdersResponse = {
  code: number;
  message?: string;
  data: Order[];
  page: number;
  total: number;
  totalPages: number;
};

export interface ListOrderFromUserResponse {
  success: boolean;
  data: OrderFromUserResponse[];
}

export interface OrderFromUserResponse {
  id: number;
  user_id: number;
  total: string;
  address: string;
  status: string;
  payment_method: string;
  created_at: string;
  updated_at: string;
  order_items: [
    {
      id: number;
      order_id: number;
      book_id: number;
      quantity: number;
      price: string;
      created_at: string;
      book_title: string;
      book_image: string;
      book_price: string;
    }
  ];
}

export interface OrderStatusUpdateResponse {
  success: boolean;
  data: {
    orderId: number;
    status: string;
    message: string;
  };
}

export interface Address {
  id: number;
  user_id: number;
  address: string;
  receiver_name: string;
  receiver_phone: string;
}

export interface AddressResponse {
  code: number;
  data?: { address: Address | Address[] } | Address | Address[];
  newAddress?: Address;
  message?: string;
}

export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  avatar: string;
  status?: number;
  role?: string;
  addresses: Address[];
}

export interface UserResponse {
  token: string;
  user: User;
  code: number;
  message?: string;
  data: User;
}

export interface MediaData {
  name: string;
  url: string;
  attachment: MediaData;
  fileName: string | undefined;
  file_name: string;
  id: number;
  userId: number;
  alternativeText: string;
  caption: string;
  width: number;
  height: number;
  hash: string;
  ext: string;
  mime: string;
  size: number;
  previewUrl: string;
  provider: string;
  provider_metadata: string;
  createdAt: string;
  created_at: string;
  updatedAt: string;
}

export interface FileUpdate {
  fileInfo?: {
    name: string;
    alternativeText: string;
    caption: string;
    width?: number;
    height?: number;
  };
  file?: File;
}

export interface FormValuesMedia {
  pagination: Pagination;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  dataItem: MediaData[];
  loading: boolean;
  error: string | null;
}

export interface Pagination {
  page?: number;
  pageSize: number | undefined;
  current: number | undefined;
  total: number | undefined;
}

export interface InputSearchProps {
  handleSearchChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export interface MediaResponse {
  data: MediaData[];
  pagination: Pagination;
}

export interface ChangePasswordResponse {
  code: number;
  message?: string;
  data: User;
}

export interface CartResponse {
  id: number;
  user_id: number;
  book_id: number;
  quantity: number;
  created_at: string;
  updated_at: string;
  book: {
    title: string;
    price: string;
    image: string;
  };
}

export interface AddToCartResponse {
  success: boolean;
  data: CartResponse;
}

export interface CartListResponse {
  success: boolean;
  data: CartResponse[];
}

export interface GetAddressResponse {
  success: boolean;
  data: {
    address: Address[];
  };
}

export interface AddNewAddressResponse {
  success: boolean;
  data: {
    newAddress: Address;
  };
}

export interface CheckoutResponse {
  success: boolean;
  data: {
    orderId: number;
    address: string;
    payment_method: string;
    total: number;
    message: string;
  };
}

export interface PostListResponse {
  code: number;
  message?: string;
  data: Post[];
  page: number;
  total: number;
  totalPages: number;
}

export interface PostResponse {
  code: number;
  message?: string;
  data: Post;
  id?: string;
  status: number;
}

export interface Post {
  id?: string;
  title?: string;
  slug?: string;
  content?: string;
  category?: string;
  postTime?: string;
  lastModifiedTime?: string;
  status?: string;
  image?: string;
  excerpt?: string;
  writer?: Member;
  featureImageUrl?: string;
  eventId?: string;
  event?: Event;
  deleted?: boolean;
  author?: Member;
}

export interface CategoryOption {
  id: string;
  label: string | undefined;
  value: string;
  disabled: boolean;
}

export interface ModalCheckoutSuccessProps {
  date: string;
  numberOfItem: number;
  address: string;
  name: string;
  total: number;
}

export interface Event {
  id?: string;
  title: string;
  location: Location;
  multiple?: number;
  status?: string;
  organizers?: Organizer[];
  trainingId?: string;
  category?: string;
  description?: string;
  host?: Member;
  limitRegister?: number;
  plans?: string;
  isPublic?: boolean;
  allowedType?: number;
  allowedArray?: number[];
  currentRegistered?: number;
  createdAt?: string;
  lastModifiedTime?: string;
  done?: boolean;
}
export interface Location {
  destination: string;
  startTime: string;
  endTime: string;
}

export interface Organizer {
  organizerId: string;
  roleContent: string;
  username?: string;
  email?: string;
  roles: string[];
  fullName?: string;
}

export interface Training {
  title: string;
  trainingEvents: Event[];
  location: Location;
  status: string;
  description?: string;
  creator?: Member;
  mentor?: Member[];
  mentorIds?: string[];
  limitRegister?: number;
  featuredImageUrl?: string;
  plans?: string;
  allowedType?: number;
  allowedArray?: number[];
  isPublic?: boolean;
}

export interface Member {
  id: string;
  username: string;
  email: string;
  fullName: string;
  nickname?: string | null;
  userUrl?: string;
}

export interface BlockTemplate {
  id: string; // uuid
  title: string;
  type: "basic" | "custom";
  block: string;
  createdAt?: string;
  lastModifiedTime?: string;
  author?: Member;
}

export interface EventTemplate {
  title: string;
  id?: string;
  blockTemplateIds: string[];
  author?: Member;
  createdAt?: string;
  blocks?: BlockTemplate[];
}

export interface FieldTemplate {
  id: string;
  label?: string;
  placeholder?: string;
  type:
    | "Text"
    | "Number"
    | "TextArea"
    | "Date"
    | "DateTime"
    | "RangeDate"
    | "RangeDateTime"
    | "Table";
  columns?: ColumnTemplate[]; // nếu là Table
}

export interface ColumnTemplate {
  id: string;
  name: string; // tên cột
  dataIndex?: string; // key dữ liệu
  type: "Text" | "Number" | "Date" | "DateTime" | "RangeDate" | "RangeDateTime";
}

export type FieldType =
  | "Text"
  | "Number"
  | "TextArea"
  | "Date"
  | "DateTime"
  | "RangeDate"
  | "RangeDateTime"
  | "Table";

export interface ListEventProps {
  filters?: {
    searchs?: string;
    searchValues?: string;
    eventType?: string;
    startTime?: string;
    endTime?: string;
    isDone?: boolean;
    status?: string;
    keyword?: string;
    sort?: string;
  };
}

export interface ExamResult {
  student?: Member;
  rank?: number;
  point?: number;
  userId?: string;
}
