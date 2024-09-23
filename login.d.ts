export declare async function main(): Promise<void>;
export declare async function asyncLogin(): Promise<boolean>;
export declare async function adToken(): Promise<{
    ad: string;
    token: string;
    device_id: string;
}>;
export declare function logout(): void;