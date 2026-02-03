import { computed, type Ref, type ComputedRef } from "vue";
import type {Advertisement, UseAdvertisementsReturn} from "@/composables/useAdvertisements.ts";
import type { SoldAutoStore } from "@/stores/soldAutoStore.ts";

export function useAdvertisementFilter(
  advertisements: UseAdvertisementsReturn,
  soldAuto: SoldAutoStore,
  toggleSoldAuto: Ref<boolean>
): { data: ComputedRef<Advertisement[]> } {

  const filteredData = computed((): Advertisement[] => {
    if (!toggleSoldAuto.value) {
      if (soldAuto.getSoldCars.length > 0) {
        const idFromSold = soldAuto.getSoldCars.map(item => item.id)
        return advertisements.data.value.filter(item => !idFromSold.includes(item.id))
      }
      return advertisements.data.value
    } else {
      return soldAuto.getSoldCars
    }
  })
  return { data: filteredData }
}


