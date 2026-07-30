const maintenanceRecords = new Map<string, number>();

const MAINTENANCE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

export function freezeCar(carId: string) {
    maintenanceRecords.set(carId, Date.now());
}

export function isCarFrozen(carId: string): boolean {
    const timestamp = maintenanceRecords.get(carId);
    if (!timestamp) {
        return false;
    }
    
    if (Date.now() - timestamp < MAINTENANCE_TIMEOUT_MS) {
        return true;
    }
    
    // Cleanup if expired
    maintenanceRecords.delete(carId);
    return false;
}
