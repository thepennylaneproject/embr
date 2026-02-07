declare enum NotificationPreference {
    ALL = "all",
    MENTIONS = "mentions",
    NONE = "none"
}
export declare class UpdateUserSettingsDto {
    isCreator?: boolean;
    isPrivate?: boolean;
    allowTips?: boolean;
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    notificationPreference?: NotificationPreference;
}
export {};
