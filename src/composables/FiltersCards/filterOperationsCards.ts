import type {ResetKey} from "@/composables/FiltersCards/filterCardsState.ts";
import { useRoute } from "vue-router";
import { type Ref } from "vue";
import { type FilterPrice, type FilterMileage } from "@/composables/FiltersCards/filterCardsState.ts";

export function useFilterOperationsCards(
  searchBrand: Ref<string>,
  searchModel: Ref<string>,
  searchCity: Ref<string>,
  dataFilterPrice: FilterPrice,
  dataFilterMileage: FilterMileage,
  savedPageBeforeFilterData: Ref<string | null | string[]>,
  isFiltering: Ref<boolean>,
  pushQuery: (query: Record<string, string | string[]>) => Promise<void>,
  hasOnlyPageAndCount: (query: Record<string, any>) => boolean
) {
  const route = useRoute()

  async function resetFilter(arg: ResetKey): Promise<void> {
    const query = { ...route.query } as Record<string, string | string[]>

    switch(arg) {
      case 'minPrice':
        dataFilterPrice.localMinPrice = null
        dataFilterPrice.activeMinPrice = null
        delete query.price_from
        break

      case 'maxPrice':
        dataFilterPrice.localMaxPrice = null
        dataFilterPrice.activeMaxPrice = null
        delete query.price_to
        break

      case 'minMileage':
        dataFilterMileage.localMinMileage = null
        dataFilterMileage.activeMinMileage = null
        delete query.mileage_from
        break

      case 'maxMileage':
        dataFilterMileage.localMaxMileage = null
        dataFilterMileage.activeMaxMileage = null
        delete query.mileage_to
        break

      case 'searchBrand':
        searchBrand.value = ''
        delete query.brand
        break

      case 'searchModel':
        searchModel.value = ''
        delete query.model
        break

      case 'searchCity':
        searchCity.value = ''
        delete query.city
        break
    }

    if (savedPageBeforeFilterData.value) {
      query.page = savedPageBeforeFilterData.value
    }

    await pushQuery(query)

    if (hasOnlyPageAndCount(query)) {
      savedPageBeforeFilterData.value = null
      sessionStorage.removeItem('savedPageBeforeFilter')
    }
  }

  function savePage (query: Record<string, string | string[]>) {
    console.log('pisda1')
    console.log(savedPageBeforeFilterData.value, 'savedPageBeforeFilterData.value pizda2')
    console.log(query.page, 'query.page pizda3')
    if (savedPageBeforeFilterData.value === null && query.page) {
      console.log('pisda4')
      savedPageBeforeFilterData.value = query.page
      console.log(savedPageBeforeFilterData.value, 'savedPageBeforeFilterData.value')
      sessionStorage.setItem('savedPageBeforeFilter', savedPageBeforeFilterData.value as string)
    }
  }

  async function applyMileageFilter(): Promise<void> {
    const query = { ...route.query } as Record<string, string | string[]>

    if (dataFilterMileage.localMinMileage) {
      dataFilterMileage.activeMinMileage = dataFilterMileage.localMinMileage
      query.mileage_from = (dataFilterMileage.activeMinMileage).toString()
    }
    if (dataFilterMileage.localMaxMileage) {
      dataFilterMileage.activeMaxMileage = dataFilterMileage.localMaxMileage
      query.mileage_to = (dataFilterMileage.activeMaxMileage).toString()
    }

    savePage(query)
    await pushQuery(query)
  }

  async function applyPriceFilter(): Promise<void> {
    const query = { ...route.query } as Record<string, string | string[]>

    if (dataFilterPrice.localMinPrice) {
      dataFilterPrice.activeMinPrice = dataFilterPrice.localMinPrice
      query.price_from = (dataFilterPrice.activeMinPrice).toString()
    }
    if (dataFilterPrice.localMaxPrice) {
      dataFilterPrice.activeMaxPrice = dataFilterPrice.localMaxPrice
      query.price_to = (dataFilterPrice.activeMaxPrice).toString()
    }

    savePage(query)

    await pushQuery(query)
  }

  const handleSearch = async () => {
    isFiltering.value = true

    const query = { ...route.query } as Record<string, string | string[]>

    searchBrand.value.trim() ? query.brand = searchBrand.value : delete query.brand
    searchModel.value.trim() ? query.model = searchModel.value : delete query.model
    searchCity.value.trim() ? query.city = searchCity.value : delete query.city

    savePage(query)

    query.page = '1'

    await pushQuery(query)

    setTimeout(() => {
      isFiltering.value = false
    }, 300)
  }

  return {
    resetFilter,
    applyMileageFilter,
    applyPriceFilter,
    handleSearch,
    savePage
  }
}
