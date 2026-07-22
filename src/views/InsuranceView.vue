<template>
  <div class="insurance">
    <header class="insurance__head">
      <p class="insurance__eyebrow">Расчёт стоимости</p>
      <h1 class="insurance__title">Полис ОСАГО</h1>
      <p class="insurance__subtitle">
        Заполните данные автомобиля и водителей — рассчитаем цену за пару минут.
      </p>
    </header>

    <StepProgress class="insurance__steps" :steps="stepLabels" :current="currentStep" />

    <div class="insurance__panel">
      <Transition name="step" mode="out-in">
        <keep-alive>
          <component
            :is="currentComponent"
            :category="carCategory"
            :engine-power="carEnginePower"
            :mode="driversMode"
            :drivers="driversList"
            @make-model-value="(value: string) => (makeModelValue = value)"
            @car-data-valid="(value: boolean) => (carDataValid = value)"
            @car-data-update="handleCarDataUpdate"
            @drivers-valid="(value: boolean) => (driversValid = value)"
            @drivers-update="handleDriversUpdate"
          />
        </keep-alive>
      </Transition>

      <div class="insurance__actions">
        <BaseButton
          v-if="currentStep > 1"
          variant="secondary"
          @click="goToPrevStep"
        >
          <template #leading><ArrowLeft :size="18" /></template>
          Назад
        </BaseButton>
        <BaseButton
          v-if="isShowNextStepBtn"
          class="insurance__next"
          @click="goToNextStep"
        >
          Далее
          <template #trailing><ArrowRight :size="18" /></template>
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import MakeModelStep from "@/components/Insurance/MakeModelStep.vue"
import CarDataStep from "@/components/Insurance/CarDataStep.vue"
import DriversStep from "@/components/Insurance/DriversStep.vue"
import CalculationStep from "@/components/Insurance/CalculationStep.vue"
import StepProgress from "@/components/ui/StepProgress.vue"
import BaseButton from "@/components/ui/BaseButton.vue"
import { ArrowLeft, ArrowRight } from "@lucide/vue"
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
  { title: 'Марка / модель ТС', component: MakeModelStep },
  { title: 'Данные ТС', component: CarDataStep },
  { title: 'Водители', component: DriversStep },
  { title: 'Расчёт', component: CalculationStep }
]

const stepLabels = steps.map(step => step.title)

const currentComponent = computed(() => steps[currentStep.value - 1]?.component)

function handleCarDataUpdate(value: { enginePower: number | null, category: CarCategory | '' }) {
  carEnginePower.value = value.enginePower
  carCategory.value = value.category
}

function handleDriversUpdate(value: { mode: DriversMode, drivers: InsuranceDriver[] }) {
  driversMode.value = value.mode
  driversList.value = value.drivers
}

const isShowNextStepBtn = computed(() => {
  if (currentStep.value === 1) return makeModelValue.value.trim().split(' ').length >= 2
  if (currentStep.value === 2) return carDataValid.value
  if (currentStep.value === 3) return driversValid.value
  return false
})

function goToNextStep() {
  currentStep.value++
}

function goToPrevStep() {
  if (currentStep.value > 1) currentStep.value--
}
</script>

<style lang="scss" scoped>
@use '@/assets/scss/mixins' as *;

.insurance {
  width: 100%;
  max-width: 860px;
  box-sizing: border-box;
  margin: var(--space-16) auto var(--space-20);
  padding: 0 var(--space-4);

  &__head {
    text-align: center;
    margin-bottom: var(--space-10);
  }
  &__eyebrow {
    margin: 0 0 var(--space-2);
    font-size: var(--text-sm);
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--primary);
  }
  &__title {
    font-size: var(--text-3xl);
    margin: 0;
  }
  &__subtitle {
    margin: var(--space-3) auto 0;
    max-width: 42ch;
    color: var(--ink-muted);
  }

  &__steps {
    margin-bottom: var(--space-8);
  }

  &__panel {
    position: relative;
    display: flex;
    flex-direction: column;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-lg);
    padding: var(--space-8);
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-top: var(--space-8);
    padding-top: var(--space-6);
    border-top: 1px solid var(--border);
  }
  &__next {
    margin-left: auto;
  }

  @include mobile {
    margin: var(--space-8) auto var(--space-12);

    &__title {
      font-size: var(--text-2xl);
    }
    &__panel {
      padding: var(--space-5);
    }
    &__actions {
      flex-wrap: wrap;
    }
  }
}

// Step-to-step transition
.step-enter-active,
.step-leave-active {
  transition: opacity var(--dur) var(--ease), transform var(--dur) var(--ease-out);
}
.step-enter-from {
  opacity: 0;
  transform: translateX(16px);
}
.step-leave-to {
  opacity: 0;
  transform: translateX(-16px);
}
</style>
