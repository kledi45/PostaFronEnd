<template>
    <div>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="Shto user të ri" icon="pi pi-plus" severity="secondary" class="mr-2"
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
                currentPageReportTemplate="Duke shfaqur {first} deri {last} nga {totalRecords} përdorues">
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Lista e përdouresve</h4>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Kërko..." />
                        </IconField>
                    </div>
                </template>

                <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
                <Column field="firstName" header="Emri" sortable style="min-width: 16rem"></Column>
                <Column field="lastName" header="Mbiemri" sortable style="min-width: 16rem"></Column>
                <Column field="userName" header="Emri i përdoruesit" sortable style="min-width: 16rem"></Column>
                <Column field="prefix" header="Prefix" sortable style="min-width: 16rem"></Column>
                <Column field="phoneNumber" header="Nr. telefonit" sortable style="min-width: 16rem"></Column>
                <Column field="country" header="Shteti" sortable style="min-width: 16rem"></Column>
                <Column field="role" header="Roli" sortable style="min-width: 16rem"></Column>

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
                        <label for="title" class="block font-bold mb-3">Emri</label>
                        <InputText id="firstName" v-model.trim="product.firstName" required="true" autofocus
                            :invalid="submitted && !product.firstName" fluid />
                        <small v-if="submitted && !product.firstName" class="text-red-500">Emri është i
                            domësdoshëm.</small>
                    </div>
                    <div>
                        <label for="lastName" class="block font-bold mb-3">Mbiemri</label>
                        <InputText id="lastName" v-model.trim="product.lastName" required="true" autofocus
                            :invalid="submitted && !product.lastName" fluid />
                        <small v-if="submitted && !product.lastName" class="text-red-500">Mbiemri është i
                            domësdoshëm.</small>
                    </div>
                    <div>
                        <label for="email" class="block font-bold mb-3">Email</label>
                        <InputText id="email" v-model.trim="product.email" required="true" autofocus
                            :invalid="submitted && !product.email" fluid />
                        <small v-if="submitted && !product.email" class="text-red-500">Email-i është i
                            domësdoshëm.</small>
                    </div>
                    <div>
                        <label for="userName" class="block font-bold mb-3">Emri i përdoruesit</label>
                        <InputText id="userName" v-model.trim="product.userName" required="true" autofocus
                            :invalid="submitted && !product.userName" fluid />
                        <small v-if="submitted && !product.userName" class="text-red-500">Emri i përdoruesit është
                            i
                            domësdoshëm.</small>
                    </div>
                    <div>
                        <label for="roles" class="block font-bold mb-3">Roli</label>
                        <Select id="roles" v-model="product.idRole" :options="roles" optionLabel="title"
                            optionValue="id" placeholder="Zgjedh rolin" required="true" fluid></Select>
                        <small v-if="submitted && !product.idRole" class="text-red-500">Roli
                            është i
                            domësdoshëm.</small>
                    </div>
                    <div>
                        <label for="password" class="block font-bold mb-3">Fjalëkalimi</label>
                        <InputText id="password" v-model.trim="product.password" required="true" autofocus
                            :invalid="submitted && !product.password" fluid />
                        <small v-if="submitted && !product.password" class="text-red-500">Fjalëkalimi i
                            përdoruesit
                            është i
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
                    <div>
                        <label for="prefix" class="block font-bold mb-3">Prefix</label>
                        <InputText type="number" id="prefix" v-model.trim="product.prefix" required="true" autofocus
                            :invalid="submitted && !product.prefix" fluid />
                        <small v-if="submitted && !product.prefix" class="text-red-500">Prefixi
                            është i
                            domësdoshëm.</small>
                    </div>
                    <div>
                        <label for="phoneNumber" class="block font-bold mb-3">Numri i telefonit</label>
                        <InputText type="number" id="phoneNumber" v-model.trim="product.phoneNumber" required="true"
                            autofocus :invalid="submitted && !product.phoneNumber" fluid />
                        <small v-if="submitted && !product.phoneNumber" class="text-red-500">Numri i telefonit
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
                <span v-if="product">Dëshironi të fshini përdouresin: <b>{{ product.title }}</b>?</span>
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
    getUsers();
    getCountries();
    getRoles();
});

async function getUsers() {
    const response = await ApiService.get("Users/getUsers");
    const usersList = new ApiResponse(response.data.statusCode, response.data.result, '');
    products.value = usersList.result;
}

async function getCountries() {
    const response = await ApiService.get("Countries/getCountries");
    const countriesList = new ApiResponse(response.data.statusCode, response.data.result, '');
    countries.value = countriesList.result;
}

async function getRoles() {
    const response = await ApiService.get("Roles/GetRoles");
    const rolesList = new ApiResponse(response.data.statusCode, response.data.result, '');
    roles.value = rolesList.result;
}
const toast = useToast();
const dt = ref();
const products = ref();
const productDialog = ref(false);
const deleteProductDialog = ref(false);
const deleteProductsDialog = ref(false);
const countries = ref({});
const product = ref({});
const roles = ref({});

const selectedProducts = ref();
let userId = 0;
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
    userId = 0;
}


async function saveProduct() {
    submitted.value = true;
    if (!product.value.firstName || !product.value.lastName || !product.value.userName || !product.value.password || !product.value.idCountry || !product.value.prefix || !product.value.phoneNumber || !product.value.email) {
        return;
    }

    const data = {
        Id: userId,
        FirstName: product.value.firstName,
        LastName: product.value.lastName,
        UserName: product.value.userName,
        Password: product.value.password,
        IdCountry: product.value.idCountry,
        Prefix: parseInt(product.value.prefix),
        PhoneNumber: parseInt(product.value.phoneNumber),
        Email: product.value.email,
        IdRole: product.value.idRole
    };
    const response = await ApiService.post(userId == 0 ? "Users/CreateUser" : "Users/EditUsers", data);
    const apiResponse = new ApiResponse(response.data.statusCode, response.data.result, '');
    if (apiResponse.statusCode == 0)
        toast.add({ severity: 'success', summary: 'Sukses', detail: userId == 0 ? 'Përdoruesi u shtua me sukses' : "Përdoruesi u përditësua me sukses", life: 3000 });
    else
        toast.add({ severity: 'warn', summary: 'Gabim', detail: 'Një gabim ka ndodhur!', life: 3000 });

    productDialog.value = false;
    submitted.value = false;
    userId = 0;
    getUsers();
}

function editProduct(prod) {
    product.value = { ...prod };
    productDialog.value = true;
    userId = product.value.id;
}


function confirmDeleteProduct(prod) {
    product.value = prod;
    deleteProductDialog.value = true;
}

async function deleteProduct(id) {
    let data = {
        Id: id
    }
    const response = await ApiService.post("Users/DeleteUser", data);
    const apiResponse = new ApiResponse(response.data.statusCode, response.data.result, '');
    if (apiResponse.statusCode == 0)
        toast.add({ severity: 'success', summary: 'Sukses', detail: 'Perdoruesi është fshirë me sukses', life: 3000 });
    else
        toast.add({ severity: 'warn', summary: 'Gabim', detail: 'Një gabim ka ndodhur!', life: 3000 });

    deleteProductDialog.value = false;
    getUsers();
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