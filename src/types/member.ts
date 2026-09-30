export type MemberRole =
  | "Admin"
  | "Member"
  | "Guest";

export type MemberType =
  | "member"
  | "guest";

export interface Member {
  id: number;
  name: string;
  username: string;
  email: string;
  initials: string;
  boards: number[];
  role: MemberRole;
  lastActive: string;
  type: MemberType;
}

export interface JoinRequest {
  id: number;
  name: string;
  username: string;
  email: string;
}