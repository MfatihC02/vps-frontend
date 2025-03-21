<template>
  <div class="space-y-8">
    <h3 class="text-lg font-medium text-gray-900">Zirai Alet Özellikleri</h3>

    <!-- Alet Tipi -->
    <div class="form-group">
      <label class="block text-sm font-medium text-gray-700 mb-1">
        Alet Tipi*
      </label>
      <select
        v-model="specifications.toolType"
        required
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
      >
        <option value="">Tip Seçin</option>
        <option value="manual">Manuel</option>
        <option value="motorized">Motorlu</option>
        <option value="electronic">Elektronik</option>
        <option value="mechanical">Mekanik</option>
      </select>
    </div>

    <!-- Genel Bilgiler -->
    <div class="space-y-6">
      <h4 class="text-md font-medium text-gray-800">Genel Özellikler</h4>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="form-group">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Marka*
          </label>
          <input
            v-model="specifications.general.brand"
            type="text"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <div class="form-group">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Model
          </label>
          <input
            v-model="specifications.general.model"
            type="text"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <div class="form-group">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Üretim Yılı
          </label>
          <input
            v-model.number="specifications.general.manufacturingYear"
            type="number"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <div class="form-group">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Menşei
          </label>
          <input
            v-model="specifications.general.origin"
            type="text"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>

      <!-- Garanti Bilgileri -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="form-group">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Garanti Süresi
          </label>
          <input
            v-model.number="specifications.general.warranty.duration"
            type="number"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <div class="form-group">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Garanti Tipi
          </label>
          <input
            v-model="specifications.general.warranty.type"
            type="text"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>

      <!-- Ağırlık ve Boyut Bilgileri -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="form-group">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Ağırlık
          </label>
          <div class="grid grid-cols-2 gap-2">
            <input
              v-model.number="specifications.general.weight.value"
              type="number"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <select
              v-model="specifications.general.weight.unit"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="kg">KG</option>
              <option value="gr">GR</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Boyutlar -->
      <div class="space-y-4">
        <h5 class="text-sm font-medium text-gray-700">Boyutlar</h5>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="form-group">
            <label class="block text-sm text-gray-600 mb-1">Uzunluk</label>
            <input
              v-model.number="specifications.general.dimensions.length"
              type="number"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div class="form-group">
            <label class="block text-sm text-gray-600 mb-1">Genişlik</label>
            <input
              v-model.number="specifications.general.dimensions.width"
              type="number"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div class="form-group">
            <label class="block text-sm text-gray-600 mb-1">Yükseklik</label>
            <input
              v-model.number="specifications.general.dimensions.height"
              type="number"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div class="form-group">
            <label class="block text-sm text-gray-600 mb-1">Birim</label>
            <select
              v-model="specifications.general.dimensions.unit"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="cm">CM</option>
              <option value="m">M</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Teknik Özellikler -->
    <div class="space-y-6">
      <h4 class="text-md font-medium text-gray-800">Teknik Özellikler</h4>

      <!-- Motor Bilgileri -->
      <div class="space-y-4">
        <h5 class="text-sm font-medium text-gray-700">Motor Bilgileri</h5>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="form-group">
            <label class="block text-sm text-gray-600 mb-1">Motor Tipi</label>
            <select
              v-model="specifications.technical.engine.type"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Seçiniz</option>
              <option value="electric">Elektrikli</option>
              <option value="gasoline">Benzinli</option>
              <option value="diesel">Dizel</option>
            </select>
          </div>

          <div class="form-group">
            <label class="block text-sm text-gray-600 mb-1">Yakıt Tipi</label>
            <input
              v-model="specifications.technical.engine.fuelType"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div class="form-group">
            <label class="block text-sm text-gray-600 mb-1">Motor Gücü</label>
            <div class="grid grid-cols-2 gap-2">
              <input
                v-model.number="specifications.technical.engine.power.value"
                type="number"
                step="1"
                min="0"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <select
                v-model="specifications.technical.engine.power.unit"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="HP">HP</option>
                <option value="kW">kW</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="block text-sm text-gray-600 mb-1"
              >Yakıt Kapasitesi</label
            >
            <input
              v-model.number="specifications.technical.engine.fuelCapacity"
              type="number"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>
      </div>

      <!-- İlaçlama Makinesi Özellikleri -->
      <div v-if="showSprayerFields" class="space-y-4">
        <h5 class="text-sm font-medium text-gray-700">
          İlaçlama Makinesi Özellikleri
        </h5>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="form-group">
            <label class="block text-sm text-gray-600 mb-1"
              >Tank Kapasitesi</label
            >
            <div class="grid grid-cols-2 gap-2">
              <input
                v-model.number="
                  specifications.technical.sprayer.tankCapacity.value
                "
                type="number"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <input
                v-model="specifications.technical.sprayer.tankCapacity.unit"
                type="text"
                placeholder="Birim"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="block text-sm text-gray-600 mb-1"
              >Püskürtme Mesafesi</label
            >
            <div class="grid grid-cols-2 gap-2">
              <input
                v-model.number="
                  specifications.technical.sprayer.sprayDistance.value
                "
                type="number"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <input
                v-model="specifications.technical.sprayer.sprayDistance.unit"
                type="text"
                placeholder="Birim"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          <div class="form-group col-span-2">
            <label class="block text-sm text-gray-600 mb-1"
              >Basınç Aralığı</label
            >
            <div class="grid grid-cols-3 gap-2">
              <input
                v-model.number="
                  specifications.technical.sprayer.pressureRange.min
                "
                type="number"
                placeholder="Min"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <input
                v-model.number="
                  specifications.technical.sprayer.pressureRange.max
                "
                type="number"
                placeholder="Max"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <input
                v-model="specifications.technical.sprayer.pressureRange.unit"
                type="text"
                placeholder="Birim"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          <div class="form-group col-span-2">
            <label class="block text-sm text-gray-600 mb-1"
              >Nozul Tipleri</label
            >
            <div class="flex flex-wrap gap-2">
              <div
                v-for="(nozzle, index) in specifications.technical.sprayer
                  .nozzleTypes"
                :key="index"
                class="flex items-center"
              >
                <input
                  v-model="specifications.technical.sprayer.nozzleTypes[index]"
                  type="text"
                  class="w-40 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                /><button
                  @click="
                    specifications.technical.sprayer.nozzleTypes.splice(
                      index,
                      1
                    )
                  "
                  class="ml-2 text-red-600 hover:text-red-800"
                >
                  <span class="px-2">×</span>
                </button>
              </div>
              <button
                @click="specifications.technical.sprayer.nozzleTypes.push('')"
                class="px-4 py-2 text-sm text-green-600 border border-green-600 rounded-lg hover:bg-green-50"
              >
                + Nozul Ekle
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Çapa Makinesi Özellikleri -->
      <div v-if="showHoeMachineFields" class="space-y-4">
        <h5 class="text-sm font-medium text-gray-700">
          Çapa Makinesi Özellikleri
        </h5>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="form-group">
            <label class="block text-sm text-gray-600 mb-1"
              >Çalışma Genişliği</label
            >
            <div class="grid grid-cols-2 gap-2">
              <input
                v-model.number="
                  specifications.technical.hoeMachine.workingWidth.value
                "
                type="number"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <input
                v-model="specifications.technical.hoeMachine.workingWidth.unit"
                type="text"
                placeholder="Birim"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="block text-sm text-gray-600 mb-1"
              >Çalışma Derinliği</label
            >
            <div class="grid grid-cols-2 gap-2">
              <input
                v-model.number="
                  specifications.technical.hoeMachine.workingDepth.value
                "
                type="number"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <input
                v-model="specifications.technical.hoeMachine.workingDepth.unit"
                type="text"
                placeholder="Birim"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="block text-sm text-gray-600 mb-1">Bıçak Sayısı</label>
            <input
              v-model.number="specifications.technical.hoeMachine.bladeCount"
              type="number"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div class="form-group">
            <label class="block text-sm text-gray-600 mb-1"
              >Vites Sistemi</label
            >
            <input
              v-model="specifications.technical.hoeMachine.gearSystem"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Bakım Bilgileri -->
    <div class="space-y-6">
      <h4 class="text-md font-medium text-gray-800">Bakım Bilgileri</h4>

      <!-- Yedek Parçalar -->
      <div class="space-y-4">
        <h5 class="text-sm font-medium text-gray-700">Yedek Parçalar</h5>
        <div class="space-y-4">
          <div
            v-for="(part, index) in specifications.maintenance.spareParts"
            :key="index"
            class="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div class="form-group">
              <input
                v-model="part.name"
                type="text"
                placeholder="Parça Adı"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div class="form-group">
              <input
                v-model="part.code"
                type="text"
                placeholder="Parça Kodu"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div class="flex items-center space-x-4">
              <label class="flex items-center space-x-2">
                <input
                  v-model="part.availability"
                  type="checkbox"
                  class="rounded text-green-600 focus:ring-green-500"
                />
                <span class="text-sm text-gray-700">Stokta Var</span>
              </label>
              <button
                @click="specifications.maintenance.spareParts.splice(index, 1)"
                class="text-red-600 hover:text-red-800"
              >
                <span class="px-2">×</span>
              </button>
            </div>
          </div>
          <button
            @click="
              specifications.maintenance.spareParts.push({
                name: '',
                code: '',
                availability: false,
              })
            "
            class="px-4 py-2 text-sm text-green-600 border border-green-600 rounded-lg hover:bg-green-50"
          >
            + Yedek Parça Ekle
          </button>
        </div>
      </div>

      <!-- Servis Bilgileri -->
      <div class="space-y-4">
        <h5 class="text-sm font-medium text-gray-700">Servis Bilgileri</h5>
        <div class="grid grid-cols-1 gap-4">
          <div class="form-group">
            <label class="flex items-center space-x-2">
              <input
                v-model="specifications.maintenance.serviceInfo.available"
                type="checkbox"
                class="rounded text-green-600 focus:ring-green-500"
              />
              <span class="text-sm text-gray-700">Servis Mevcut</span>
            </label>
          </div>

          <div class="form-group">
            <label class="block text-sm text-gray-600 mb-1"
              >Servis Bölgeleri</label
            >
            <div class="flex flex-wrap gap-2">
              <div
                v-for="(coverage, index) in specifications.maintenance
                  .serviceInfo.coverage"
                :key="index"
                class="flex items-center"
              >
                <input
                  v-model="
                    specifications.maintenance.serviceInfo.coverage[index]
                  "
                  type="text"
                  class="w-40 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <button
                  @click="
                    specifications.maintenance.serviceInfo.coverage.splice(
                      index,
                      1
                    )
                  "
                  class="ml-2 text-red-600 hover:text-red-800"
                >
                  <span class="px-2">×</span>
                </button>
              </div>
              <button
                @click="
                  specifications.maintenance.serviceInfo.coverage.push('')
                "
                class="px-4 py-2 text-sm text-green-600 border border-green-600 rounded-lg hover:bg-green-50"
              >
                + Bölge Ekle
              </button>
            </div>
          </div>

          <div class="form-group">
            <label class="block text-sm text-gray-600 mb-1"
              >Servis Talimatları</label
            >
            <textarea
              v-model="specifications.maintenance.serviceInfo.instructions"
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            ></textarea>
          </div>
        </div>
      </div>
    </div>

    <!-- Kullanım Bilgileri -->
    <div class="space-y-6">
      <h4 class="text-md font-medium text-gray-800">Kullanım Bilgileri</h4>

      <!-- Uygulama Alanları -->
      <div class="form-group">
        <label class="block text-sm text-gray-600 mb-1"
          >Uygulama Alanları</label
        >
        <div class="flex flex-wrap gap-2">
          <div
            v-for="(application, index) in specifications.usage.applications"
            :key="index"
            class="flex items-center"
          >
            <input
              v-model="specifications.usage.applications[index]"
              type="text"
              class="w-40 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <button
              @click="specifications.usage.applications.splice(index, 1)"
              class="ml-2 text-red-600 hover:text-red-800"
            >
              <span class="px-2">×</span>
            </button>
          </div>
          <button
            @click="specifications.usage.applications.push('')"
            class="px-4 py-2 text-sm text-green-600 border border-green-600 rounded-lg hover:bg-green-50"
          >
            + Alan Ekle
          </button>
        </div>
      </div>

      <!-- Güvenlik Bilgileri -->
      <div class="form-group">
        <label class="block text-sm text-gray-600 mb-1"
          >Güvenlik Bilgileri</label
        >
        <div class="flex flex-wrap gap-2">
          <div
            v-for="(safety, index) in specifications.usage.safety"
            :key="index"
            class="flex items-center"
          >
            <input
              v-model="specifications.usage.safety[index]"
              type="text"
              class="w-40 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <button
              @click="specifications.usage.safety.splice(index, 1)"
              class="ml-2 text-red-600 hover:text-red-800"
            >
              <span class="px-2">×</span>
            </button>
          </div>
          <button
            @click="specifications.usage.safety.push('')"
            class="px-4 py-2 text-sm text-green-600 border border-green-600 rounded-lg hover:bg-green-50"
          >
            + Güvenlik Bilgisi Ekle
          </button>
        </div>
      </div>

      <!-- Kullanım Talimatları -->
      <div class="form-group">
        <label class="block text-sm text-gray-600 mb-1"
          >Kullanım Talimatları</label
        >
        <textarea
          v-model="specifications.usage.instructions"
          rows="4"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        ></textarea>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      toolType: "",
      general: {
        brand: "",
        model: "",
        manufacturingYear: null,
        warranty: {
          duration: null,
          type: "",
        },
        origin: "",
        weight: {
          value: null,
          unit: "kg",
        },
        dimensions: {
          length: null,
          width: null,
          height: null,
          unit: "cm",
        },
      },
      technical: {
        engine: {
          type: "",
          power: {
            value: null,
            unit: "",
          },
          fuelType: "",
          fuelCapacity: null,
        },
        sprayer: {
          tankCapacity: {
            value: null,
            unit: "",
          },
          sprayDistance: {
            value: null,
            unit: "",
          },
          pressureRange: {
            min: null,
            max: null,
            unit: "",
          },
          nozzleTypes: [],
        },
        hoeMachine: {
          workingWidth: {
            value: null,
            unit: "",
          },
          workingDepth: {
            value: null,
            unit: "",
          },
          bladeCount: null,
          gearSystem: "",
        },
      },
      maintenance: {
        spareParts: [],
        serviceInfo: {
          available: false,
          coverage: [],
          instructions: "",
        },
      },
      usage: {
        applications: [],
        safety: [],
        instructions: "",
      },
    }),
  },
});

const emit = defineEmits(["update:modelValue"]);

const specifications = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

// Özel alanların gösterilip gösterilmeyeceğini belirleyen computed'lar
const showSprayerFields = computed(() => {
  return (
    specifications.value.toolType === "motorized" ||
    specifications.value.toolType === "electronic"
  );
});

const showHoeMachineFields = computed(() => {
  return (
    specifications.value.toolType === "mechanical" ||
    specifications.value.toolType === "motorized"
  );
});
</script>