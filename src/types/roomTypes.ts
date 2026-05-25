export type RoomStatus = 'open' | 'closed';

export type MemberRole = 'owner' | 'guest';

export type MemberStatus = 'active' | 'left' | 'removed';

export type Room = {
  id: string;
  code: string;
  name: string;
  owner_user_id: string;
  status: RoomStatus;
  created_at: string;
  closed_at: string | null;
  closed_by_user_id: string | null;
};

export type RoomMember = {
  id: string;
  room_id: string;
  user_id: string | null;
  name: string;
  role: MemberRole;
  status: MemberStatus;
  is_manual: boolean;
  created_at: string;
  left_at: string | null;
};

export type CurrentRoom = {
  roomId: string;
  roomCode: string;
  roomName: string;
  roomStatus: RoomStatus;
  memberId: string;
  memberName: string;
  memberRole: MemberRole;
};