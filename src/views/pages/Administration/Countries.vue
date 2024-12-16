<template>
    <div>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="Shto shtet të ri" icon="pi pi-plus" severity="secondary" class="mr-2"
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
                currentPageReportTemplate="Duke shfaqur {first} deri {last} nga {totalRecords} shtete">
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Lista e shteteve</h4>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Search..." />
                        </IconField>
                    </div>
                </template>

                <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
                <Column field="name" header="Emri" sortable style="min-width: 16rem"></Column>

                <Column field="shippingPirce" header="Cmimi i transportit" sortable style="min-width: 8rem">
                    <template #body="slotProps">
                        {{ formatCurrency(slotProps.data.shippingPrice) }}
                    </template>
                </Column>
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

        <Dialog v-model:visible="productDialog" :style="{ width: '450px' }" header="Detajet e shtetit" :modal="true">
            <div class="flex flex-col gap-6">
                <div>
                    <label for="name" class="block font-bold mb-3">Emri</label>
                    <InputText id="name" v-model.trim="product.name" required="true" autofocus
                        :invalid="submitted && !product.name" fluid />
                    <small v-if="submitted && !product.name" class="text-red-500">Emri është i domësdoshëm.</small>
                </div>
                <div>
                    <label for="shippingPrice" class="block font-bold mb-3">Pagesa e transportit</label>
                    <InputText id="shippingPrice" v-model="product.shippingPrice" required="true" fluid />
                    <small v-if="submitted && !product.shippingPrice" class="text-red-500">Cmimi për transport është i
                        domësdoshëm</small>

                </div>
            </div>

            <template #footer>
                <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Save" icon="pi pi-check" @click="saveProduct" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteProductDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="product">Dëshironi të fshini shtetin: <b>{{ product.name }}</b>?</span>
            </div>
            <template #footer>
                <Button label="Jo" icon="pi pi-times" text @click="deleteProductDialog = false" />
                <Button label="Po" icon="pi pi-check" @click="deleteProduct(product.id)" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteProductsDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="product">Are you sure you want to delete the selected products?</span>
            </div>
            <template #footer>
                <Button label="Jo" icon="pi pi-times" text @click="deleteProductsDialog = false" />
                <Button label="Po" icon="pi pi-check" text @click="deleteSelectedProducts" />
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
    getCountries();
});

async function getCountries() {
    const response = await ApiService.get("Countries/GetCountries");
    const countriesList = new ApiResponse(response.data.statusCode, response.data.result, '');
    products.value = countriesList.result;
}
const toast = useToast();
const dt = ref();
const products = ref();
const productDialog = ref(false);
const deleteProductDialog = ref(false);
const deleteProductsDialog = ref(false);
const product = ref({});
const selectedProducts = ref();
let prodId = 0;
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);

function formatCurrency(value) {
    if (value) return value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
    return;
}

function openNew() {
    product.value = {};
    submitted.value = false;
    productDialog.value = true;
}

function hideDialog() {
    productDialog.value = false;
    submitted.value = false;
    prodId = 0;
}

async function saveProduct() {
    submitted.value = true;
    const data = {
        Id: prodId,
        Name: product.value.name,
        ShippingPrice: parseFloat(product.value.shippingPrice)
    };

    const response = await ApiService.post(prodId == 0 ? "Countries/CreateCountry" : "Countries/EditCountry", data);
    const apiResponse = new ApiResponse(response.data.statusCode, response.data.result, '');
    if (apiResponse.statusCode == 0)
        toast.add({ severity: 'success', summary: 'Sukses', detail: prodId == 0 ? 'Shteti u shtua me sukses' : "Shteti u përditësua me sukses", life: 3000 });
    else
        toast.add({ severity: 'warn', summary: 'Gabim', detail: 'Një gabim ka ndodhur!', life: 3000 });

    productDialog.value = false;
    submitted.value = false;
    prodId = 0;
    getCountries();
}

function editProduct(prod) {
    product.value = { ...prod };
    productDialog.value = true;
    console.log(product.value, 'ra')
    prodId = product.value.id;
}


function confirmDeleteProduct(prod) {
    product.value = prod;
    deleteProductDialog.value = true;
}

async function deleteProduct(id) {
    let data = {
        Id: id
    }
    const response = await ApiService.post("Countries/DeleteCountry", data);
    const apiResponse = new ApiResponse(response.data.statusCode, response.data.result, '');
    if (apiResponse.statusCode == 0)
        toast.add({ severity: 'success', summary: 'Sukses', detail: 'Shteti është fshirë me sukses', life: 3000 });
    else
        toast.add({ severity: 'warn', summary: 'Gabim', detail: 'Një gabim ka ndodhur!', life: 3000 });

    deleteProductDialog.value = false;
    getCountries();
}


function exportCSV() {
    dt.value.exportCSV();
}

function confirmDeleteSelected() {
    deleteProductsDialog.value = true;
}

function deleteSelectedProducts() {
    products.value = products.value.filter((val) => !selectedProducts.value.includes(val));
    deleteProductsDialog.value = false;
    selectedProducts.value = null;
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Products Deleted', life: 3000 });
}

</script>