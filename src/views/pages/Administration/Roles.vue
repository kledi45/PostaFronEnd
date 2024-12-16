<template>
    <div>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="Shto rol të ri" icon="pi pi-plus" severity="secondary" class="mr-2"
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
                            <InputText v-model="filters['global'].value" placeholder="Kërko..." />
                        </IconField>
                    </div>
                </template>

                <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
                <Column field="title" header="Titulli" sortable style="min-width: 16rem"></Column>
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
                    <label for="title" class="block font-bold mb-3">Titulli</label>
                    <InputText id="title" v-model.trim="product.title" required="true" autofocus
                        :invalid="submitted && !product.title" fluid />
                    <small v-if="submitted && !product.title" class="text-red-500">Titulli është i domësdoshëm.</small>
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
                <span v-if="product">Dëshironi të fshini rolin: <b>{{ product.title }}</b>?</span>
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
    getRoles();
});

async function getRoles() {
    const response = await ApiService.get("Roles/getRoles");
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
let roleId = 0;
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
    roleId = 0;
}

async function saveProduct() {
    submitted.value = true;
    const data = {
        Id: roleId,
        Title: product.value.title,
    };

    const response = await ApiService.post(roleId == 0 ? "Roles/CreateRole" : "Roles/EditRole", data);
    const apiResponse = new ApiResponse(response.data.statusCode, response.data.result, '');
    if (apiResponse.statusCode == 0)
        toast.add({ severity: 'success', summary: 'Sukses', detail: roleId == 0 ? 'Roli u shtua me sukses' : "Roli u përditësua me sukses", life: 3000 });
    else
        toast.add({ severity: 'warn', summary: 'Gabim', detail: 'Një gabim ka ndodhur!', life: 3000 });

    productDialog.value = false;
    submitted.value = false;
    roleId = 0;
    getRoles();
}

function editProduct(prod) {
    product.value = { ...prod };
    productDialog.value = true;
    roleId = product.value.id;
}


function confirmDeleteProduct(prod) {
    product.value = prod;
    deleteProductDialog.value = true;
}

async function deleteProduct(id) {
    let data = {
        Id: id
    }
    const response = await ApiService.post("Roles/DeleteRole", data);
    const apiResponse = new ApiResponse(response.data.statusCode, response.data.result, '');
    if (apiResponse.statusCode == 0)
        toast.add({ severity: 'success', summary: 'Sukses', detail: 'Roli është fshirë me sukses', life: 3000 });
    else
        toast.add({ severity: 'warn', summary: 'Gabim', detail: 'Një gabim ka ndodhur!', life: 3000 });

    deleteProductDialog.value = false;
    getRoles();
}


function exportCSV() {
    dt.value.exportCSV();
}

</script>