import ManagerHeader from "../components/ManagerHeader";
import {categoriesApi, type Category} from "../api/categoriesApi.ts";
import {type DeviceType, deviceTypesApi} from "../api/deviceTypesApi.ts";
import {type Manufacturer, manufacturersApi} from "../api/manufacturersApi.ts";
import {type DeviceModelDetails, deviceModelsApi} from "../api/deviceModelsApi.ts";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {SimpleDictionaryCard} from "../components/SimpleDictionaryCard.tsx";
import {ModelsDictionaryCard} from "../components/ModelDictionaryCard.tsx";
import '../styles/DictionaryPage.css';
import {EditDictionaryModal, type EditingItemState} from "../components/EditDictionaryWindow.tsx";
import {useApi} from "../hooks/useApi.ts";

export const ManagerDictionariesPage: React.FC = () => {
    // State
    const [categories, setCategories] = useState<Category[]>([]);
    const [types, setTypes] = useState<DeviceType[]>([]);
    const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
    const [models, setModels] = useState<DeviceModelDetails[]>([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<EditingItemState | null>(null);

    const token = localStorage.getItem("token") || "";
    const navigate = useNavigate();

    const [createCategory] = useApi(categoriesApi.CreateServiceCategory);
    const [updateCategory] = useApi(categoriesApi.UpdateServiceCategory);
    const [deleteCategory] = useApi(categoriesApi.DeleteServiceCategory);

    const [createType] = useApi(deviceTypesApi.CreateDeviceType);
    const [updateType] = useApi(deviceTypesApi.UpdateDeviceType);
    const [deleteType] = useApi(deviceTypesApi.DeleteDeviceType);

    const [createManufacturer] = useApi(manufacturersApi.CreateManufacturer);
    const [updateManufacturer] = useApi(manufacturersApi.UpdateManufacturer);
    const [deleteManufacturer] = useApi(manufacturersApi.DeleteManufacturer);

    const [createModel] = useApi(deviceModelsApi.CreateDeviceModel);
    const [updateModel] = useApi(deviceModelsApi.UpdateDeviceModel);
    const [deleteModel] = useApi(deviceModelsApi.DeleteDeviceModels);
    // Загрузка данных
    const loadDictionaries = async () => {
        const [cats, typs, manufs, mods] = await Promise.all([
            categoriesApi.getAllServiceCategories(token),
            deviceTypesApi.getAllDeviceTypes(token),
            manufacturersApi.getAllManufacturers(token),
            deviceModelsApi.getDeviceModels(token),
        ]);
        setCategories(cats);
        setTypes(typs);
        setManufacturers(manufs);
        setModels(mods);
    };
    const [loadData, {isLoading: areDictionariesLoading}] = useApi(loadDictionaries, false);

    useEffect(() => {
        if (!token) {
            navigate("/");
            return;
        }
        loadData();
    }, []);

    //---------------------------------------
    const handleAddCategory = async (name: string) => {
        const result = await createCategory(token, {name});
        if (result !== undefined) {
            const updated = await categoriesApi.getAllServiceCategories(token);
            setCategories(updated);
        }
    };
    const handleDeleteCategory = async (id: string) => {
        const result = await deleteCategory(token, {id});
        if (result !== undefined) {
            setCategories(prev => prev.filter(m => m.id !== id));
        }
    };

    //---------------------------------------
    const handleAddType = async (name: string) => {
        const result = await createType(token, {name});
        if (result !== undefined) {
            const updated = await deviceTypesApi.getAllDeviceTypes(token);
            setTypes(updated);
        }
    };
    const handleDeleteType = async (id: string) => {
        const result = await deleteType(token, {id});
        if (result !== undefined) {
            setTypes(prev => prev.filter(m => m.id !== id));
        }
    };

    //---------------------------------------
    const handleAddManufacturer = async (name: string) => {
        const result = await createManufacturer(token, {name});
        if (result !== undefined) {
            const updated = await manufacturersApi.getAllManufacturers(token);
            setManufacturers(updated);
        }
    };

    const handleDeleteManufacturer = async (id: string) => {
        const result = await deleteManufacturer(token, {id});
        if (result !== undefined) {
            setManufacturers(prev => prev.filter(m => m.id !== id));
        }
    };
    //---------------------------------------
    const handleAddModel = async (name: string, deviceTypeId: string, manufacturerId: string) => {
        const result = await createModel(token, {
            name, deviceTypeId, manufacturerId
        });
        if (result !== undefined) {
            const updated = await deviceModelsApi.getDeviceModels(token);
            setModels(updated);
        }
    };

    const handleDeleteModel = async (id: string) => {
        const result = await deleteModel(token, {id});
        if (result !== undefined) {
            setModels(prev => prev.filter(m => m.id !== id));
        }
    };
    const openEditCategory = (id: string, name: string) => {
        setEditingItem({type: 'category', data: {id, name}});
        setIsModalOpen(true);
    };
    const openEditType = (id: string, name: string) => {
        setEditingItem({type: 'type', data: {id, name}});
        setIsModalOpen(true);
    };
    const openEditManufacturer = (id: string, name: string) => {
        setEditingItem({type: 'manufacturer', data: {id, name}});
        setIsModalOpen(true);
    };
    const openEditModel = (id: string, name: string, deviceTypeId: string, manufacturerId: string) => {
        setEditingItem({type: 'model', data: {id, name, deviceTypeId, manufacturerId}});
        setIsModalOpen(true);
    };
    // --- СОХРАНЕНИЕ ИЗ МОДАЛКИ ---
    const handleSaveChanges = async (newData: any) => {
        if (!editingItem || !token) return;
        var updResult;
        switch (editingItem.type) {
            case 'category':
                updResult = await updateCategory(token, {id: newData.id, name: newData.name});
                if (updResult !== undefined)
                    setCategories(prev => prev.map(i => i.id === newData.id ? {...i, name: newData.name} : i));

                break;
            case 'type':
                updResult = await updateType(token, {id: newData.id, name: newData.name});
                if (updResult !== undefined)
                    setTypes(prev => prev.map(i => i.id === newData.id ? {...i, name: newData.name} : i));
                break;
            case 'manufacturer':
                updResult = await updateManufacturer(token, {id: newData.id, name: newData.name});
                if (updResult !== undefined)
                    setManufacturers(prev => prev.map(i => i.id === newData.id ? {...i, name: newData.name} : i));
                break;

            case 'model':
                updResult = await updateModel(token, {
                    id: newData.id,
                    name: newData.name,
                    deviceTypeId: newData.deviceTypeId,
                    manufacturerId: newData.manufacturerId
                });
                if (updResult !== undefined) {
                    const updatedModels = await deviceModelsApi.getDeviceModels(token);
                    setModels(updatedModels);
                }
                break;
        }
    };

    if (areDictionariesLoading) return <div>Загрузка справочников...</div>;

    return (
        <div>
            <ManagerHeader/>
            <div className="dictionaries-page-container">
                <h1 className="page-title">Справочники</h1>

                <div className="dictionaries-grid">
                    <SimpleDictionaryCard
                        title="Категории услуг"
                        items={categories}
                        onAdd={handleAddCategory}
                        onEdit={openEditCategory}
                        onDelete={handleDeleteCategory}
                    />
                    <SimpleDictionaryCard
                        title="Типы устройств"
                        items={types}
                        onAdd={handleAddType}
                        onEdit={openEditType}
                        onDelete={handleDeleteType}
                    />
                    <SimpleDictionaryCard
                        title="Производители"
                        items={manufacturers}
                        onAdd={handleAddManufacturer}
                        onEdit={openEditManufacturer}
                        onDelete={handleDeleteManufacturer}
                    />
                </div>

                <div style={{marginTop: '30px'}}>
                    <ModelsDictionaryCard
                        models={models}
                        types={types}
                        manufacturers={manufacturers}
                        onAdd={handleAddModel}
                        onEdit={openEditModel}
                        onDelete={handleDeleteModel}
                    />
                </div>
            </div>
            {editingItem && (
                <EditDictionaryModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveChanges}
                    title={editingItem.type === 'model' ? 'Редактирование модели' : 'Редактирование'}
                    mode={editingItem.type === 'model' ? 'model' : 'simple'}
                    initialData={editingItem.data}
                    types={types}
                    manufacturers={manufacturers}
                />
            )}
        </div>
    );
};