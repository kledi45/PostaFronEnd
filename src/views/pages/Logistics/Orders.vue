<template>
    <div>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="Shto dërgesë të re" icon="pi pi-plus" severity="secondary" class="mr-2"
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
                currentPageReportTemplate="Duke shfaqur {first} deri {last} nga {totalRecords} dërgesa">
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Lista e dërgesave</h4>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Kërko..." />
                        </IconField>
                    </div>
                </template>

                <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
                <Column field="client" header="Klienti" sortable style="min-width: 16rem"></Column>
                <Column field="receiver" header="Pranuesi" sortable style="min-width: 16rem"></Column>
                <Column field="address" header="Adresa" sortable style="min-width: 16rem"></Column>
                <Column field="phoneNumber" header="Numri i telefonit" sortable style="min-width: 16rem"></Column>
                <Column field="country" header="Shteti" sortable style="min-width: 16rem"></Column>
                <Column field="city" header="Qyteti" sortable style="min-width: 16rem"></Column>
                <Column field="canBeOpened" header="Mund të hapet" sortable style="min-width: 12rem">
                    <template #body="slotProps">
                        {{ getStatusLabel(slotProps.data.canBeOpened) }}
                    </template>
                </Column>
                <Column field="itemDescription" header="Përshkrimi i artikullit" sortable style="min-width: 16rem">
                </Column>
                <Column field="extraItemDescription" header="Përshkrimi ekstra i artikullit" sortable
                    style="min-width: 16rem">
                </Column>
                <Column field="productPrice" header="Cmimi i produktit" sortable style="min-width: 16rem"></Column>
                <Column field="serviceCost" header="Kosto e shërbimit" sortable style="min-width: 16rem"></Column>
                <Column field="total" header="Totali" sortable style="min-width: 16rem"></Column>


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

        <Dialog v-model:visible="productDialog" :style="{ width: '450px' }" header="Product Details" :modal="true">
            <div class="flex flex-col gap-6">
                <div class="user-form">
                    <div>
                        <label for="clients" class="block font-bold mb-3">Klienti</label>
                        <Select id="clients" v-model="product.idUser" :options="clients" optionLabel="fullName"
                            optionValue="id" placeholder="Zgjedh klientin" required="true" fluid></Select>
                        <small v-if="submitted && !product.idUser" class="text-red-500">Klienti
                            është i
                            domësdoshëm.</small>
                    </div>
                    <div>
                        <label for="receiver" class="block font-bold mb-3">Pranuesi</label>
                        <InputText id="receiver" v-model.trim="product.receiver" required="true" autofocus
                            :invalid="submitted && !product.receiver" fluid />
                        <small v-if="submitted && !product.receiver" class="text-red-500">Pranuesi është i
                            domësdoshëm.</small>
                    </div>

                    <div>
                        <label for="phoneNumber" class="block font-bold mb-3">Numri i telefoni</label>
                        <InputText id="phoneNumber" v-model.trim="product.phoneNumber" required="true" autofocus
                            :invalid="submitted && !product.phoneNumber" fluid />
                        <small v-if="submitted && !product.phoneNumber" class="text-red-500">Numri i telefonit është i
                            domësdoshëm.</small>
                    </div>
                    <div>
                        <label for="country" class="block font-bold mb-3">Shteti</label>
                        <Select id="country" v-model="product.idCountry" :options="countries" optionLabel="name"
                            optionValue="id" placeholder="Zgjedh shtetin" required="true" fluid
                            @change="getCities(product.idCountry)"></Select>
                        <small v-if="submitted && !product.idCountry" class="text-red-500">Shteti është
                            i
                            domësdoshëm.</small>
                    </div>
                    <div>
                        <label for="idCity" class="block font-bold mb-3">Qyteti</label>
                        <Select id="idCity" v-model="product.idCity" :options="cities" optionLabel="name"
                            optionValue="id" placeholder="Zgjedh qytetin" required="true" fluid></Select>
                        <small v-if="submitted && !product.idCity" class="text-red-500">
                            Qyteti është i domësdoshëm.
                        </small>
                    </div>
                    <div>
                        <label for="address" class="block font-bold mb-3">Adresa</label>
                        <InputText id="address" v-model.trim="product.address" required="true" autofocus
                            :invalid="submitted && !product.address" fluid />
                        <small v-if="submitted && !product.address" class="text-red-500">Adresa
                            është e
                            domësdoshme.</small>
                    </div>
                    <div>
                        <label for="canBeOpened" class="block font-bold mb-3">Mund të hapet</label>
                        <input type="checkbox" id="canBeOpened" v-model="product.canBeOpened" autofocus />
                    </div>
                    <div>
                        <label for="itemDescription" class="block font-bold mb-3">Përshkrimi i artikullit</label>
                        <Textarea type="text" id="itemDescription" v-model.trim="product.itemDescription"
                            required="true" autofocus :invalid="submitted && !product.itemDescription" fluid />
                        <small v-if="submitted && !product.itemDescription" class="text-red-500">Përshkrimi i artikullit
                            është i
                            domësdoshëm.</small>
                    </div>
                    <div>
                        <label for="extraItemDescription" class="block font-bold mb-3">Përshkrimi ekstra i
                            artikullit</label>
                        <Textarea type="text" id="extraItemDescription" v-model.trim="product.extraItemDescription"
                            required="false" autofocus :invalid="submitted && !product.extraItemDescription" fluid />
                    </div>
                    <div>
                        <label for="productPrice" class="block font-bold mb-3">Cmimi i artikullit</label>
                        <InputText type="number" id="productPrice" v-model.trim="product.productPrice" required="false"
                            autofocus :invalid="submitted && !product.productPrice" fluid />
                        <small v-if="submitted && !product.productPrice" class="text-red-500">Cmimi i artikullit
                            është i
                            domësdoshëm.</small>
                    </div>
                    <div>
                        <label for="serviceCost" class="block font-bold mb-3">Cmimi i shërbimit</label>
                        <InputText type="number" id="serviceCost" v-model.trim="product.serviceCost" required="false"
                            autofocus :invalid="submitted && !product.serviceCost" fluid />
                        <small v-if="submitted && !product.serviceCost" class="text-red-500">Cmimi i shërbimit
                            është i
                            domësdoshëm.</small>
                    </div>
                    <div>
                        <label for="total" class="block font-bold mb-3">Cmimi i shërbimit</label>
                        <InputText type="number" id="total" v-model.trim="product.total" required="false" autofocus
                            :invalid="submitted && !product.total" fluid />
                        <small v-if="submitted && !product.total" class="text-red-500">Totali
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
    getCountries();
    getRoles();
    getClients();
    getShipments();
});

async function getShipments() {
    const response = await ApiService.get("Shipments/getShipments");
    const shipmentsList = new ApiResponse(response.data.statusCode, response.data.result, '');
    products.value = shipmentsList.result;
    debugger
}

async function getClients() {
    const response = await ApiService.get("Shipments/getClients");
    const clientsList = new ApiResponse(response.data.statusCode, response.data.result, '');
    clients.value = clientsList.result;
}

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

async function getCities(idCountry) {
    const response = await ApiService.get(`Shipments/getCitiesByCountry?idCountry=${idCountry}`);
    const citiesList = new ApiResponse(response.data.statusCode, response.data.result, '');
    cities.value = citiesList.result;
}
async function getRoles() {
    const response = await ApiService.get("Roles/GetRoles");
    const rolesList = new ApiResponse(response.data.statusCode, response.data.result, '');
    roles.value = rolesList.result;
}



const toast = useToast();
const dt = ref();
const products = ref();
const clients = ref();

const productDialog = ref(false);
const deleteProductDialog = ref(false);
const countries = ref({});
const product = ref({});
const roles = ref({});
const cities = ref({});


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

function getStatusLabel(canBeOpened) {
    return canBeOpened ? 'Po' : "Jo";
}

async function saveProduct() {
    submitted.value = true;
    if (!product.value.idUser ||
        !product.value.receiver ||
        !product.value.idCountry ||
        !product.value.idCity ||
        !product.value.address ||
        !product.value.itemDescription ||
        !product.value.productPrice ||
        !product.value.serviceCost ||
        !product.value.total ||
        !product.value.phoneNumber) {
        return;
    }

    const data = {
        IdUser: product.value.idUser,
        Receiver: product.value.receiver,
        IdCountry: product.value.idCountry,
        IdCity: product.value.idCity,
        Address: product.value.address,
        CanBeOpened: product.value.canBeOpened,
        ItemDescription: product.value.itemDescription,
        ExtraItemDescription: product.value.extraItemDescription,
        ProductPrice: parseFloat(product.value.productPrice) || 0,
        ServiceCost: parseFloat(product.value.serviceCost) || 0,
        Total: parseFloat(product.value.total) || 0,
        PhoneNumber: product.value.phoneNumber
    };

    const response = await ApiService.post(userId == 0 ? "Shipments/CreateShipment" : "Shipments/EditShipment", data);
    const apiResponse = new ApiResponse(response.data.statusCode, response.data.result, '');
    if (apiResponse.statusCode == 0)
        toast.add({ severity: 'success', summary: 'Sukses', detail: userId == 0 ? 'Përdoruesi u shtua me sukses' : "Përdoruesi u përditësua me sukses", life: 3000 });
    else
        toast.add({ severity: 'warn', summary: 'Gabim', detail: 'Një gabim ka ndodhur!', life: 3000 });

    productDialog.value = false;
    submitted.value = false;
    userId = 0;
    getShipments();
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
    const response = await ApiService.post("Roles/DeleteRole", data);
    const apiResponse = new ApiResponse(response.data.statusCode, response.data.result, '');
    if (apiResponse.statusCode == 0)
        toast.add({ severity: 'success', summary: 'Sukses', detail: 'Roli është fshirë me sukses', life: 3000 });
    else
        toast.add({ severity: 'warn', summary: 'Gabim', detail: 'Një gabim ka ndodhur!', life: 3000 });

    deleteProductDialog.value = false;
    getShipments();
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