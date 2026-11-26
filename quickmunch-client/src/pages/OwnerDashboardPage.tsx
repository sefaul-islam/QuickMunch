import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  useMyRestaurantsQuery,
  useCreateRestaurantMutation,
  useUpdateRestaurantMutation,
  useDeleteRestaurantMutation,
  useUpdateRestaurantStatusMutation,
  useCategoriesQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useFoodItemsQuery,
  useCreateFoodItemMutation,
  useUpdateFoodItemMutation,
  useDeleteFoodItemMutation,
  useUpdateFoodAvailabilityMutation,
} from '../hooks/queries/useRestaurantQueries';
import { OwnerSidebar, type OwnerTabType } from '../features/owner/components/OwnerSidebar';
import { OwnerHeader } from '../features/owner/components/OwnerHeader';
import { OverviewTab } from '../features/owner/tabs/OverviewTab';
import { RestaurantsTab } from '../features/owner/tabs/RestaurantsTab';
import { MenuManagementTab } from '../features/owner/tabs/MenuManagementTab';
import { SettingsTab } from '../features/owner/tabs/SettingsTab';
import { RestaurantModal } from '../features/owner/components/RestaurantModal';
import { FoodItemModal } from '../features/owner/components/FoodItemModal';
import { CategoryModal } from '../features/owner/components/CategoryModal';
import { ImageUploadModal } from '../components/food/ImageUploadModal';
import { FALLBACK_FOOD_IMAGE, FALLBACK_RESTAURANT_IMAGE } from '../lib/imageUtils';
import { restaurantsApi } from '../api/restaurants';
import type {
  RestaurantResponse,
  FoodItemResponse,
  CreateRestaurantRequest,
  UpdateRestaurantRequest,
  CreateFoodItemRequest,
  UpdateFoodItemRequest,
} from '../api/types/restaurant';

export const OwnerDashboardPage: React.FC = () => {
  // Navigation & Active State
  const [activeTab, setActiveTab] = useState<OwnerTabType>('overview');
  const [explicitSelectedRestaurantId, setExplicitSelectedRestaurantId] = useState<number | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3500);
  };

  // Queries
  const {
    data: restaurants = [],
    isLoading: isLoadingRestaurants,
    error: restaurantsError,
  } = useMyRestaurantsQuery();

  // Derive selected restaurant
  const selectedRestaurant =
    restaurants.find((r) => r.id === explicitSelectedRestaurantId) ||
    restaurants[0] ||
    null;

  const selectedRestaurantId = selectedRestaurant?.id ?? null;
  const setSelectedRestaurantId = setExplicitSelectedRestaurantId;

  const { data: categories = [] } = useCategoriesQuery(selectedRestaurant?.id);
  const {
    data: foodItems = [],
    isLoading: isLoadingFoods,
    error: foodsError,
  } = useFoodItemsQuery(selectedRestaurant?.id);

  // Mutations
  const createRestaurantMutation = useCreateRestaurantMutation();
  const updateRestaurantMutation = useUpdateRestaurantMutation();
  const deleteRestaurantMutation = useDeleteRestaurantMutation();
  const updateStatusMutation = useUpdateRestaurantStatusMutation();

  const createCategoryMutation = useCreateCategoryMutation(selectedRestaurant?.id);
  const deleteCategoryMutation = useDeleteCategoryMutation(selectedRestaurant?.id);

  const createFoodItemMutation = useCreateFoodItemMutation(selectedRestaurant?.id);
  const updateFoodItemMutation = useUpdateFoodItemMutation(selectedRestaurant?.id);
  const deleteFoodItemMutation = useDeleteFoodItemMutation(selectedRestaurant?.id);
  const updateFoodAvailabilityMutation = useUpdateFoodAvailabilityMutation(selectedRestaurant?.id);

  // Modal State
  const [isRestaurantModalOpen, setIsRestaurantModalOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<RestaurantResponse | null>(null);

  const [isFoodItemModalOpen, setIsFoodItemModalOpen] = useState(false);
  const [editingFoodItem, setEditingFoodItem] = useState<FoodItemResponse | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // S3 Upload Dialog State
  const [imageUploadTarget, setImageUploadTarget] = useState<{
    type: 'restaurant' | 'food';
    restaurantId: number;
    targetId: number;
    currentImageUrl?: string | null;
  } | null>(null);

  // Handlers
  const handleToggleStatus = async (restaurantId: number, isOpen: boolean) => {
    try {
      await updateStatusMutation.mutateAsync({ id: restaurantId, isOpen });
      showToast(isOpen ? 'Kitchen is now Open for customer orders' : 'Kitchen closed');
    } catch {
      showToast('Failed to update kitchen status');
    }
  };

  const handleToggleFoodAvailability = async (foodId: number, isAvailable: boolean) => {
    try {
      await updateFoodAvailabilityMutation.mutateAsync({ foodId, isAvailable });
      showToast(isAvailable ? 'Dish marked as In Stock' : 'Dish marked as Sold Out');
    } catch {
      showToast('Failed to update dish availability');
    }
  };

  const handleSaveRestaurant = async (
    data: CreateRestaurantRequest | UpdateRestaurantRequest,
    file?: File,
  ) => {
    if (editingRestaurant) {
      await updateRestaurantMutation.mutateAsync({ id: editingRestaurant.id, data });
      showToast(`Updated ${data.name}`);
    } else {
      const created = await createRestaurantMutation.mutateAsync(data as CreateRestaurantRequest);
      if (file) {
        try {
          const presigned = await restaurantsApi.getUploadUrl(created.id, file.name, file.type);
          await restaurantsApi.uploadFileToS3(presigned.uploadUrl, file);
          await updateRestaurantMutation.mutateAsync({
            id: created.id,
            data: {
              name: created.name,
              phoneNumber: created.phoneNumber,
              address: created.address,
              description: created.description || undefined,
              imageUrl: presigned.objectKey,
            },
          });
        } catch (uploadErr) {
          console.error('Failed to upload banner for new restaurant', uploadErr);
        }
      }
      setSelectedRestaurantId(created.id);
      showToast(`Created ${created.name}`);
    }
  };

  const handleDeleteRestaurant = async (restaurantId: number) => {
    try {
      await deleteRestaurantMutation.mutateAsync(restaurantId);
      showToast('Restaurant deleted');
    } catch {
      showToast('Failed to delete restaurant');
    }
  };

  const handleSaveFoodItem = async (data: CreateFoodItemRequest | UpdateFoodItemRequest) => {
    if (!selectedRestaurant) return;

    if (editingFoodItem) {
      await updateFoodItemMutation.mutateAsync({ foodId: editingFoodItem.id, data });
      showToast(`Updated ${data.name}`);
    } else {
      await createFoodItemMutation.mutateAsync(data as CreateFoodItemRequest);
      showToast(`Added ${data.name} to menu`);
    }
  };

  const handleDeleteFoodItem = async (foodId: number) => {
    try {
      await deleteFoodItemMutation.mutateAsync(foodId);
      showToast('Dish removed from menu');
    } catch {
      showToast('Failed to delete dish');
    }
  };

  // S3 Image Upload Success Callback
  const handleImageUploaded = async (objectKey: string) => {
    if (!imageUploadTarget) return;

    try {
      if (imageUploadTarget.type === 'restaurant') {
        const targetRes = restaurants.find((r) => r.id === imageUploadTarget.targetId);
        if (targetRes) {
          await updateRestaurantMutation.mutateAsync({
            id: targetRes.id,
            data: {
              name: targetRes.name,
              phoneNumber: targetRes.phoneNumber,
              address: targetRes.address,
              description: targetRes.description || undefined,
              imageUrl: objectKey,
            },
          });
          showToast('Restaurant banner updated successfully');
        }
      } else if (imageUploadTarget.type === 'food') {
        const targetFood = foodItems.find((f) => f.id === imageUploadTarget.targetId);
        if (targetFood && selectedRestaurant) {
          await updateFoodItemMutation.mutateAsync({
            foodId: targetFood.id,
            data: {
              name: targetFood.name,
              price: targetFood.price,
              categoryId: targetFood.categoryId,
              description: targetFood.description || undefined,
              imageUrl: objectKey,
            },
          });
          showToast('Dish photo updated successfully');
        }
      }
    } catch {
      showToast('Image uploaded but failed to associate with item record');
    } finally {
      setImageUploadTarget(null);
    }
  };

  return (
    <div className="min-h-screen bg-cream text-charcoal font-sans flex flex-col">
      {/* SaaS Sidebar Navigation */}
      <OwnerSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        restaurantCount={restaurants.length}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main SaaS Layout Frame (Offset by sidebar on desktop) */}
      <div className="lg:pl-64 flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <OwnerHeader
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          restaurants={restaurants}
          selectedRestaurant={selectedRestaurant}
          onSelectRestaurant={(res) => setSelectedRestaurantId(res.id)}
          onToggleStatus={handleToggleStatus}
          isUpdatingStatus={updateStatusMutation.isPending}
          onOpenCreateRestaurant={() => {
            setEditingRestaurant(null);
            setIsRestaurantModalOpen(true);
          }}
          onOpenCreateFoodItem={() => {
            setEditingFoodItem(null);
            setIsFoodItemModalOpen(true);
          }}
        />

        {/* Tab Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'overview' && (
            <OverviewTab
              restaurants={restaurants}
              selectedRestaurant={selectedRestaurant}
              foodItems={foodItems}
              onSelectRestaurant={(res) => setSelectedRestaurantId(res.id)}
              onNavigateTab={setActiveTab}
              onOpenCreateRestaurant={() => {
                setEditingRestaurant(null);
                setIsRestaurantModalOpen(true);
              }}
              onOpenCreateFoodItem={() => {
                setEditingFoodItem(null);
                setIsFoodItemModalOpen(true);
              }}
              onOpenCategoryManager={() => setIsCategoryModalOpen(true)}
              onChangeImage={(res) =>
                setImageUploadTarget({
                  type: 'restaurant',
                  restaurantId: res.id,
                  targetId: res.id,
                  currentImageUrl: res.imageUrl,
                })
              }
              onToggleStatus={handleToggleStatus}
              isUpdatingStatus={updateStatusMutation.isPending}
            />
          )}

          {activeTab === 'restaurants' && (
            <RestaurantsTab
              restaurants={restaurants}
              isLoading={isLoadingRestaurants}
              error={restaurantsError}
              onOpenCreate={() => {
                setEditingRestaurant(null);
                setIsRestaurantModalOpen(true);
              }}
              onEdit={(res) => {
                setEditingRestaurant(res);
                setIsRestaurantModalOpen(true);
              }}
              onChangeImage={(res) =>
                setImageUploadTarget({
                  type: 'restaurant',
                  restaurantId: res.id,
                  targetId: res.id,
                  currentImageUrl: res.imageUrl,
                })
              }
              onDelete={handleDeleteRestaurant}
              onToggleStatus={handleToggleStatus}
              onManageMenu={(res) => {
                setSelectedRestaurantId(res.id);
                setActiveTab('menu');
              }}
              selectedRestaurantId={selectedRestaurantId}
              isUpdatingStatus={updateStatusMutation.isPending}
            />
          )}

          {activeTab === 'menu' && (
            <MenuManagementTab
              restaurants={restaurants}
              selectedRestaurant={selectedRestaurant}
              onSelectRestaurant={(res) => setSelectedRestaurantId(res.id)}
              categories={categories}
              foodItems={foodItems}
              isLoadingFoods={isLoadingFoods}
              foodsError={foodsError}
              onOpenCreateDish={() => {
                setEditingFoodItem(null);
                setIsFoodItemModalOpen(true);
              }}
              onEditDish={(food) => {
                setEditingFoodItem(food);
                setIsFoodItemModalOpen(true);
              }}
              onChangeDishImage={(food) => {
                if (!selectedRestaurant) return;
                setImageUploadTarget({
                  type: 'food',
                  restaurantId: selectedRestaurant.id,
                  targetId: food.id,
                  currentImageUrl: food.imageUrl,
                });
              }}
              onDeleteDish={handleDeleteFoodItem}
              onToggleAvailability={handleToggleFoodAvailability}
              onOpenCategoryManager={() => setIsCategoryModalOpen(true)}
              onOpenCreateRestaurant={() => {
                setEditingRestaurant(null);
                setIsRestaurantModalOpen(true);
              }}
              isUpdatingAvailability={updateFoodAvailabilityMutation.isPending}
            />
          )}

          {activeTab === 'settings' && <SettingsTab />}
        </main>
      </div>

      {/* Modals & Dialogs */}
      {/* 1. Restaurant Create / Edit Modal */}
      <RestaurantModal
        isOpen={isRestaurantModalOpen}
        onClose={() => {
          setIsRestaurantModalOpen(false);
          setEditingRestaurant(null);
        }}
        onSubmit={handleSaveRestaurant}
        initialData={editingRestaurant}
        isSubmitting={createRestaurantMutation.isPending || updateRestaurantMutation.isPending}
        onOpenImageUpload={(resId) => {
          setIsRestaurantModalOpen(false);
          setImageUploadTarget({
            type: 'restaurant',
            restaurantId: resId,
            targetId: resId,
            currentImageUrl: editingRestaurant?.imageUrl,
          });
        }}
      />

      {/* 2. Food Item Create / Edit Modal */}
      {selectedRestaurant && (
        <FoodItemModal
          isOpen={isFoodItemModalOpen}
          onClose={() => {
            setIsFoodItemModalOpen(false);
            setEditingFoodItem(null);
          }}
          restaurantId={selectedRestaurant.id}
          categories={categories}
          onSubmit={handleSaveFoodItem}
          initialData={editingFoodItem}
          isSubmitting={createFoodItemMutation.isPending || updateFoodItemMutation.isPending}
          onOpenCategoryManager={() => setIsCategoryModalOpen(true)}
          onOpenImageUpload={() => {
            if (editingFoodItem) {
              setIsFoodItemModalOpen(false);
              setImageUploadTarget({
                type: 'food',
                restaurantId: selectedRestaurant.id,
                targetId: editingFoodItem.id,
                currentImageUrl: editingFoodItem.imageUrl,
              });
            } else {
              showToast('Save the dish first to upload its photo directly to S3');
            }
          }}
        />
      )}

      {/* 3. Category Manager Modal */}
      {selectedRestaurant && (
        <CategoryModal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          restaurantId={selectedRestaurant.id}
          restaurantName={selectedRestaurant.name}
          categories={categories}
          onCreateCategory={async (data) => {
            await createCategoryMutation.mutateAsync(data);
            showToast(`Category "${data.name}" added`);
          }}
          onDeleteCategory={async (catId) => {
            await deleteCategoryMutation.mutateAsync(catId);
            showToast('Category deleted');
          }}
          isCreating={createCategoryMutation.isPending}
        />
      )}

      {/* 4. S3 Presigned URL Direct Upload Modal */}
      {imageUploadTarget && (
        <ImageUploadModal
          isOpen={!!imageUploadTarget}
          onClose={() => setImageUploadTarget(null)}
          restaurantId={imageUploadTarget.restaurantId}
          title={
            imageUploadTarget.type === 'restaurant'
              ? 'Upload Restaurant Banner'
              : 'Upload Dish Photo'
          }
          description="Uploaded directly to AWS S3 storage via backend presigned upload URL."
          currentImageUrl={imageUploadTarget.currentImageUrl}
          fallbackImage={
            imageUploadTarget.type === 'food'
              ? FALLBACK_FOOD_IMAGE
              : FALLBACK_RESTAURANT_IMAGE
          }
          onSuccess={handleImageUploaded}
        />
      )}

      {/* Floating Action Toast Feedback */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-primary text-cream text-xs font-semibold rounded-xl shadow-editorial border border-primary-light/40"
          >
            <div className="w-5 h-5 rounded-full bg-cream text-primary flex items-center justify-center shrink-0">
              <Check size={12} strokeWidth={3} />
            </div>
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
