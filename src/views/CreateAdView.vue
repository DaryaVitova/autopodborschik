<template>
  <div class="container">
    <div class="form-container">
      <form class="form" @submit.prevent>

        <div class="form__main">
          <fieldset class="form__fieldset">
            <div class="form__global-first-group">
              <InputCreateAd
                v-model="formData.brand"
                :errorData="isErrorData.brand"
                id="brand"
                errorText="*Заполните это поле"
                labelText="Марка *"
                @input="clearError('brand')"
              />

              <InputCreateAd
                v-model="formData.model"
                :errorData="isErrorData.model"
                id="model"
                errorText="*Заполните это поле"
                labelText="Модель *"
                @input="clearError('model')"
              />

              <InputCreateAd
                v-model="mileageDisplay"
                :errorData="isErrorData.mileage"
                :maxlength="maxLength"
                moreClass="form__input--number"
                id="mileage"
                errorText="*Введите пробег"
                labelText="Пробег *"
                checkNumber
                @input="clearError('mileage')"
              />

              <InputCreateAd
                v-model="formData.city"
                :errorData="isErrorData.city"
                id="city"
                errorText="*Заполните это поле"
                labelText="Город *"
                @input="clearError('city')"
              />

              <div class="form__group">
                <span v-if="isErrorData.year" class="form__error-message">*Выберите год выпуска</span>
                <label for="year" class="form__label">Год выпуска *</label>
                <CustomSelectYear
                  class="form__select-year"
                  v-model="formData.year"
                  placeholderText="Выберите год"
                  :isOpen="isSelectOpen"
                  @clear-error="clearError('year')"
                  @toggle="isSelectOpen = !isSelectOpen"
                  @close="isSelectOpen = false"
                />
              </div>

              <div class="form__group">
                <span v-if="isErrorData.phone" class="form__error-message">*Введите номер телефона</span>
                <label for="phone" class="form__label">Номер телефона *</label>
                <div class="form__phone-input">
                  <select
                    v-model="selectedCountry"
                    class="form__phone-input-country"
                    @change="updatePhoneCode"
                  >
                    <option
                      v-for="country in countries"
                      :key="country.code"
                      :value="country.code"
                    >
                      {{ country.flag }} (+{{ country.phoneCode }})
                    </option>
                  </select>

                  <input
                    id="phone"
                    type="tel"
                    class="form__phone-input-number"
                    :placeholder="phonePlaceholder()"
                    v-model="phone"
                    @input="inputPhone($event)"
                    maxlength="15"
                  >
                </div>
              </div>

              <InputCreateAd
                v-model="priceDisplay"
                :errorData="isErrorData.price"
                :maxlength="maxLength"
                moreClass="form__input--number"
                id="mileage"
                errorText="*Укажите цену"
                labelText="Цена *"
                checkNumber
                @input="clearError('price')"
              />
            </div>
          </fieldset>

          <fieldset class="form__fieldset">
            <div class="form__global-second-group">
              <div class="form__group">
                <label for="photos" class="form__label">Загрузите фото (до 5)</label>
                <input
                  type="file"
                  id="photos"
                  class="file-upload__input"
                  accept="image/*"
                  multiple
                  @change="handleFileUpload"
                >
              </div>

              <div class="photo-preview">
                <div
                  v-for="(photo, index) in uploadedPhotos"
                  :key="index"
                  class="photo-preview__item"
                >
                  <img :src="photo" alt="Preview">
                  <button @click="removePhoto(index)">Удалить</button>
                </div>
              </div>

              <div class="form__group form__group--textarea">
                <label for="description" class="form__label">Описание</label>
                <textarea
                  v-model="formData.description"
                  id="description"
                  class="form__textarea"
                ></textarea>
              </div>
            </div>
          </fieldset>
        </div>
        <button type="button" class="form__submit" @click="submitForm">Выложить объявление</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import InputCreateAd from "@/components/CreateAd/InputCreateAd.vue";
import { useFormatPhone } from "@/composables/formatPhone.ts";
import { useFormatters } from "@/composables/formatters.ts"
import { useFormSubmit } from "@/composables/formSubmit.ts"

const { formatNumber, parseNumber } = useFormatters()

export interface FormData {
  brand: string,
  model: string,
  mileage: number | null,
  year: string,
  city: string,
  phone: string | null,
  photos: string[],
  price: number | null,
  description: string,
  id: number
}

export type FormErrors = Record<keyof Pick<FormData,
  'brand' | 'model' | 'mileage' | 'year' | 'city' | 'phone' | 'price'>, boolean>

export interface Country {
  code: string,
  name: string
  phoneCode: string,
  flag: string
}

export interface ImgBBUploadResult {
  url: string
  thumb: string       // URL миниатюры
  medium: string     // URL среднего размера
  deleteUrl: string  // URL для удаления
}

interface FirebasePhotoData {
  url: string
  thumb: string
  medium: string
}

export interface FirebaseAdvertisementData {
  brand: string
  model: string
  mileage: number
  year: string
  city: string
  phone: string | null
  price: number
  description: string
  photos: FirebasePhotoData[]
  photoCount: number
  hasPhotos: boolean
  createdAt: null
  updatedAt: null
  countryCode: string
  status: 'active' | 'inactive' | 'pending'
  storageProvider: 'imgbb' | 'none'
}

export interface SaveToFirebaseResult {
  success: boolean
  id?: string
  data?: FirebaseAdvertisementData
  imgbbData?: ImgBBUploadResult[]
  error?: string
}

const formData = ref<FormData>({
  brand: '',
  model: '',
  mileage: null,
  year: '',
  city: '',
  phone: null,
  photos: [],
  price: null,
  description: '',
  id: Date.now()
})

const isErrorData = reactive<FormErrors>({
  brand: false,
  model: false,
  mileage: false,
  year: false,
  city: false,
  phone: false,
  price: false
})

type FormErrorField = keyof FormErrors

const selectedCountry = ref<string>('RU')

const uploadedPhotos = ref<string[]>([])
const maxPhotos: number = 5

const maxLength = 15

const isSelectOpen = ref(false)

const countries = ref<readonly Country[]>([
  { code: 'RU', name: 'Россия', phoneCode: '7', flag: '🇷🇺' },
  { code: 'BY', name: 'Беларусь', phoneCode: '375', flag: '🇧🇾' },
  { code: 'UA', name: 'Украина', phoneCode: '380', flag: '🇺🇦' },
  { code: 'KZ', name: 'Казахстан', phoneCode: '7', flag: '🇰🇿' },
  { code: 'US', name: 'США', phoneCode: '1', flag: '🇺🇸' },
  { code: 'DE', name: 'Германия', phoneCode: '49', flag: '🇩🇪' },
  { code: 'FR', name: 'Франция', phoneCode: '33', flag: '🇫🇷' },
  { code: 'GB', name: 'Великобритания', phoneCode: '44', flag: '🇬🇧' },
  { code: 'CN', name: 'Китай', phoneCode: '86', flag: '🇨🇳' }
])

const {
  phone,
  phonePlaceholder,
  formatPhoneNumber
} = useFormatPhone(selectedCountry.value)

const { submitForm } = useFormSubmit(
  countries,
  formData,
  selectedCountry,
  phone,
  uploadedPhotos,
  isErrorData
)

const mileageDisplay = computed({
  get: () => {
    if (formData.value.mileage === null) return ''
    return formatNumber(formData.value.mileage) || ''
  },
  set: (value: string) => {
    formData.value.mileage = parseNumber(value)
  }
})

const priceDisplay = computed({
  get: () => {
    if (formData.value.price === null) return ''
    return formatNumber(formData.value.price) || ''
  },
  set: (value: string) => {
    formData.value.price = parseNumber(value)
  }
})

const updatePhoneCode = (): void => {
  phone.value = ''
  clearError('phone')
}

function inputPhone (event: InputEvent): void | '' {
  clearError('phone')
  return selectedCountry.value === 'RU' ? formatPhoneNumber(event) : ''
}

function handleFileUpload(event: Event): void {
  const target = event.target as HTMLInputElement
  const files = target.files

  if (!files || files.length === 0) {
    console.log('No files selected')
    return
  }

  // Проверяем количество файлов
  if (uploadedPhotos.value.length + files.length > maxPhotos) {
    alert(`Можно загрузить не более ${maxPhotos} фото`)
    return
  }

  // Преобразуем файлы в base64 для ImgBB
  for (const file of files) {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          uploadedPhotos.value.push(e.target.result as string) // base64
        }
      }
      reader.readAsDataURL(file)
    }
  }
}

function removePhoto (index: number): void {
  uploadedPhotos.value.splice(index, 1)
}

const clearError = (field: FormErrorField): void => {
  isErrorData[field] = false
}
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
}
.form {
  --height-input: 33px;

  display: flex;
  flex-direction: column;
  background-color: #ededed;
  border-radius: 5px;
  backdrop-filter: blur(200px);
  padding: 60px 60px 40px 60px;
  margin: 150px 0 70px;

  &__main {
    display: flex;
    justify-content: space-around;
    align-items: flex-start;
    gap: 150px;
  }
  &__fieldset {
    border: none;
    padding: 0;
  }
  &__global-first-group {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  &__global-second-group {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  &__group {
    width: 100%;
    min-width: 100px;
    display: flex;
    flex-direction: column;
    &--textarea {
      margin-top: 20px;
    }
  }
  &__submit {
    padding: 8px 12px;
    width: fit-content;
    align-self: center;
    margin-top: 30px;
    border: 2px solid #fff;
    color: white;
    background-color: var(--color-middle-blue);
    border-radius: var(--border-radius-md);
    &:hover {
      opacity: 0.8;
      transform: scale(1.03);
      transition-duration: 0.2s;
    }
  }
  &__label {
    color: #616161;
  }
  &__input {
    height: var(--height-input);
    padding-left: 10px;
    border: none;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  &__select-year {
    padding-left: 10px;
    height: var(--height-input);
    display: flex;
    align-items: center;
  }
  &__textarea {
    height: 150px;
    width: 400px;
    margin-bottom: 10px;
    padding-inline: 10px;
    border: none;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
  &__error-message {
    font-size: 14px;
    color: #bf0606;
  }
  &__phone-input {
    height: var(--height-input);
    display: flex;
    width: 100%;
    &-country {
      width: 30%;
      border: none;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    &-number {
      padding-left: 15px;
      width: 70%;
      border: none;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      &:focus {
        outline: none;
      }
    }
  }
}

.photo-preview {
  display: flex;
  gap: 10px;
  margin-top: 20px;

  &__item {
    position: relative;
    width: 100px;
    height: 100px;
    border: 1px solid #ccc;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    button {
      position: absolute;
      top: 0;
      right: 0;
      background: transparent;
      border: none;
      cursor: pointer;
      color: red;
    }
  }
}

.file-upload__input {
  color: transparent;
}

@media (max-width: 1023px) {
  .form {
    margin-top: 100px;
    margin-inline: 10px;
    &__main {
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 100px;
    }
  }
}

@media (max-width: 570px) {
  .container {
    width: 90%;
  }
  .form {
    padding: 30px 15px 20px 15px;
    &__textarea {
      width: 90%;
    }
    &__global-second-group {
      justify-content: center;
      align-items: center;
    }
  }

  .photo-preview {
    flex-direction: column;
    align-items: center;
    width: 100%;

    &__item {
      width: 200px;
      height: 150px;
      margin-bottom: 15px;

      &:last-child {
        margin-bottom: 0;
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }
}

</style>
