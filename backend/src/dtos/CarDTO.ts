import type { NewCar } from "@/types/cars.type.js";

export default class CarDTO {
    car : NewCar;
    constructor(car : NewCar){
        this.car = car;
    }
    getCarCategory() : string {
        return this.car.category;
    }
    getCarPrice() {
        return this.car.price;
    }
    getCarMake() : string {
        return this.car.carMake;
    }
    getCarModel() : string {
        return this.car.carModel;
    }
    getCarYear() {
        return this.car.yearOfManufacturing;
    }
}