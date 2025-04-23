// not putting that into the /lib folder so that's not appearing within the client apps through vendoring
declare module 'react-native-config' {
    export interface GoaldnConfig {
        ENVIRONMENT: 'development' | 'staging' | 'production';
        BLE_PREFIX?: string;
    }
    const Config: GoaldnConfig;
    export default Config;
}
