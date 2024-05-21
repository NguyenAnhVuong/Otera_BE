export enum EEnvironment {
  DEVELOPMENT = 'DEVELOPMENT',
  STAGING = 'STAGING',
  PRODUCTION = 'PRODUCTION',
}

export enum ERole {
  SYSTEM = 'SYSTEM',
  FAMILY_ADMIN = 'FAMILY_ADMIN',
  FAMILY_MEMBER = 'FAMILY_MEMBER',
  TEMPLE_ADMIN = 'TEMPLE_ADMIN',
  TEMPLE_MEMBER = 'TEMPLE_MEMBER',
  PUBLIC_USER = 'PUBLIC_USER',
}

export enum EGender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export enum EAppLanguage {
  vi = 'vi',
  ja = 'ja',
  en = 'en',
}

export enum EStatus {
  REJECTED = 'REJECTED',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
}

export enum EPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum EPlan {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM',
}

export enum EBookingStatus {
  BOOKING = 'BOOKING',
  REJECTED = 'REJECTED',
  APPROVED = 'APPROVED',
  CANCEL = 'CANCEL',
}

export enum ESortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum ENotificationType {
  INVITE_FAMILY = 'INVITE_FAMILY',
}
