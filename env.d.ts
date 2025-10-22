// not putting that into the /lib folder so that's not appearing within the client apps through vendoring
declare module 'react-native-config' {
    export interface GoaldnConfig {
        // Info.plist (iOS) / AndroidManifest variables
        APP_NAME: string;

        // goaldn variables
        /** the current environment */
        ENVIRONMENT: 'development' | 'staging' | 'production';
        /** what the devices we want to connect to start with */
        BLE_ID_PREFIX?: string;
        /** the service ID we want to connect to */
        BLE_SERVICE_UUID?: string;
        /** the ID of the characteristic we'll read from */
        BLE_READ_CHAR_UUID?: string;
        /** the ID of the characteristic we'll write to */
        BLE_WRITE_CHAR_UUID?: string;
        /** should be get the BLE responses through the notification mechanism? */
        BLE_USE_NOTIFY?: string;
        /** should we prepend something to the frames we'll send? */
        BLE_FRAME_PREFIX?: string;
        /** how much time to wait before we say a BLE com' is dead? In milliseconds */
        BLE_TIMEOUT_MS?: string;
        /** how much time, in ms, to wait before to frames?  */
        BLE_DELAY_MS?: string;
        /** the code to activate the BLE simulation mode */
        BLE_SIMULATION_CODE?: string;
        /**
         * A string containing the definitions for several devices we want to simulate.
         * Should be provided this way: deviceId1:deviceName1|deviceId2:deviceName2|deviceId3:deviceName3|etc
         */
        BLE_SIMULATION_DEVICES?: string;
    }
    const Config: GoaldnConfig;
    export default Config;
}
