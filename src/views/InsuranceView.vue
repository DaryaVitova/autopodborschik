<template>
  <div class="insurance">
    <div class="steps">
      <div
        v-for="(step, index) in stepTitles"
        :key="step"
        class="steps__item"
        :class="{ 'steps__item--completed': currentStep > index + 1 }"
      >
        <div
          class="steps__item-circle"
          :class="{
            'steps__item-circle--active': currentStep === index + 1 && index + 1 !== stepTitles.length,
            'steps__item-circle--completed': currentStep > index + 1 || (currentStep === index + 1 && index + 1 === stepTitles.length)
          }"
        >
          {{ index + 1 }}
        </div>
        <span class="steps__item-text">{{ step }}</span>
      </div>
    </div>

    <div class="insurance__content">
      <div class="insurance__content-buttons">
        <button
          v-if="currentStep > 1"
          type="button"
          class="insurance__content-back-btn"
          @click="goToPrevStep"
        >
          Назад
        </button>
        <button
          v-if="isShowNextStepBtn()"
          type="button"
          class="insurance__content-next-btn"
          @click="goToNextStep"
        >
          Далее
        </button>
      </div>
      <keep-alive>
        <component
          :is="currentComponent"
          :category="carCategory"
          :engine-power="carEnginePower"
          :mode="driversMode"
          :drivers="driversList"
          @make-model-value="(value: string) => makeModelValue = value"
          @car-data-valid="(value: boolean) => carDataValid = value"
          @car-data-update="handleCarDataUpdate"
          @drivers-valid="(value: boolean) => driversValid = value"
          @drivers-update="handleDriversUpdate"
        />
      </keep-alive>
    </div>
  </div>
</template>

<script setup lang='ts'>
import MakeModelStep from "@/components/Insurance/MakeModelStep.vue"
import CarDataStep from "@/components/Insurance/CarDataStep.vue"
import DriversStep from "@/components/Insurance/DriversStep.vue"
import CalculationStep from "@/components/Insurance/CalculationStep.vue"
import { ref, computed } from "vue"
import type { CarCategory, DriversMode, InsuranceDriver } from "@/composables/insuranceCalculation.ts"

const makeModelValue = ref<string>('')
const carDataValid = ref<boolean>(false)
const driversValid = ref<boolean>(false)

const carEnginePower = ref<number | null>(null)
const carCategory = ref<CarCategory | ''>('')
const driversMode = ref<DriversMode>('list')
const driversList = ref<InsuranceDriver[]>([])

const currentStep = ref(1)

const steps = [
  { title: 'Марка / модель ТС', component: MakeModelStep, needConfirm: true },
  { title: 'Данные ТС', component: CarDataStep, needConfirm: true },
  { title: 'Водители', component: DriversStep, needConfirm: true },
  { title: 'Расчет', component: CalculationStep, needConfirm: false }
]

const currentComponent = computed(() => {
  return steps[currentStep.value - 1]?.component
})

const stepTitles = ['Марка / модель ТС', 'Данные ТС', 'Водители', 'Рассчет']

function handleCarDataUpdate(value: { enginePower: number | null, category: CarCategory | '' }) {
  carEnginePower.value = value.enginePower
  carCategory.value = value.category
}

function handleDriversUpdate(value: { mode: DriversMode, drivers: InsuranceDriver[] }) {
  driversMode.value = value.mode
  driversList.value = value.drivers
}

function isShowNextStepBtn () {
  if (currentStep.value === 1) {
    return makeModelValue.value.trim().split(' ').length >= 2
  }
  if (currentStep.value === 2) {
    return carDataValid.value
  }
  if (currentStep.value === 3) {
    return driversValid.value
  }
  return false
}

function goToNextStep () {
  currentStep.value++
}

function goToPrevStep () {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

</script>

<style lang="scss" scoped>
.insurance {
  margin-top: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  &__content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 900px;
    margin-top: 100px;
    background-color: #fff;
    border-radius: 10px;
    margin-bottom: 150px;

    &-buttons {
      display: flex;
      width: 80%;
      margin-top: 30px;
    }

    &-next-btn {
      border: none;
      padding: 7px 25px;
      background-color: #528a52;
      color: #fff;
      border-radius: 20px;
      margin-left: auto;

      &:hover {
        opacity: 0.8;
        transition-duration: 0.4s;
      }
    }

    &-back-btn {
      border: 2px solid var(--color-middle-blue);
      padding: 5px 25px;
      background-color: transparent;
      color: var(--color-middle-blue);
      border-radius: 20px;

      &:hover {
        background-color: var(--color-middle-blue);
        color: #fff;
        transition-duration: 0.4s;
      }
    }
  }
}

.steps {
  --margin-step: 120px;

  display: flex;

  &__item {
    position: relative;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    &:not(:last-child) {
      margin-right: var(--margin-step);
    }
    &:not(:last-child)::after {
      content: '';
      position: absolute;
      left: 100%;
      top: 50%;
      transform: translateY(-50%);
      width: calc(var(--margin-step) + 2px);
      height: 2px;
      background-color: var(--color-middle-blue);
    }

    &--completed:not(:last-child)::after {
      background-color: #528a52;
    }

    &-circle {
      width: 40px;
      height: 40px;
      color: #504f4f;
      border: 2px solid var(--color-middle-blue);
      border-radius: 50%;
      font-size: 18px;
      font-weight: bold;
      display: flex;
      justify-content: center;
      align-items: center;

      &--active {
        color: #fff;
        background-color: var(--color-middle-blue);
      }

      &--completed {
        color: #fff;
        background-color: #528a52;
        border-color: #528a52;
      }
    }

    &-text {
      position: absolute;
      top: 110%;
      color: #504f4f;
      white-space: nowrap;
    }
  }
}
</style>
