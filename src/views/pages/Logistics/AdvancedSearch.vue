<template>
    <Fluid>

        <div class="flex mt-8">
            <div class="card flex flex-col gap-4 w-full">
                <div class="font-semibold text-xl">Kërkim i avancuar</div>
                <div class="flex flex-col md:flex-row gap-4">
                    <div class="flex flex-wrap gap-2 w-full">
                        <label for="shipmentID">ID</label>
                        <InputText id="shipmentID" v-model="filters.id" type="text" placeholder="ID e dërgeses" />
                    </div>
                    <div class="flex flex-wrap gap-2 w-full">
                        <label>Klienti
                        </label>
                        <AutoComplete style="width: 100%;" v-model="selectedAutoValue" :suggestions="autoFilteredValue"
                            optionLabel="fullName" placeholder="Kërko klientin" dropdown display="chip"
                            @complete="searchClients($event)" />

                    </div>
                    <div class="flex flex-wrap gap-2 w-full">
                        <label>Postieri
                        </label>
                        <AutoComplete style="width: 100%;" v-model="selectedPostmanAutoValue"
                            :suggestions="autoFilteredPostmanValue" optionLabel="fullName" placeholder="Kërko postierin"
                            dropdown display="chip" @complete="searchPostmans($event)" />

                    </div>
                </div>
                <div class="flex flex-col md:flex-row gap-4">
                    <div class="flex flex-wrap gap-2 w-full">
                        <label for="reciever">Pranuesi</label>
                        <InputText id="reciever" type="text" v-model="filters.receiver" placeholder="Pranuesi" />
                    </div>
                    <div class="flex flex-wrap gap-2 w-full">
                        <label for="state">Shteti</label>
                        <Select id="state" v-model="contry" :options="countries" optionLabel="name"
                            placeholder="Zgjedh shtetin" class="w-full" @change="getCities(contry.id)"></Select>
                    </div>
                    <div class="flex flex-wrap gap-2 w-full">
                        <label for="idCity" class="block font-bold mb-3">Qyteti</label>
                        <Select id="idCity" v-model="city" :options="cities" optionLabel="name" class="w-full"
                            optionValue="id" placeholder="Zgjedh qytetin" required="true" fluid></Select>
                        <small v-if="submitted && !city.id" class="text-red-500">
                            Qyteti është i domësdoshëm.
                        </small>
                    </div>
                </div>
                <div class="flex flex-col md:flex-row gap-4">
                    <div class="flex flex-wrap gap-2 w-full">
                        <label for="status">Statusi</label>
                        <Select id="status" v-model="status" :options="statuses" optionLabel="name"
                            placeholder="Zgjedh statusin" class="w-full"></Select>
                    </div>
                    <div class="flex flex-wrap gap-2 w-full">
                        <label for="status">Data prej</label>
                        <DatePicker class="w-full" :showIcon="true" :showButtonBar="true" v-model="calendarFromValue">
                        </DatePicker>
                    </div>
                    <div class="flex flex-wrap gap-2 w-full">
                        <label for="status">Data deri</label>
                        <DatePicker class="w-full" :showIcon="true" :showButtonBar="true" v-model="calendarToValue">
                        </DatePicker>
                    </div>
                </div>
                <Button label="Kërko" icon="pi pi-search" severity="primary" @click="advancedSearch()" />


            </div>
        </div>
        <DataTable ref="dt" v-model:selection="selectedProducts" v-if="products.length > 0" :value="products"
            dataKey="id" :paginator="true" :rows="10"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[5, 10, 25]"
            currentPageReportTemplate="Duke shfaqur {first} deri {last} nga {totalRecords} dërgesa">
            <template #header>
                <div class="flex flex-wrap gap-2 items-center justify-between">
                    <h4 class="m-0">Lista e dërgesave</h4>

                </div>

            </template>

            <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
            <Column field="client" header="Klienti" sortable style="min-width: 16rem"></Column>
            <Column field="receiver" header="Pranuesi" sortable style="min-width: 16rem"></Column>
            <Column field="address" header="Adresa" sortable style="min-width: 16rem"></Column>
            <Column field="phoneNumber" header="Numri i telefonit" sortable style="min-width: 16rem"></Column>
            <Column field="country" header="Shteti" sortable style="min-width: 16rem"></Column>
            <Column field="city" header="Qyteti" sortable style="min-width: 16rem"></Column>
            <Column field="canBeOpened" header="Mund të hapet" sortable style="min-width: 16rem"></Column>
            <Column field="itemDescription" header="Përshkrimi i artikullit" sortable style="min-width: 16rem">
            </Column>
            <Column field="extraItemDescription" header="Përshkrimi ekstra i artikullit" sortable
                style="min-width: 16rem">
            </Column>
            <Column field="productPrice" header="Cmimi i produktit" sortable style="min-width: 16rem"></Column>
            <Column field="serviceCost" header="Kosto e shërbimit" sortable style="min-width: 16rem"></Column>
            <Column field="total" header="Totali" sortable style="min-width: 16rem"></Column>
        </DataTable>
        <div v-else class="text-gray-500 text-center mt-4">Nuk u gjetën rezultate.</div>
    </Fluid>
</template>



<script setup>
import { ApiResponse } from '@/service/ApiResponse';
import ApiService from '@/service/ApiService';
import { FilterMatchMode } from '@primevue/core/api';
import { onMounted, ref } from 'vue';
const clients = ref({});
const postmans = ref({});
const postmanSeachList = ref({});
const autoFilteredValue = ref(null);
const products = ref({});
const autoFilteredPostmanValue = ref(null);
const selectedAutoValue = ref(null);
const fullnames = ref({});
const countries = ref({});
const contry = ref({});
const city = ref({});
const cities = ref({});
const statuses = ref({});
const calendarToValue = ref(null);
const calendarFromValue = ref(null);

const selectedProducts = ref();
const status = ref({});
const filtersa = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const filters = ref({
    id: '',
    receiver: ''
});
const selectedPostmanAutoValue = ref(null);

onMounted(() => {
    getClients();
    getPostmans();

    getCountries(); getStatuses();

});

async function advancedSearch() {
    const data = {
        IdShipment: filters.value.id,
        Receiver: filters.value.receiver,
        IdCountry: contry.value.id,
        IdCity: city.value,
        IdClient: selectedAutoValue.value.id,
        IdStatus: status.value.id,
        DateFrom: calendarFromValue.value,
        DateTO: calendarToValue.value,
        IdPostman: selectedPostmanAutoValue.value.id
    };
    debugger
    const response = await ApiService.post("Shipments/advancedSearch", data);
    const apiResponse = new ApiResponse(response.data.statusCode, response.data.result, '');
    debugger
    if (apiResponse.statusCode == 0) {

        products.value = apiResponse.result;
    }
    else
        toast.add({ severity: 'warn', summary: 'Gabim', detail: 'Një gabim ka ndodhur!', life: 3000 });

}



function searchClients(event) {
    setTimeout(() => {
        autoFilteredValue.value = [...fullnames.value];
        console.log(selectedAutoValue);
    }, 250);
}
function searchPostmans(event) {
    setTimeout(() => {
        autoFilteredPostmanValue.value = [...postmanSeachList.value];
        console.log(selectedPostmanAutoValue);
    }, 250);
}

async function getCountries() {
    const response = await ApiService.get("Countries/getCountries");
    const countriesList = new ApiResponse(response.data.statusCode, response.data.result, '');
    countries.value = countriesList.result;
}
async function getStatuses() {
    const response = await ApiService.get("Statuses/getStatuses");
    const statusList = new ApiResponse(response.data.statusCode, response.data.result, '');
    statuses.value = statusList.result;
}


async function getCities(idCountry) {
    debugger
    const response = await ApiService.get(`Shipments/getCitiesByCountry?idCountry=${idCountry}`);
    const citiesList = new ApiResponse(response.data.statusCode, response.data.result, '');
    cities.value = citiesList.result;
}
async function getClients() {
    const response = await ApiService.get("Shipments/getClients");
    const clientList = new ApiResponse(response.data.statusCode, response.data.result, '');
    clients.value = clientList.result;

    fullnames.value = clientList.result.map(client => ({
        id: client.id,
        fullName: client.fullName,
    }));

}
async function getPostmans() {
    const response = await ApiService.get("Shipments/getPostman");
    const postmanList = new ApiResponse(response.data.statusCode, response.data.result, '');
    postmans.value = postmanList.result;
    postmanSeachList.value = postmanList.result.map(client => ({
        id: client.id,
        fullName: client.fullName,
    }));

}
</script>

<style></style>