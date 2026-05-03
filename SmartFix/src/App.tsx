import {BrowserRouter, Route, Routes} from "react-router-dom";
import {LoginPage} from "./pages/LoginPage.tsx";
import {RegisterPage} from "./pages/RegisterPage.tsx";
import {ManagerRequestsPage} from "./pages/ManagerRequestsPage.tsx";
import {ManagerServicesPage} from "./pages/ManagerServicesPage.tsx";
import {ManagerCreateServicePage} from "./pages/ManagerCreateServicePage.tsx";
import {ManagersServiceDetailsPage} from "./pages/ManagerServiceDetailsPage.tsx";
import {ManagerRequestDetailsPage} from "./pages/ManagerRequestDetailsPage.tsx";
import {ManagerDictionariesPage} from "./pages/ManagerDictionariesPage.tsx";
import {ManagerStatisticsPage} from "./pages/ManagerStatisticsPage.tsx";
import {ClientCatalogPage} from "./pages/ClientCatalogPage.tsx";
import {ClientServiceDetailsPage} from "./pages/ClientServiceDetailsPage.tsx";
import {ClientProfilePage} from "./pages/ClientProfilePage.tsx";
import {ClientRequestDetailsPage} from "./pages/ClientRequestDetailsPage.tsx";
import {ManagerLoyaltyProgramsPage} from "./pages/ManagerLoyaltyProgramsPage.tsx";
import {ManagerCreateDiscountPage} from "./pages/ManagerCreateDiscountPage.tsx";
import {ManagerDiscountDetailsPage} from "./pages/ManagerDiscountDetailsPage.tsx";
import {ManagerPromoCodeDetailsPage} from "./pages/ManagerPromoCodeDetailsPage.tsx";
import {ManagerCreatePromoCodePage} from "./pages/ManagerCreatePromoCodePage.tsx";
import {ManagerMastersPage} from "./pages/ManagerMastersPage.tsx";
import {ManagerMasterDetailsPage} from "./pages/ManagerMasterDetailsPage.tsx";
import {ManagerCreateMasterPage} from "./pages/ManagerCreateMasterPage.tsx";
import {ManagerClientsPage} from "./pages/ManagerClientsPage.tsx";
import {ManagerCreateClientPage} from "./pages/ManagerCreateClientPage.tsx";
import {ManagerClientDetailsPage} from "./pages/ManagerClientDetailsPage.tsx";
import {ManagerCreateRequestPage} from "./pages/ManagerCreateRequestPage.tsx";

function App() {

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LoginPage/>}/>
                <Route path="/register" element={<RegisterPage/>}/>

                <Route path="/manager/requests" element={<ManagerRequestsPage/>}/>
                <Route path="/manager/requests/create" element={<ManagerCreateRequestPage/>}/>
                <Route path="/manager/requests/:id" element={<ManagerRequestDetailsPage/>}/>

                <Route path="/manager/services" element={<ManagerServicesPage/>}/>
                <Route path="/manager/services/create" element={<ManagerCreateServicePage/>}/>
                <Route path="/manager/services/:id" element={<ManagersServiceDetailsPage/>}/>
                <Route path="/manager/dictionaries" element={<ManagerDictionariesPage/>}/>
                <Route path="/manager/statistics" element={<ManagerStatisticsPage/>}/>

                <Route path="/manager/loyaltyPrograms" element={<ManagerLoyaltyProgramsPage/>}/>
                <Route path="/manager/loyaltyPrograms/discount/create" element={<ManagerCreateDiscountPage/>}/>
                <Route path="/manager/loyaltyPrograms/discount/:id" element={<ManagerDiscountDetailsPage/>}/>
                <Route path="/manager/loyaltyPrograms/promo/create" element={<ManagerCreatePromoCodePage/>}/>
                <Route path="/manager/loyaltyPrograms/promo/:id" element={<ManagerPromoCodeDetailsPage/>}/>

                <Route path="/manager/masters" element={<ManagerMastersPage/>}/>
                <Route path="/manager/masters/create" element={<ManagerCreateMasterPage/>}/>
                <Route path="/manager/masters/:id" element={<ManagerMasterDetailsPage/>}/>

                <Route path="/manager/clients" element={<ManagerClientsPage/>}/>
                <Route path="/manager/clients/create" element={<ManagerCreateClientPage/>}/>
                <Route path="/manager/clients/:id" element={<ManagerClientDetailsPage/>}/>

                <Route path="/catalog" element={<ClientCatalogPage/>}/>
                <Route path="/catalog/:id" element={<ClientServiceDetailsPage/>}/>
                <Route path="/profile" element={<ClientProfilePage/>}/>
                <Route path="/profile/requests/:id" element={<ClientRequestDetailsPage/>}/>
            </Routes>
        </BrowserRouter>
    );
}

export default App
