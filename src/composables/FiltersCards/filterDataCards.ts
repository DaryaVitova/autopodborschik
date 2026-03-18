import {computed, type Ref} from "vue";
import type { Advertisement } from "@/composables/advertisements.ts"
import { type FilterPrice, type FilterMileage } from "@/composables/FiltersCards/filterCardsState.ts";

export function useFilterDataCards(
  data: Ref<Advertisement[]>,
  searchBrand: Ref<string>,
  searchModel: Ref<string>,
  searchCity: Ref<string>,
  dataFilterPrice: FilterPrice,
  dataFilterMileage: FilterMileage,
  startYear: Ref<number | null>,
  endYear: Ref<number | null>
) {
  const filteredData = computed((): Advertisement[] => {
    if (
      !searchBrand.value.trim()
      && !searchModel.value.trim()
      && !searchCity.value.trim()
      && dataFilterPrice.activeMinPrice === null
      && dataFilterPrice.activeMaxPrice === null
      && !startYear.value && !endYear.value
      && dataFilterMileage.activeMinMileage === null
      && dataFilterMileage.activeMaxMileage === null) {
      return data.value
    }

    const brandQuery = searchBrand.value.toLowerCase().trim()
    const modelQuery = searchModel.value.toLowerCase().trim()
    const cityQuery = searchCity.value.toLowerCase().trim()

    return data.value.filter(item => {
      const textConditions = []

      if (brandQuery) {
        textConditions.push(item.brand?.toLowerCase().includes(brandQuery))
      }
      if (modelQuery) {
        textConditions.push(item.model?.toLowerCase().includes(modelQuery))
      }
      if (cityQuery) {
        textConditions.push(item.city?.toLowerCase().includes(cityQuery))
      }

      let pricePasses = true
      const price = item.price || 0

      if (dataFilterPrice.activeMinPrice !== null) {
        pricePasses = pricePasses && (price >= dataFilterPrice.activeMinPrice)
      }

      if (dataFilterPrice.activeMaxPrice !== null) {
        pricePasses = pricePasses && (price <= dataFilterPrice.activeMaxPrice)
      }

      let yearPasses = true

      if (startYear.value !== null) {
        yearPasses = yearPasses && (item.year >= startYear.value)
      }

      if (endYear.value !== null) {
        yearPasses = yearPasses && (item.year <= endYear.value)
      }

      let mileagePasses = true
      const mileage = item.mileage || 0

      if (dataFilterMileage.activeMinMileage !== null) {
        mileagePasses = mileagePasses && (mileage >= dataFilterMileage.activeMinMileage)
      }

      if (dataFilterMileage.activeMaxMileage!== null) {
        mileagePasses = mileagePasses && (mileage <= dataFilterMileage.activeMaxMileage)
      }

      const textPassed = textConditions.length > 0
        ? textConditions.every(cond => cond)
        : true

      return textPassed && pricePasses && yearPasses && mileagePasses
    })
  })

  return filteredData
}
