export type { ChatDataAdapter, ConversationState } from './adapter/types';
export { provideChatAdapter, useChatAdapter, ChatAdapterKey } from './adapter/useChatAdapter';

// Re-export all types consumers need to implement the adapter
export type {
  Message,
  Contact,
  FilterKeys,
  ChatFilter,
  ExtendedMessage,
  MessageType,
  Request,
  AccessRequest,
  RequestProvider,
  ServiceRequest,
  status,
  CallMember,
  Profile,
  UserRoleKey,
  RoleDetail,
  Referral,
  FamilyMember,
  RelationTypes,
  Service,
  Provider,
  Fellowship,
  InsitutionType,
  Clinic,
  Invoice,
} from './types';
