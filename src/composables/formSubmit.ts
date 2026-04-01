import {IMGBB_API_KEY, IMGBB_UPLOAD_URL} from "@/helpers/consts_db.ts";
import type { Country, FormData, FormErrors, SaveToFirebaseResult, ImgBBUploadResult, FirebaseAdvertisementData } from "@/views/CreateAdView.vue";
import { useRouter } from "vue-router";
import { type Ref, type Reactive, ref } from "vue"
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import {db} from "@/firebase.ts";

export function useFormSubmit(
  countriesRef: Ref<readonly Country[]>,
  formDataRef: Ref<FormData>,
  selectedCountryRef: Ref<string>,
  phoneRef: Ref<string>,
  uploadedPhotosRef: Ref<string[]>,
  isErrorDataRef: Reactive<FormErrors>,
) {

  const router = useRouter()

  const loader = ref<boolean>(false)

  const validateForm = (): boolean => {
    let isValid: boolean = true

    // Сбрасываем все ошибки
    const errorKeys: (keyof FormErrors)[] = ['brand', 'model', 'mileage', 'year', 'city', 'phone', 'price']
    errorKeys.forEach(key => {
      isErrorDataRef[key] = false
    })

    const checkString = (value: unknown): value is string => {
      return typeof value === 'string' && value.trim().length > 0
    }

    if (!checkString(formDataRef.value.brand)) {
      isErrorDataRef.brand = true
      isValid = false
    }

    if (!checkString(formDataRef.value.model)) {
      isErrorDataRef.model = true
      isValid = false
    }

    if (!formDataRef.value.mileage || formDataRef.value.mileage <= 0) {
      isErrorDataRef.mileage = true
      isValid = false
    }

    if (!formDataRef.value.year) {
      isErrorDataRef.year = true
      isValid = false
    }

    if (!checkString(formDataRef.value.city)) {
      isErrorDataRef.city = true
      isValid = false
    }

    if (!phoneRef.value || !phoneRef.value.trim()) {
      isErrorDataRef.phone = true
      isValid = false
    }

    if (!formDataRef.value.price || formDataRef.value.price <= 0) {
      isErrorDataRef.price = true
      isValid = false
    }

    return isValid
  }

  const uploadToImgBB = async (base64Image: string): Promise<ImgBBUploadResult> => {
    console.log("📤 Загружаем фото на ImgBB...")

    const base64Data = base64Image.split(',')[1] || base64Image

    const formData = new FormData()
    formData.append('image', base64Data)

    const response = await fetch(`${IMGBB_UPLOAD_URL}?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      console.error(`❌ HTTP ошибка: ${response.status}`)
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
  }

  const uploadAllPhotosToImgBB = async (photosBase64: string[]): Promise<ImgBBUploadResult[]> => {
    const uploadedPhotos: ImgBBUploadResult[] = []

    for (let i = 0; i < photosBase64.length; i++) {
      try {
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

  const saveToFirebase = async (advertisementData: FormData): Promise<SaveToFirebaseResult> => {
    try {
      let imgbbPhotoData: ImgBBUploadResult[] = []

      if ( uploadedPhotosRef.value.length > 0) {

        try {
          imgbbPhotoData = await uploadAllPhotosToImgBB(uploadedPhotosRef.value)
          console.log("✅ Фото загружены на ImgBB:", imgbbPhotoData.length)
        } catch (error) {
          console.warn("⚠️  Не удалось загрузить фото на ImgBB, продолжаем без фото:", error)
        }
      }

      // данные для Firestore
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
        countryCode: selectedCountryRef.value,
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
    loader.value = true

    if (!IMGBB_API_KEY || IMGBB_API_KEY.includes('b1234567890')) {
      console.warn("⚠️  API ключ ImgBB не настроен!")
    }

    const country = countriesRef.value.find(c => c.code === selectedCountryRef.value)
    if (country) {
      formDataRef.value.phone = `+${country.phoneCode} ${phoneRef.value}`
    }

    if (!validateForm()) {
      console.log("❌ Валидация не пройдена")
      return
    }

    const advertisementData: FormData = {
      ...formDataRef.value,
      id: Date.now()
    }

    try {
      // Сохраняем в Firebase с фото на ImgBB
      const firebaseResult: SaveToFirebaseResult = await saveToFirebase(advertisementData)

      if (firebaseResult.success) {
        console.log("🎉 Успешно! Объявление сохранено")

        // let successMessage = '✅ Объявление успешно отправлено!'
        // if (firebaseResult.imgbbData && firebaseResult.imgbbData.length > 0) {
        //   successMessage += `\n📸 Загружено ${firebaseResult.imgbbData.length} фото`
        // }

        loader.value = false

        // alert(successMessage)
        resetForm()
        router.push({ name: 'cards' })

      } else {
        console.error("❌ Ошибка Firebase:", firebaseResult.error)
        alert('❌ Ошибка при сохранении: ' + firebaseResult.error)
      }

    } catch (error) {
      console.error("💥 Общая ошибка:", error)
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка'
      alert('❌ Произошла ошибка: ' + errorMessage)
    }
  }

  const resetForm = () => {
    formDataRef.value = {
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

    phoneRef.value = ''
    uploadedPhotosRef.value = []
    selectedCountryRef.value = 'RU'

    const errorKeys: (keyof FormErrors)[] = ['brand', 'model', 'mileage', 'year', 'city', 'phone', 'price']

    errorKeys.forEach(key => {
      isErrorDataRef[key] = false
    })
  }

  return { submitForm, loader }

}
