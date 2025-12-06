import { UserRole } from "@/lib/enums/enums";

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

