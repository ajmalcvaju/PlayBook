import { Schema } from "mongoose";

interface Member {
  userId: string; 
  isAdmin: boolean;
}
export interface Team {
    teamName: string;
    maxMembers: number;
    privacy: 'public' | 'private';
    secretCode:string
    members: Member[];
  }
  