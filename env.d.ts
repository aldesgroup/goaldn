// not putting that into the /lib folder so that's not appearing within the client apps through vendoring
declare module 'react-native-config' {
    export interface GoaldnConfig {
        // goaldn variables
        /* the current environment */
        ENVIRONMENT: 'development' | 'staging' | 'production';
        /* what the devices we want to connect to start with */
        BLE_ID_PREFIX?: string;
        /* the service ID we want to connect to */
        BLE_SERVICE_UUID?: string;
        /* the ID of the characteristic we'll read from */
        BLE_READ_CHAR_UUID?: string;
        /* the ID of the characteristic we'll write to */
        BLE_WRITE_CHAR_UUID?: string;
        /* should be get the BLE responses through the notificartion mechanism? */
        BLE_USE_NOTIFY?: string;
        /* should we prepend something to the frames we'll send? */
        BLE_FRAME_PREFIX?: string;
        /* how much time to wait before we say a BLE com' is dead? In milliseconds */
        BLE_TIMEOUT_MS?: string;
        /* how much time, in ms, to wait before to frames?  */
        BLE_DELAY_MS?: string;
    }
    const Config: GoaldnConfig;
    export default Config;
}
