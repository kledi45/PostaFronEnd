<template>
    <div>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="Shto qytet të ri" icon="pi pi-plus" severity="secondary" class="mr-2"
                        @click="openNew" />

                </template>

                <template #end>
                    <Button label="Export" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" />
                </template>
            </Toolbar>

            <DataTable ref="dt" v-model:selection="selectedProducts" :value="products" dataKey="id" :paginator="true"
                :rows="10" :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Duke shfaqur {first} deri {last} nga {totalRecords} qytete">
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Lista e qyteteve</h4>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Kërko..." />
                        </IconField>
                    </div>
                </template>

                <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
                <Column field="name" header="Emri" sortable style="min-width: 16rem"></Column>
                <Column field="country" header="Shteti" sortable style="min-width: 16rem"></Column>
                <Column :exportable="false" style="min-width: 12rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2"
                            @click="editProduct(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger"
                            @click="confirmDeleteProduct(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="productDialog" :style="{ width: '450px' }" header="Detajet e userit" :modal="true">
            <div class="flex flex-col gap-6">
                <div class="user-form">
                    <div>
                        <label for="name" class="block font-bold mb-3">Emri</label>
                        <InputText id="name" v-model.trim="product.name" required="true" autofocus
                            :invalid="submitted && !product.name" fluid />
                        <small v-if="submitted && !product.name" class="text-red-500">Emri është i
                            domësdoshëm.</small>
                    </div>
                    <div>
                        <label for="country" class="block font-bold mb-3">Shteti</label>
                        <Select id="country" v-model="product.idCountry" :options="countries" optionLabel="name"
                            optionValue="id" placeholder="Zgjedh një shtet" required="true" fluid></Select>
                        <small v-if="submitted && !product.idCountry" class="text-red-500">Shteti
                            është i
                            domësdoshëm.</small>
                    </div>
                </div>
            </div>

            <template #footer>
                <Button label="Anulo" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Ruaj" icon="pi pi-check" @click="saveProduct" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteProductDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="product">Dëshironi të fshini qytetin: <b>{{ product.name }}</b>?</span>
            </div>
            <template #footer>
                <Button label="Jo" icon="pi pi-times" text @click="deleteProductDialog = false" />
                <Button label="Po" icon="pi pi-check" @click="deleteProduct(product.id)" />
            </template>
        </Dialog>

    </div>
</template>



<script setup>
import { ApiResponse } from '@/service/ApiResponse';
import ApiService from '@/service/ApiService';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
onMounted(() => {
    getCities();
    getCountries();
});

async function getCities() {
    const response = await ApiService.get("Cities/GetCities");
    const citiesList = new ApiResponse(response.data.statusCode, response.data.result, '');
    products.value = citiesList.result;
}

async function getCountries() {
    const response = await ApiService.get("Countries/getCountries");
    const countriesList = new ApiResponse(response.data.statusCode, response.data.result, '');
    console.log(countriesList.result);
    countries.value = countriesList.result;
}


const toast = useToast();
const dt = ref();
const products = ref();
const productDialog = ref(false);
const deleteProductDialog = ref(false);
const countries = ref({});
const product = ref({});

const selectedProducts = ref();
let cityId = 0;
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);

function openNew() {
    product.value = {};
    submitted.value = false;
    productDialog.value = true;
}

function hideDialog() {
    productDialog.value = false;
    submitted.value = false;
    cityId = 0;
}


async function saveProduct() {
    submitted.value = true;
    if (!product.value.name || !product.value.idCountry) {
        return;
    }

    const data = {
        Id: cityId,
        Name: product.value.name,
        IDCountry: parseInt(product.value.idCountry)
    };
    const response = await ApiService.post(cityId == 0 ? "Cities/CreateCity" : "Cities/EditCity", data);
    const apiResponse = new ApiResponse(response.data.statusCode, response.data.result, '');
    if (apiResponse.statusCode == 0)
        toast.add({ severity: 'success', summary: 'Sukses', detail: cityId == 0 ? 'Qyteti u shtua me sukses' : "Qyteti u përditësua me sukses", life: 3000 });
    else
        toast.add({ severity: 'warn', summary: 'Gabim', detail: 'Një gabim ka ndodhur!', life: 3000 });

    productDialog.value = false;
    submitted.value = false;
    cityId = 0;
    getCities();
}

function editProduct(prod) {
    product.value = { ...prod };
    productDialog.value = true;
    cityId = product.value.id;
}


function confirmDeleteProduct(prod) {
    product.value = prod;
    deleteProductDialog.value = true;
}

async function deleteProduct(id) {
    let data = {
        Id: id
    }
    const response = await ApiService.post("Cities/DeleteCity", data);
    const apiResponse = new ApiResponse(response.data.statusCode, response.data.result, '');
    if (apiResponse.statusCode == 0)
        toast.add({ severity: 'success', summary: 'Sukses', detail: 'Roli është fshirë me sukses', life: 3000 });
    else
        toast.add({ severity: 'warn', summary: 'Gabim', detail: 'Një gabim ka ndodhur!', life: 3000 });

    deleteProductDialog.value = false;
    getCities();
}


function exportCSV() {
    dt.value.exportCSV();
}

</script>

<style>
.user-form label {
    margin-top: 10px;
}
</style>