export interface Address {
  id: number;
  date: String;
  longitude: String;
  latitude: String;
  title: String;
  path: String;
  postalCode: String;
  cityId: number;
  provinceId: number;
  isMain: Boolean;
}

export interface Province {
  id: number
  name: string
}

export interface City {
  id: number
  name: string
}

export interface ProvinceWithCities {
  id: number
  name: string
  cities: City[]
}