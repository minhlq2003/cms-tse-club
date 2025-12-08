import { extend } from "lodash";
import { User } from "next-auth";
import { ChangeEvent } from "react";

// enums
export enum UserRole {
    ADMIN = "ADMIN",
    LEADER = "LEADER",
    MEMBER = "MEMBER",
    NONE = "NONE",
}

export enum FunctionStatus{
  PENDING = "PENDING",
  ARCHIVED = "ARCHIVED",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  DISABLED = "DISABLED",
}

export enum EventType{
  SEMINAR = "SEMINAR",
  CONTEST = "CONTEST",
  TRAINING_EVENT = "TRAINING_EVENT",
  SIMPLE = "SIMPLE",
  ALL = "ALL",
}

export enum AttendeeStatus{
  REGISTERED = "REGISTERED",
  CHECKED = "CHECKED",
  BANNED = "BANNED",
}

export enum OrganizerRole{
  MODIFY = "MODIFY",
  CHECK_IN = "CHECK_IN",
  REGISTER = "REGISTER",
  BAN = "BAN",
  REMOVE = "REMOVE",
  POST = "POST",
}

// interfaces

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

export interface AttendeeDto{
  id: string;
  fullName?: string;
  nickname?: string;
  email?: string;
  dateOfBirth?: string;
  status: AttendeeStatus;
  user?: UserShortInfoResponseDto;
}

export interface BaseEventCreateRequestDto{
  title: string;
  location: Location;
  multiple?: number;
  organizers?: Organizer[];
}

export interface Event {
  id?: string;
  title: string;
  location: Location;
  multiple?: number;
  status?: FunctionStatus;
  organizers?: Organizer[];
  trainingId?: string;
  category?: string;
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
  single?: boolean;
  deleted?: boolean;
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
  roles: OrganizerRole[];
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

export interface TrainingCreateRequestDto {
  title: string;
  trainingEvents: Event[];
  location: Location;
  status: FunctionStatus;
  mentorIds?: string[];
  limitRegister?: number;
  featuredImageUrl?: string;
  plans?: string;
  allowedType?: number;
  isPublic?: boolean;
}

export interface TrainingMentorsRequestDto{
  mentorIds: string[];
}

export interface TrainingEventListCreateRequestDto{
  events: BaseEventCreateRequestDto[];
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
  filters?: EventSearchRequestDto & {
    status?: FunctionStatus;
  };
}

// user props

export interface ExamResult {
  student?: UserShortInfoResponseDto;
  rank?: number;
  point?: number;
  userId?: string;
}

export interface UserShortInfoResponseDto{
    id: string;
    username: string;
    fullName?: string;
    studentId?: string;
    email: string;
    dateOfBirth?: string;
    nickname?: string;
    role: UserRole;
    userUrl: string;
    attendancePoint: number;
    contributionPoint: number;
    disabled: boolean;
    type: number;
}

export interface UserUpdateDto{
    email?: string;
    nickname?: string;
    dateOfBirth?: string;
    fullName?: string;
    studentId?: string;
    type?: number;
}

export interface PointHistoryResponseDto{
    id: string;
    point: number;
    pointType: "CONTRIBUTION" | "ATTENDANCE";
    resetTime: string;
}

export interface LoginResponseDto extends UserShortInfoResponseDto{
    accessToken: string;
}

// global

export interface GlobalConfigurationDto{
    configKey: string;
    configValue: string;
    description?: string;
}

export interface PageWrapperDto {
    _embedded: any;
    _links: {
        self: {
            href: string;
        };
        first?: {
            href: string;
        };
        last?: {
            href: string;
        };
        next?: {
            href: string;
        };
        prev?: {
            href: string;
        };
    };
    page: {
        size: number;
        totalElements: number;
        totalPages: number;
        number: number;
    };
}

// search options

export interface SearchDto{
  page?: number;
  size?: number;
  sort?: string;
  searchs?: string[];
  searchValues?: string[];
}

export interface EventSearchRequestDto extends SearchDto {
  isDone?: boolean;
  eventType?: EventType;
  keyword?: string;
  startTime?: string;
  endTime?: string;
  rangeTimeType?: "UPCOMING" | "ONGOING" | "PAST";
}

export interface UserSearchRequestDto extends SearchDto {
  keyword?: string;
  role?: UserRole;
}

