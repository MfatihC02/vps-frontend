<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Başlık Kısmı -->
    <div class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center">
          <h1 class="text-3xl font-bold text-gray-900">Bildirim Yönetimi</h1>
          <button
            @click="activeTab = 'create'"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg
              class="-ml-1 mr-2 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Yeni Bildirim
          </button>
        </div>
      </div>
    </div>

    <!-- İstatistik Kartları -->
    <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <svg
                  class="h-6 w-6 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Toplam Bildirim
                </dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">
                    {{ totalNotifications }}
                  </div>
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-green-500 rounded-md p-3">
                <svg
                  class="h-6 w-6 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Aktif Kampanyalar
                </dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">
                    {{ activeCampaigns }}
                  </div>
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <svg
                  class="h-6 w-6 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Bekleyen Bildirimler
                </dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">
                    {{ pendingNotifications }}
                  </div>
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Ana İçerik -->
    <div class="max-w-7xl mx-auto pb-12 px-4 sm:px-6 lg:px-8">
      <div class="bg-white shadow overflow-hidden sm:rounded-lg">
        <!-- Sekmeler -->
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex" aria-label="Tabs">
            <button
              @click="activeTab = 'list'"
              :class="[
                activeTab === 'list'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                'w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm',
              ]"
            >
              Tüm Bildirimler
            </button>
            <button
              @click="activeTab = 'create'"
              :class="[
                activeTab === 'create'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                'w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm',
              ]"
            >
              Yeni Bildirim
            </button>
            <button
              @click="activeTab = 'campaign'"
              :class="[
                activeTab === 'campaign'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                'w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm',
              ]"
            >
              Kampanya Bildirimleri
            </button>
          </nav>
        </div>

        <!-- Bildirim Listesi -->
        <div v-if="activeTab === 'list'" class="px-4 py-5 sm:p-6">
          <!-- Filtreleme ve Arama -->
          <div class="mb-6 flex flex-col md:flex-row gap-4 justify-between">
            <div class="flex flex-col sm:flex-row gap-3">
              <select
                v-model="filterStatus"
                class="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="read">Okunmuş</option>
                <option value="unread">Okunmamış</option>
              </select>
              <select
                v-model="filterType"
                class="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              >
                <option value="all">Tüm Tipler</option>
                <option value="normal">Normal</option>
                <option value="campaign">Kampanya</option>
                <option value="welcome">Hoşgeldin</option>
              </select>
            </div>
            <div class="w-full md:w-1/3">
              <div class="relative">
                <div
                  class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                >
                  <svg
                    class="h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  v-model="searchTerm"
                  type="text"
                  placeholder="Bildirimde ara..."
                  class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          <!-- Bildirimler Tablosu -->
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Başlık
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Kullanıcı
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Tip
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Durumu
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Tarih
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr
                  v-for="notification in filteredNotifications"
                  :key="notification._id"
                  class="hover:bg-gray-50"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="text-sm font-medium text-gray-900">
                        {{ notification.title }}
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">
                      {{ notification.user?.username }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ notification.user?.email }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      :class="[
                        'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                        notification.type === 'campaign'
                          ? 'bg-green-100 text-green-800'
                          : notification.type === 'welcome'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800',
                      ]"
                    >
                      {{
                        notification.type === "campaign"
                          ? "Kampanya"
                          : notification.type === "welcome"
                          ? "Hoşgeldin"
                          : "Normal"
                      }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      :class="[
                        'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                        notification.isRead
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-yellow-100 text-yellow-800',
                      ]"
                    >
                      {{ notification.isRead ? "Okundu" : "Okunmadı" }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(notification.createdAt) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      @click="viewNotification(notification)"
                      class="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Detay
                    </button>
                    <button
                      @click="deleteNotification(notification._id)"
                      class="text-red-600 hover:text-red-900"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
                <tr v-if="filteredNotifications.length === 0">
                  <td
                    colspan="6"
                    class="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    Bildirim bulunamadı.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Sayfalama -->
          <div
            class="py-3 flex items-center justify-between border-t border-gray-200 mt-4"
          >
            <div class="flex-1 flex justify-between sm:hidden">
              <button
                @click="page > 1 ? page-- : null"
                :disabled="page <= 1"
                class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Önceki
              </button>
              <button
                @click="page++"
                :disabled="!hasMorePages"
                class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sonraki
              </button>
            </div>
            <div
              class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between"
            >
              <div>
                <p class="text-sm text-gray-700">
                  <span class="font-medium">{{
                    filteredNotifications.length
                  }}</span>
                  bildirimden
                  <span class="font-medium">{{
                    (page - 1) * perPage + 1
                  }}</span>
                  -
                  <span class="font-medium">{{
                    Math.min(page * perPage, filteredNotifications.length)
                  }}</span>
                  arası gösteriliyor
                </p>
              </div>
              <div>
                <nav
                  class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    @click="page > 1 ? page-- : null"
                    :disabled="page <= 1"
                    class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span class="sr-only">Previous</span>
                    <svg
                      class="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </button>
                  <span
                    class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                  >
                    {{ page }}
                  </span>
                  <button
                    @click="page++"
                    :disabled="!hasMorePages"
                    class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span class="sr-only">Next</span>
                    <svg
                      class="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>

        <!-- Yeni Bildirim Oluşturma -->
        <div v-if="activeTab === 'create'" class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
            Yeni Bildirim Oluştur
          </h3>
          <form @submit.prevent="createNotification">
            <div class="space-y-6">
              <div>
                <label
                  for="title"
                  class="block text-sm font-medium text-gray-700"
                  >Başlık</label
                >
                <div class="mt-1">
                  <input
                    type="text"
                    id="title"
                    v-model="newNotification.title"
                    class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  for="message"
                  class="block text-sm font-medium text-gray-700"
                  >Mesaj</label
                >
                <div class="mt-1">
                  <textarea
                    id="message"
                    v-model="newNotification.message"
                    rows="4"
                    class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                  ></textarea>
                </div>
              </div>

              <div>
                <label
                  for="type"
                  class="block text-sm font-medium text-gray-700"
                  >Bildirim Tipi</label
                >
                <select
                  id="type"
                  v-model="newNotification.type"
                  class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="normal">Normal</option>
                  <option value="campaign">Kampanya</option>
                  <option value="welcome">Hoşgeldin</option>
                </select>
              </div>

              <div>
                <label
                  for="target"
                  class="block text-sm font-medium text-gray-700"
                  >Hedef Kullanıcılar</label
                >
                <select
                  id="target"
                  v-model="newNotification.target"
                  class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="all">Tüm Kullanıcılar</option>
                  <option value="single">Tek Kullanıcı</option>
                </select>
              </div>

              <div v-if="newNotification.target === 'single'">
                <label
                  for="userId"
                  class="block text-sm font-medium text-gray-700"
                  >Kullanıcı ID</label
                >
                <div class="mt-1">
                  <input
                    type="text"
                    id="userId"
                    v-model="newNotification.userId"
                    class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <!-- Hedef Kitle Seçimi -->
              <div class="mb-3">
                <label class="form-label">Hedef Kitle</label>
                <select
                  v-model="newNotification.targetAudience"
                  class="form-select"
                >
                  <option value="all">
                    Tüm Kullanıcılar (Giriş Yapmış ve Yapmamış)
                  </option>
                  <option value="authenticated">
                    Sadece Giriş Yapmış Kullanıcılar
                  </option>
                  <option value="unauthenticated">
                    Sadece Giriş Yapmamış Kullanıcılar
                  </option>
                </select>
                <small class="form-text text-muted">
                  Bildirimin görüntüleneceği hedef kitleyi seçin.
                  <template
                    v-if="
                      newNotification.type === 'campaign' &&
                      newNotification.displayMethod === 'banner'
                    "
                  >
                    <br />
                    <strong>Not:</strong> Banner tipindeki kampanya bildirimleri
                    seçilen hedef kitleye göre görüntülenecektir.
                  </template>
                </small>
              </div>

              <!-- Hedef Kitle Bilgi Kutusu -->
              <div
                :class="[
                  'border-l-4 p-4 mt-2',
                  newNotification.targetAudience === 'all'
                    ? 'bg-blue-50 border-blue-400'
                    : newNotification.targetAudience === 'authenticated'
                    ? 'bg-green-50 border-green-400'
                    : 'bg-yellow-50 border-yellow-400',
                ]"
              >
                <div class="flex">
                  <div class="flex-shrink-0">
                    <svg
                      class="h-5 w-5"
                      :class="[
                        newNotification.targetAudience === 'all'
                          ? 'text-blue-400'
                          : newNotification.targetAudience === 'authenticated'
                          ? 'text-green-400'
                          : 'text-yellow-400',
                      ]"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <p
                      class="text-sm"
                      :class="[
                        newNotification.targetAudience === 'all'
                          ? 'text-blue-700'
                          : newNotification.targetAudience === 'authenticated'
                          ? 'text-green-700'
                          : 'text-yellow-700',
                      ]"
                    >
                      <span v-if="newNotification.targetAudience === 'all'">
                        Bu bildirim
                        <strong>tüm kullanıcılara</strong> gösterilecek.
                      </span>
                      <span
                        v-else-if="
                          newNotification.targetAudience === 'authenticated'
                        "
                      >
                        Bu bildirim
                        <strong>sadece giriş yapmış kullanıcılara</strong>
                        gösterilecek.
                      </span>
                      <span v-else>
                        Bu bildirim
                        <strong>sadece giriş yapmamış kullanıcılara</strong>
                        gösterilecek.
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <!-- Bildirim Görüntüleme Metodu -->
              <div>
                <label
                  for="displayMethod"
                  class="block text-sm font-medium text-gray-700"
                  >Görüntüleme Yöntemi</label
                >
                <select
                  id="displayMethod"
                  v-model="newNotification.displayMethod"
                  class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="modal">Modal (Pencere)</option>
                  <option value="toast">Toast (Bildirim)</option>
                  <option value="banner">Banner (Üst Bilgi Çubuğu)</option>
                  <option value="alert">Alert (Uyarı)</option>
                  <option value="silent">Silent (Sessiz)</option>
                </select>
              </div>

              <!-- Bildirim Görsel ve Link URL -->
              <div>
                <label
                  for="imageUrl"
                  class="block text-sm font-medium text-gray-700"
                  >Görsel URL (Opsiyonel)</label
                >
                <div class="mt-1">
                  <input
                    type="text"
                    id="imageUrl"
                    v-model="newNotification.imageUrl"
                    class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div>
                <label
                  for="linkUrl"
                  class="block text-sm font-medium text-gray-700"
                  >Link URL (Opsiyonel)</label
                >
                <div class="mt-1">
                  <input
                    type="text"
                    id="linkUrl"
                    v-model="newNotification.linkUrl"
                    class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="https://example.com/page"
                  />
                </div>
              </div>

              <!-- Gelişmiş Seçenekler Açılır Paneli -->
              <div class="border border-gray-200 rounded-md mt-4">
                <div
                  class="px-4 py-3 bg-gray-50 rounded-t-md border-b border-gray-200"
                >
                  <h3 class="text-sm font-medium text-gray-700">
                    Gelişmiş Görüntüleme Seçenekleri
                  </h3>
                </div>
                <div class="p-4 space-y-4">
                  <!-- Görüntüleme Pozisyonu -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700"
                      >Görüntüleme Pozisyonu</label
                    >
                    <select
                      v-model="newNotification.displayOptions.position"
                      class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option value="center">Merkez</option>
                      <option value="top">Üst</option>
                      <option value="bottom">Alt</option>
                      <option value="top-left">Üst Sol</option>
                      <option value="top-right">Üst Sağ</option>
                      <option value="bottom-left">Alt Sol</option>
                      <option value="bottom-right">Alt Sağ</option>
                    </select>
                  </div>

                  <!-- Stil Seçenekleri -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700"
                      >Stil</label
                    >
                    <select
                      v-model="newNotification.displayOptions.style"
                      class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option value="primary">Birincil</option>
                      <option value="success">Başarılı</option>
                      <option value="warning">Uyarı</option>
                      <option value="danger">Tehlike</option>
                      <option value="info">Bilgi</option>
                    </select>
                  </div>

                  <!-- Otomatik Kapanma Süresi -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700"
                      >Otomatik Kapanma Süresi (ms)</label
                    >
                    <input
                      type="number"
                      v-model.number="
                        newNotification.displayOptions.autoHideAfter
                      "
                      class="mt-1 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
                      placeholder="0 = otomatik kapanma yok"
                    />
                    <p class="mt-1 text-xs text-gray-500">
                      0 = otomatik kapanma yok, 5000 = 5 saniye
                    </p>
                  </div>

                  <!-- Görüntüleme Seçenekleri Checkboxlar -->
                  <div class="flex flex-col gap-2">
                    <div class="flex items-center">
                      <input
                        type="checkbox"
                        id="showOnLogin"
                        v-model="newNotification.displayOptions.showOnLogin"
                        class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label
                        for="showOnLogin"
                        class="ml-2 block text-sm text-gray-700"
                      >
                        Giriş yapıldığında göster
                      </label>
                    </div>

                    <div class="flex items-center">
                      <input
                        type="checkbox"
                        id="showOnce"
                        v-model="newNotification.displayOptions.showOnce"
                        class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label
                        for="showOnce"
                        class="ml-2 block text-sm text-gray-700"
                      >
                        Sadece bir kez göster
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <!-- E-posta Gönderim Seçeneği -->
              <div class="flex items-center mt-4">
                <input
                  type="checkbox"
                  id="sendEmail"
                  v-model="newNotification.sendEmail"
                  class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label for="sendEmail" class="ml-2 block text-sm text-gray-700">
                  E-posta olarak da gönder
                </label>
              </div>

              <div class="bg-gray-50 rounded-md p-4 mt-3">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <svg
                      class="h-5 w-5 text-blue-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </div>
                  <div class="ml-3 flex-1 md:flex md:justify-between">
                    <p class="text-sm text-blue-700">
                      Bildirim gönderildiğinde kullanıcılar hem uygulama içinde
                      hem de e-posta olarak bilgilendirilecektir.
                    </p>
                  </div>
                </div>
              </div>

              <div class="flex justify-end">
                <button
                  type="submit"
                  class="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Bildirim Gönder
                </button>
              </div>
            </div>
          </form>
        </div>

        <!-- Kampanya Bildirimleri -->
        <div v-if="activeTab === 'campaign'" class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
            Kampanya Bildirimleri
          </h3>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="campaign in campaignNotifications"
              :key="campaign._id"
              class="bg-white overflow-hidden shadow rounded-lg border border-gray-200"
            >
              <div
                class="px-4 py-5 sm:px-6 bg-gradient-to-r from-purple-500 to-indigo-600"
              >
                <h3 class="text-lg leading-6 font-medium text-white">
                  {{ campaign.title }}
                </h3>
                <p class="mt-1 max-w-2xl text-sm text-indigo-100">
                  {{ formatDate(campaign.createdAt) }}
                </p>
              </div>
              <div class="border-t border-gray-200 px-4 py-5 sm:p-6">
                <p class="text-gray-700">{{ campaign.message }}</p>

                <div class="mt-4 flex justify-between items-center">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                  >
                    Kampanya
                  </span>
                  <div>
                    <button
                      @click="viewNotification(campaign)"
                      class="text-indigo-600 hover:text-indigo-900 text-sm font-medium mr-2"
                    >
                      Detay
                    </button>
                    <button
                      @click="deleteNotification(campaign._id)"
                      class="text-red-600 hover:text-red-900 text-sm font-medium"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div
              v-if="campaignNotifications.length === 0"
              class="col-span-3 text-center py-10 text-gray-500"
            >
              Aktif kampanya bildirimi bulunamadı.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bildirim Detay Modalı -->
    <div
      v-if="showModal"
      class="fixed z-10 inset-0 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
      >
        <div
          class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
          @click="showModal = false"
        ></div>

        <span
          class="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
          >&#8203;</span
        >
        <div
          class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
        >
          <div>
            <div
              class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100"
            >
              <svg
                class="h-6 w-6 text-indigo-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            <div class="mt-3 text-center sm:mt-5">
              <h3
                class="text-lg leading-6 font-medium text-gray-900"
                id="modal-title"
              >
                {{ selectedNotification?.title }}
              </h3>
              <div class="mt-2">
                <p class="text-sm text-gray-500">
                  {{ selectedNotification?.message }}
                </p>
              </div>
              <div class="mt-4 flex justify-center">
                <span
                  :class="[
                    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                    selectedNotification?.type === 'campaign'
                      ? 'bg-green-100 text-green-800'
                      : selectedNotification?.type === 'welcome'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800',
                  ]"
                >
                  {{
                    selectedNotification?.type === "campaign"
                      ? "Kampanya"
                      : selectedNotification?.type === "welcome"
                      ? "Hoşgeldin"
                      : "Normal"
                  }}
                </span>
              </div>
              <div class="mt-2 text-sm text-gray-500">
                {{ formatDate(selectedNotification?.createdAt) }}
              </div>
            </div>
          </div>
          <div class="mt-5 sm:mt-6">
            <button
              type="button"
              class="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
              @click="showModal = false"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from "vue";
import { useNotificationStore } from "@/stores/notificationStore";

export default {
  name: "NotificationAdminView",

  setup() {
    const notificationStore = useNotificationStore();
    const activeTab = ref("list");
    const page = ref(1);
    const perPage = ref(10);
    const filterStatus = ref("all");
    const filterType = ref("all");
    const searchTerm = ref("");
    const showModal = ref(false);
    const selectedNotification = ref(null);

    const newNotification = ref({
      title: "",
      message: "",
      type: "normal",
      target: "all",
      userId: "",
      imageUrl: "",
      linkUrl: "",
      displayMethod: "modal",
      targetAudience: "all",
      displayOptions: {
        showOnLogin: true,
        showOnce: true,
        autoHideAfter: 0,
        position: "center",
        style: "primary",
      },
      sendEmail: false,
    });

    // Store'daki bildirim verilerini al
    const notifications = computed(() => {
      return notificationStore.adminNotifications || [];
    });

    // Filtreler
    const filteredNotifications = computed(() => {
      let filtered = [...notifications.value];

      // Durum filtresi
      if (filterStatus.value !== "all") {
        const isRead = filterStatus.value === "read";
        filtered = filtered.filter((n) => n.isRead === isRead);
      }

      // Tip filtresi
      if (filterType.value !== "all") {
        filtered = filtered.filter((n) => n.type === filterType.value);
      }

      // Arama filtresi
      if (searchTerm.value) {
        const term = searchTerm.value.toLowerCase();
        filtered = filtered.filter(
          (n) =>
            n.title.toLowerCase().includes(term) ||
            n.message.toLowerCase().includes(term) ||
            n.user?.username.toLowerCase().includes(term)
        );
      }

      return filtered;
    });

    // Kampanya bildirimleri
    const campaignNotifications = computed(() => {
      return notifications.value.filter((n) => n.type === "campaign");
    });

    // İstatistikler
    const totalNotifications = computed(() => notifications.value.length);
    const activeCampaigns = computed(() => campaignNotifications.value.length);
    const pendingNotifications = computed(
      () => notifications.value.filter((n) => !n.isRead).length
    );

    // Sayfalama için daha fazla sayfa var mı?
    const hasMorePages = computed(() => {
      return notificationStore.pagination?.hasNextPage || false;
    });

    // Verileri çek
    onMounted(async () => {
      await notificationStore.fetchAllNotifications();
    });

    // Tarih formatla
    const formatDate = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("tr-TR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    };

    // Bildirim detayını görüntüle
    const viewNotification = (notification) => {
      selectedNotification.value = notification;
      showModal.value = true;
    };

    // Bildirim sil
    const deleteNotification = async (notificationId) => {
      if (confirm("Bu bildirimi silmek istediğinize emin misiniz?")) {
        try {
          await notificationStore.deleteNotification(notificationId);
          notificationStore.fetchAllNotifications();
        } catch (error) {
          console.error("Bildirim silinirken bir hata oluştu:", error);
        }
      }
    };

    // Yeni bildirim oluştur
    const createNotification = async () => {
      try {
        // Temel bildirim verisini hazırla
        const notificationData = {
          title: newNotification.value.title,
          message: newNotification.value.message,
          type: newNotification.value.type,
          targetAudience: newNotification.value.targetAudience,
          // Opsiyonel alanları koşullu olarak ekle
          ...(newNotification.value.imageUrl && {
            imageUrl: newNotification.value.imageUrl,
          }),
          ...(newNotification.value.linkUrl && {
            linkUrl: newNotification.value.linkUrl,
          }),
          displayMethod: newNotification.value.displayMethod,
          displayOptions: newNotification.value.displayOptions,
          sendEmail: newNotification.value.sendEmail,
        };

        // Backend'in beklediği formata göre düzenle
        if (newNotification.value.target === "all") {
          notificationData.sendToAll = true;
        } else if (
          newNotification.value.target === "single" &&
          newNotification.value.userId
        ) {
          notificationData.userIds = [newNotification.value.userId];
        } else {
          alert(
            "Lütfen hedef kullanıcıları belirtin veya tüm kullanıcılara göndermeyi seçin"
          );
          return;
        }

        // API detaylarını görmek için konsola yazdır
        console.log("Gönderilen veri:", notificationData);

        await notificationStore.createNotification(notificationData);

        // Form temizle
        newNotification.value = {
          title: "",
          message: "",
          type: "normal",
          target: "all",
          userId: "",
          imageUrl: "",
          linkUrl: "",
          displayMethod: "modal",
          targetAudience: "all",
          displayOptions: {
            showOnLogin: true,
            showOnce: true,
            autoHideAfter: 0,
            position: "center",
            style: "primary",
          },
          sendEmail: false,
        };

        // Bildirim listesini güncelle
        notificationStore.fetchAllNotifications();

        // Sekmeyi bildirimler listesine çevir
        activeTab.value = "list";

        alert("Bildirim başarıyla oluşturuldu!");
      } catch (error) {
        console.error("Bildirim oluşturulurken bir hata oluştu:", error);
        alert("Bildirim oluşturulurken bir hata oluştu: " + error.message);
      }
    };

    // Tip ve görüntüleme metodu değiştiğinde kontrolü
    watch(
      [
        () => newNotification.value.type,
        () => newNotification.value.displayMethod,
      ],
      ([newType, newDisplayMethod]) => {
        // Kampanya bildirimi ve banner görüntüleme metodu seçildiğinde uyarı
        if (newType === "campaign" && newDisplayMethod === "banner") {
          console.log(
            `Banner tipindeki kampanya bildirimleri hedef kitleye göre görüntülenecek: ${newNotification.value.targetAudience}`
          );
        }
      }
    );

    return {
      activeTab,
      page,
      perPage,
      filterStatus,
      filterType,
      searchTerm,
      showModal,
      selectedNotification,
      newNotification,
      notifications,
      filteredNotifications,
      campaignNotifications,
      totalNotifications,
      activeCampaigns,
      pendingNotifications,
      hasMorePages,
      formatDate,
      viewNotification,
      deleteNotification,
      createNotification,
    };
  },
};
</script> 