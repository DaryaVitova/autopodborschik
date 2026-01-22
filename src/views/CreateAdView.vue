<template>
  <div class="container">
    <div class="form-container">
      <form class="form" @submit.prevent>
        <div class="form__main">
          <div class="form__global-first-group">
            <InputCreateAd
              v-model="formData.brand"
              :errorData="isErrorData.brand"
              type="text"
              id="brand"
              errorText="*Заполните это поле"
              labelText="Марка *"
              @input="clearError('brand')"
            />

            <InputCreateAd
              v-model="formData.model"
              :errorData="isErrorData.model"
              type="text"
              id="model"
              errorText="*Заполните это поле"
              labelText="Модель *"
              @input="clearError('model')"
            />

            <InputCreateAd
              v-model="formData.mileage"
              :errorData="isErrorData.mileage"
              type="number"
              :maxlength="maxLength"
              moreClass="form__input--number"
              id="mileage"
              errorText="*Введите пробег"
              labelText="Пробег *"
              @input="clearError('mileage')"
            />

            <div class="form__group">
              <span v-if="isErrorData.year" class="form__error-message">*Выберите год выпуска</span>
              <label for="year" class="form__label">Год выпуска *</label>
              <custom-select-year
                v-model="formData.year"
                placeholderText="Выберите год"
                @clear-error="clearError('year')"
              />
            </div>

            <InputCreateAd
              v-model="formData.city"
              :errorData="isErrorData.city"
              type="text"
              id="city"
              errorText="*Заполните это поле"
              labelText="Город *"
              @input="clearError('city')"
            />

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
              v-model="formData.price"
              :errorData="isErrorData.price"
              type="number"
              :maxlength="maxLength"
              moreClass="form__input--number"
              id="mileage"
              errorText="*Укажите цену"
              labelText="Цена *"
              @input="clearError('price')"
            />

          </div>

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
        </div>
        <button type="button" class="form__submit" @click="submitForm">Выложить объявление</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import InputCreateAd from "@/components/CreateAd/InputCreateAd.vue";
import { db } from '@/firebase.ts'
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import CustomSelectYear from '@/components/common/CustomSelectYear.vue'
import { useRouter } from 'vue-router'

// Конфигурация ImgBB
const IMGBB_API_KEY = '88b06633d3d37ab1abf4c2c01303e6b9'
const IMGBB_UPLOAD_URL = 'https://api.imgbb.com/1/upload'

interface FormData {
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

interface Country {
  code: string,
  name: string
  phoneCode: string,
  flag: string
}

interface ImgBBUploadResult {
  url: string;
  thumb: string;          // URL миниатюры
  medium: string;         // URL среднего размера
  deleteUrl: string;      // URL для удаления
}

interface FirebasePhotoData {
  url: string;
  thumb: string;
  medium: string;
}

interface FirebaseAdvertisementData {
  brand: string;
  model: string;
  mileage: number;
  year: string;
  city: string;
  phone: string | null;
  price: number;
  description: string;
  photos: FirebasePhotoData[];
  photoCount: number;
  hasPhotos: boolean;
  createdAt: null;
  updatedAt: null;
  countryCode: string;
  status: 'active' | 'inactive' | 'pending';
  storageProvider: 'imgbb' | 'none';
}

interface SaveToFirebaseResult {
  success: boolean;
  id?: string;
  data?: FirebaseAdvertisementData;
  imgbbData?: ImgBBUploadResult[];
  error?: string;
}

const router = useRouter()

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
const phone = ref<string>('')

const uploadedPhotos = ref<string[]>([])
const maxPhotos: number = 5

const maxLength = 15

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

const phonePlaceholder = () => {
  if (selectedCountry.value === 'RU') {
    return 'XXX XXX-XX-XX'
  }
}

const updatePhoneCode = (): void => {
  phone.value = ''
  clearError('phone')
}

function inputPhone (event: InputEvent): void | '' {
  clearError('phone')
  return selectedCountry.value === 'RU' ? formatPhoneNumber(event) : ''
}

function formatPhoneNumber (e: InputEvent): void {
  if (!(e.target instanceof HTMLInputElement)) {
    console.error('Event target is not an input element')
    return
  }

  const target: HTMLInputElement = e.target

  let input = target.value.replace(/[^0-9]/g, '')

  input = input.slice(0, 10)

  // Форматируем по шаблону XXX XXX-XX-XX
  let formatted = ''

  if (input.length > 0) {
    formatted = input.slice(0, 3)

    if (input.length > 3) {
      formatted += ' ' + input.slice(3, 6)
    }

    if (input.length > 6) {
      formatted += '-' + input.slice(6, 8)
    }

    if (input.length > 8) {
      formatted += '-' + input.slice(8)
    }
  }
  phone.value = formatted
}

// загрузка фото на ImgBB
const uploadToImgBB = async (base64Image: string): Promise<ImgBBUploadResult> => {
  try {
    console.log("📤 Загружаем фото на ImgBB...")

    const base64Data = base64Image.split(',')[1] || base64Image

    const formData = new FormData()
    formData.append('image', base64Data)

    const response = await fetch(`${IMGBB_UPLOAD_URL}?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    if (result.success) {
      console.log("✅ Фото загружено на ImgBB:", result.data.url)
      return {
        url: result.data.url,
        thumb: result.data.thumb.url,
        medium: result.data.medium?.url || result.data.url,
        deleteUrl: result.data.delete_url
      }
    } else {
      throw new Error(result.error?.message || 'Unknown ImgBB error')
    }

  } catch (error) {
    console.error("❌ Ошибка загрузки на ImgBB:", error)
    throw error
  }
}

// Загрузка всех фото на ImgBB
const uploadAllPhotosToImgBB = async (photosBase64: string[]): Promise<ImgBBUploadResult[]> => {
  const uploadedPhotos: ImgBBUploadResult[] = []

  for (let i = 0; i < photosBase64.length; i++) {
    try {
      console.log(`🔄 Загружаем фото ${i+1}/${photosBase64.length}...`)

      const imgbbResult = await uploadToImgBB(photosBase64[i] || '')
      uploadedPhotos.push(imgbbResult)

      // Небольшая задержка чтобы не превысить лимиты ImgBB
      if (i < photosBase64.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }

    } catch (error) {
      console.error(`❌ Не удалось загрузить фото ${i+1}:`, error)
    }
  }

  return uploadedPhotos
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

// Очистка ошибки при вводе
const clearError = (field: FormErrorField): void => {
  isErrorData[field] = false
}

const validateForm = (): boolean => {
  let isValid: boolean = true

  // Сбрасываем все ошибки
  const errorKeys: (keyof FormErrors)[] = ['brand', 'model', 'mileage', 'year', 'city', 'phone', 'price']
  errorKeys.forEach(key => {
    isErrorData[key] = false
  })

  // Проверка каждого поля с защитой от ошибок
  const checkString = (value: unknown): value is string => {
    return typeof value === 'string' && value.trim().length > 0
  }

  if (!checkString(formData.value.brand)) {
    isErrorData.brand = true
    isValid = false
  }

  if (!checkString(formData.value.model)) {
    isErrorData.model = true
    isValid = false
  }

  if (!formData.value.mileage || formData.value.mileage <= 0) {
    isErrorData.mileage = true
    isValid = false
  }

  if (!formData.value.year) {
    isErrorData.year = true
    isValid = false
  }

  if (!checkString(formData.value.city)) {
    isErrorData.city = true
    isValid = false
  }

  if (!phone.value || !phone.value.trim()) {
    isErrorData.phone = true
    isValid = false
  }

  if (!formData.value.price || formData.value.price <= 0) {
    isErrorData.price = true
    isValid = false
  }

  return isValid
}

// Обновите saveToFirebase
const saveToFirebase = async (advertisementData: FormData): Promise<SaveToFirebaseResult> => {
  try {
    console.log("📤 Начинаем сохранение с фото через ImgBB...")

    let imgbbPhotoData: ImgBBUploadResult[] = []

    // 1. Загружаем фото на ImgBB если они есть
    if (uploadedPhotos.value.length > 0) {
      console.log(`🖼️  Загружаем ${uploadedPhotos.value.length} фото на ImgBB...`)

      try {
        imgbbPhotoData = await uploadAllPhotosToImgBB(uploadedPhotos.value)
        console.log("✅ Фото загружены на ImgBB:", imgbbPhotoData.length)
      } catch (error) {
        console.warn("⚠️  Не удалось загрузить фото на ImgBB, продолжаем без фото:", error)
      }
    }

    // 2. Подготавливаем данные для Firestore
    const firebaseData: FirebaseAdvertisementData = {
      brand: advertisementData.brand,
      model: advertisementData.model,
      mileage: Number(advertisementData.mileage),
      year: advertisementData.year,
      city: advertisementData.city,
      phone: advertisementData.phone,
      price: Number(advertisementData.price),
      description: advertisementData.description || '',

      // Данные о фото с ImgBB
      photos: imgbbPhotoData.map(photo => ({
        url: photo.url,
        thumb: photo.thumb,
        medium: photo.medium
      })),
      photoCount: imgbbPhotoData.length,
      hasPhotos: imgbbPhotoData.length > 0,

      // Метаданные
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      countryCode: selectedCountry.value,
      status: 'active',
      storageProvider: imgbbPhotoData.length > 0 ? 'imgbb' : 'none'
    }

    console.log("📝 Данные для Firestore:", {
      ...firebaseData,
      photos: `[${firebaseData.photos.length} фото с ImgBB]`
    })

    // 3. Сохраняем в Firestore
    const docRef = await addDoc(collection(db, "advertisements"), firebaseData)

    console.log("✅ Объявление сохранено с ID:", docRef.id)
    return {
      success: true,
      id: docRef.id,
      data: firebaseData,
      imgbbData: imgbbPhotoData
    }

  } catch (error) {
    console.error("❌ Ошибка при сохранении:", error)

    const errorMessage = error instanceof Error
      ? error.message
      : "Неизвестная ошибка"

    return { success: false, error: errorMessage }
  }
}

const submitForm = async (): Promise<void> => {
  // Проверяем API ключ
  if (!IMGBB_API_KEY || IMGBB_API_KEY.includes('b1234567890')) {
    console.warn("⚠️  API ключ ImgBB не настроен!")
    // Можно продолжить без фото или показать предупреждение
  }

  const country = countries.value.find(c => c.code === selectedCountry.value)
  if (country) {
    formData.value.phone = `+${country.phoneCode} ${phone.value}`
  }

  if (!validateForm()) {
    console.log("❌ Валидация не пройдена")
    return
  }

  console.log("✅ Валидация пройдена")

  // Создаем объект с данными
  const advertisementData: FormData = {
    ...formData.value,
    id: Date.now()
  }

  try {
    // Сохраняем в Firebase с фото на ImgBB
    const firebaseResult: SaveToFirebaseResult = await saveToFirebase(advertisementData)

    if (firebaseResult.success) {
      console.log("🎉 Успешно! Объявление сохранено")

      let successMessage = '✅ Объявление успешно отправлено!'
      if (firebaseResult.imgbbData && firebaseResult.imgbbData.length > 0) {
        successMessage += `\n📸 Загружено ${firebaseResult.imgbbData.length} фото`
      }

      alert(successMessage)
      resetForm()
      router.push({ name: 'cards' })

    } else {
      console.error("❌ Ошибка Firebase:", firebaseResult.error)
      alert('❌ Ошибка при сохранении: ' + firebaseResult.error)
    }

  } catch (error) {
    console.error("💥 Общая ошибка:", error)
    const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка'
    // Если error является экземпляром класса Error, тогда возьми его свойство message, в противном случае верни строку "Неизвестная ошибка"
    alert('❌ Произошла ошибка: ' + errorMessage)
  }
}

// Сброс формы
const resetForm = () => {
  formData.value = {
    brand: '',
    model: '',
    mileage: null,
    year: '',
    city: '',
    phone: '',
    photos: [],
    price: null,
    description: '',
    id: Date.now()
  }

  phone.value = ''
  uploadedPhotos.value = []
  selectedCountry.value = 'RU'

  const errorKeys: (keyof FormErrors)[] = ['brand', 'model', 'mileage', 'year', 'city', 'phone', 'price']

  errorKeys.forEach(key => {
    isErrorData[key] = false
  })
}
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
}
.form {
  display: flex;
  flex-direction: column;
  background-color: #ededed;
  border-radius: 5px;
  backdrop-filter: blur(200px);
  padding: 60px 60px 40px 60px;
  &__main {
    display: flex;
    justify-content: space-around;
    align-items: flex-start;
    gap: 150px;
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
    border: 2px solid #45576a;
    color: white;
    background-color: #5296bc;
    border-radius: 5px;
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
    height: 33px;
    padding-left: 10px;
    border: none;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
  &__textarea {
    height: 150px;
    width: 400px;
    margin-bottom: 10px;
    border: none;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
  &__error-message {
    font-size: 14px;
    color: #bf0606;
  }
  &__phone-input {
    height: 33px;
    display: flex;
    width: 100%;
    &-country {
      width: 30%;
      //border-right: none;
      border: none;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    &-number {
      padding-left: 15px;
      width: 70%;
      //border: 1px solid #6e6d6d;
      //border-left: none;
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
  /* Убираем стандартное сообщение */
  color: transparent;
}

</style>
