const reservations = new Map<string, number>();

export function getReserved(carId: string) {
    return reservations.get(carId) ?? 0;
}

export function reserve(carId: string) {
    reservations.set(carId, getReserved(carId) + 1);
}

export function release(carId: string) {
    const count = getReserved(carId);

    if (count <= 1) {
        reservations.delete(carId);
    } else {
        reservations.set(carId, count - 1);
    }
}