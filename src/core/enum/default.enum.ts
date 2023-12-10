export enum EEnvironment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
}

export enum ERole {
  SYSTEM = 'SYSTEM',
  FAMILY_ADMIN = 'FAMILY_ADMIN',
  FAMILY_MEMBER = 'FAMILY_MEMBER',
  TEMPLE_ADMIN = 'TEMPLE_ADMIN',
  PUBLIC_USER = 'PUBLIC_USER',
}

export enum EGender {
  MALE = 0,
  FEMALE = 1,
  OTHER = 2,
}

export enum EAppLanguage {
  VI = 'vi',
  JA = 'ja',
  EN = 'en',
}

export enum EStatus {
  INACTIVE = 0,
  ACTIVE = 1,
}

export enum EPriority {
  LOW = 0,
  MEDIUM = 1,
  HIGH = 2,
}

export enum EPlan {
  FREE = 0,
  PREMIUM = 1,
}

export enum EBookingStatus {
  BOOKING = 'BOOKING',
  APPROVED = 'APPROVED',
  CANCEL = 'CANCEL',
}
