

export interface ISuperAdminService{
    createVendor:(key:string,mail:string) => Promise<string|null|void>;
    // getVendors:() => Promise<void>;
    // deleteVendor:() => Promise<void>;
}