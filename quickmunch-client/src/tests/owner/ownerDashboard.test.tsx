import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContext, type AuthContextValue } from '../../auth/AuthContext';
import { OwnerDashboardPage } from '../../pages/OwnerDashboardPage';
import { ImageUploadModal } from '../../components/food/ImageUploadModal';
import { restaurantsApi } from '../../api/restaurants';
import { validateImageFile, resolveImageUrl, formatFileSize } from '../../lib/imageUtils';
import type { RestaurantResponse, FoodItemResponse, CategoryResponse } from '../../api/types/restaurant';

// Mock restaurantsApi
vi.mock('../../api/restaurants', () => ({
  restaurantsApi: {
    getMyRestaurants: vi.fn(),
    getRestaurant: vi.fn(),
    createRestaurant: vi.fn(),
    updateRestaurant: vi.fn(),
    deleteRestaurant: vi.fn(),
    updateRestaurantStatus: vi.fn(),
    getCategories: vi.fn(),
    createCategory: vi.fn(),
    updateCategory: vi.fn(),
    deleteCategory: vi.fn(),
    getFoodItems: vi.fn(),
    getFoodItem: vi.fn(),
    createFoodItem: vi.fn(),
    updateFoodItem: vi.fn(),
    deleteFoodItem: vi.fn(),
    updateFoodAvailability: vi.fn(),
    getUploadUrl: vi.fn(),
    uploadFileToS3: vi.fn(),
  },
}));

const mockAuthValue: AuthContextValue = {
  isAuthenticated: true,
  isLoading: false,
  isLoggingOut: false,
  user: {
    id: 'owner-uuid-123',
    firstName: 'Marco',
    lastName: 'Pierre',
    email: 'marco@quickmunch.com',
  },
  roles: ['RESTAURANT_OWNER'],
  appRoles: ['RESTAURANT_OWNER'],
  activeRole: 'RESTAURANT_OWNER',
  selectRole: vi.fn(),
  clearActiveRole: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  getAccessToken: vi.fn().mockResolvedValue('test-token'),
  refreshProfile: vi.fn(),
  error: null,
};

const mockRestaurant: RestaurantResponse = {
  id: 101,
  ownerId: 'owner-uuid-123',
  name: 'Trattoria Bella',
  description: 'Handmade pasta & wood-fired pizza.',
  phoneNumber: '+1 555-0199',
  address: '42 Florence Way',
  imageUrl: 'restaurants/101/banner.jpg',
  isActive: true,
  isOpen: true,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const mockCategory: CategoryResponse = {
  id: 501,
  restaurantId: 101,
  name: 'Handmade Pasta',
  description: 'Fresh daily pasta',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const mockFoodItem: FoodItemResponse = {
  id: 1001,
  restaurantId: 101,
  categoryId: 501,
  caetegoryName: 'Handmade Pasta',
  name: 'Truffle Tagliolini',
  description: 'Shaved black truffle and butter emulsion',
  price: 24.5,
  imageUrl: 'restaurants/101/dish-1.jpg',
  isAvailable: true,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const renderOwnerDashboard = (authOverrides?: Partial<AuthContextValue>) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ ...mockAuthValue, ...authOverrides }}>
        <MemoryRouter initialEntries={['/owner/dashboard']}>
          <OwnerDashboardPage />
        </MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};

describe('Restaurant Owner Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:http://localhost/mock-blob-url');
    globalThis.URL.revokeObjectURL = vi.fn();
    vi.mocked(restaurantsApi.getMyRestaurants).mockResolvedValue([mockRestaurant]);
    vi.mocked(restaurantsApi.getCategories).mockResolvedValue([mockCategory]);
    vi.mocked(restaurantsApi.getFoodItems).mockResolvedValue([mockFoodItem]);
  });

  describe('1. Dashboard Navigation & Overview', () => {
    it('renders the kitchen command center headline and owner profile details', async () => {
      renderOwnerDashboard();

      expect(await screen.findByText('Kitchen Command Center')).toBeDefined();
      expect(screen.getAllByText(/Marco Pierre/)[0]).toBeDefined();
      const restaurantElements = await screen.findAllByText('Trattoria Bella');
      expect(restaurantElements[0]).toBeDefined();
      expect(screen.getByText(/42 Florence Way/)).toBeDefined();
    });

    it('displays empty state when owner has no registered restaurants', async () => {
      vi.mocked(restaurantsApi.getMyRestaurants).mockResolvedValue([]);
      renderOwnerDashboard();

      expect(await screen.findByText('Welcome to Your Kitchen Portal')).toBeDefined();
      expect(screen.getByText('Register Your First Restaurant')).toBeDefined();
    });

    it('navigates between Overview, My Restaurants, Menu Management, and Settings tabs', async () => {
      renderOwnerDashboard();

      await screen.findByText('Kitchen Command Center');

      // Click "My Restaurants" in sidebar
      const restaurantsTabBtn = screen.getByRole('button', { name: /My Restaurants/i });
      fireEvent.click(restaurantsTabBtn);
      expect(await screen.findByPlaceholderText(/Search by restaurant name/i)).toBeDefined();

      // Click "Menu Management" in sidebar
      const menuTabBtn = screen.getByRole('button', { name: /Menu Management/i });
      fireEvent.click(menuTabBtn);
      expect(await screen.findByText('Truffle Tagliolini')).toBeDefined();

      // Click "Settings & Profile"
      const settingsTabBtn = screen.getByRole('button', { name: /Settings & Profile/i });
      fireEvent.click(settingsTabBtn);
      expect(await screen.findByText('Settings & Operating Profile')).toBeDefined();
      expect(screen.getByText('System Health')).toBeDefined();
    });
  });

  describe('2. Restaurant Management & Status Toggling', () => {
    it('toggles kitchen open/closed status via PATCH /api/restaurants/{id}/status', async () => {
      vi.mocked(restaurantsApi.updateRestaurantStatus).mockResolvedValue({
        ...mockRestaurant,
        isOpen: false,
      });

      renderOwnerDashboard();
      await screen.findAllByText('Trattoria Bella');

      // Find the toggle button in the header or spotlight
      const openBtn = screen.getAllByText(/Open for Orders/i)[0];
      fireEvent.click(openBtn);

      await waitFor(() => {
        expect(restaurantsApi.updateRestaurantStatus).toHaveBeenCalledWith(101, false);
      });
    });

    it('opens create restaurant modal and submits data', async () => {
      vi.mocked(restaurantsApi.createRestaurant).mockResolvedValue({
        ...mockRestaurant,
        id: 102,
        name: 'Osteria del Sole',
      });

      renderOwnerDashboard();
      await screen.findByText('Kitchen Command Center');

      // Click "New Restaurant"
      const newBtn = screen.getByRole('button', { name: /New Restaurant/i });
      fireEvent.click(newBtn);

      // Verify modal is open
      expect(screen.getByText('Create New Restaurant')).toBeDefined();

      // Fill in form
      fireEvent.change(screen.getByPlaceholderText(/e\.g\. Hearth & Stone Kitchen/i), {
        target: { value: 'Osteria del Sole' },
      });
      fireEvent.change(screen.getByPlaceholderText(/e\.g\. \+1 \(555\) 234-5678/i), {
        target: { value: '+1 555-9876' },
      });
      fireEvent.change(screen.getByPlaceholderText(/e\.g\. 142 Artisan Row/i), {
        target: { value: '98 Vineyard Lane' },
      });

      // Submit
      const submitBtn = screen.getByRole('button', { name: 'Create Restaurant' });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(restaurantsApi.createRestaurant).toHaveBeenCalledWith({
          name: 'Osteria del Sole',
          phoneNumber: '+1 555-9876',
          address: '98 Vineyard Lane',
          description: undefined,
          imageUrl: undefined,
        });
      });
    });
  });

  describe('3. Menu & Food Item Management', () => {
    it('displays food items with price, category, and availability switch', async () => {
      renderOwnerDashboard();

      // Navigate to menu
      fireEvent.click(screen.getByRole('button', { name: /Menu Management/i }));

      expect(await screen.findByText('Truffle Tagliolini')).toBeDefined();
      expect(screen.getByText('$24.50')).toBeDefined();
      expect(screen.getByText('In Stock')).toBeDefined();
    });

    it('toggles food availability via PATCH /api/restaurants/{id}/foods/{foodId}/availability', async () => {
      vi.mocked(restaurantsApi.updateFoodAvailability).mockResolvedValue({
        ...mockFoodItem,
        isAvailable: false,
      });

      renderOwnerDashboard();
      fireEvent.click(screen.getByRole('button', { name: /Menu Management/i }));
      await screen.findByText('Truffle Tagliolini');

      const stockBtn = screen.getByRole('button', { name: /In Stock/i });
      fireEvent.click(stockBtn);

      await waitFor(() => {
        expect(restaurantsApi.updateFoodAvailability).toHaveBeenCalledWith(101, 1001, false);
      });
    });
  });

  describe('4. S3 Image Upload Workflow & Utilities', () => {
    it('validates supported image formats (JPEG, PNG, WebP) and 5MB size limits', () => {
      const validJpg = new File(['test'], 'dish.jpg', { type: 'image/jpeg' });
      expect(validateImageFile(validJpg).valid).toBe(true);

      const validPng = new File(['test'], 'dish.png', { type: 'image/png' });
      expect(validateImageFile(validPng).valid).toBe(true);

      const validWebp = new File(['test'], 'dish.webp', { type: 'image/webp' });
      expect(validateImageFile(validWebp).valid).toBe(true);

      const invalidGif = new File(['test'], 'dish.gif', { type: 'image/gif' });
      expect(validateImageFile(invalidGif).valid).toBe(false);
      expect(validateImageFile(invalidGif).error).toContain('Unsupported image format');

      const oversizedFile = new File(['x'.repeat(6 * 1024 * 1024)], 'big.jpg', {
        type: 'image/jpeg',
      });
      // simulate 6MB
      Object.defineProperty(oversizedFile, 'size', { value: 6 * 1024 * 1024 });
      expect(validateImageFile(oversizedFile).valid).toBe(false);
      expect(validateImageFile(oversizedFile).error).toContain('File is too large');
    });

    it('resolves S3 object keys to URLs and preserves web URLs', () => {
      expect(resolveImageUrl('https://example.com/photo.jpg')).toBe(
        'https://example.com/photo.jpg',
      );
      expect(resolveImageUrl('restaurants/101/banner.jpg')).toBe(
        '/restaurants/101/banner.jpg',
      );
      expect(resolveImageUrl(null)).toContain('unsplash');
    });

    it('formats file sizes accurately', () => {
      expect(formatFileSize(500)).toBe('500 B');
      expect(formatFileSize(2048)).toBe('2.0 KB');
      expect(formatFileSize(2.5 * 1024 * 1024)).toBe('2.50 MB');
    });

    it('triggers native file picker on Browse Files click and renders preview on change', async () => {
      const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click');

      const { container } = render(
        <ImageUploadModal
          isOpen={true}
          onClose={vi.fn()}
          restaurantId={101}
          onSuccess={vi.fn()}
        />,
      );

      // Verify Browse Files button is visible
      const browseBtn = screen.getByRole('button', { name: /Browse Files/i });
      expect(browseBtn).toBeDefined();

      fireEvent.click(browseBtn);
      expect(clickSpy).toHaveBeenCalled();

      // Find standard hidden input
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      expect(fileInput).not.toBeNull();
      expect(fileInput.accept).toBe('image/jpeg,image/png,image/webp');
      expect(fileInput.multiple).toBe(false);

      // Select valid image file
      const validFile = new File(['valid-image-content'], 'artisanal-pizza.png', {
        type: 'image/png',
      });
      fireEvent.change(fileInput, { target: { files: [validFile] } });

      // Preview, file details, and action buttons appear
      expect(await screen.findByText('artisanal-pizza.png')).toBeDefined();
      expect(screen.getByText('Choose Image')).toBeDefined();
      expect(screen.getByRole('button', { name: 'Upload Image' })).toBeDefined();

      clickSpy.mockRestore();
    });

    it('allows replacing or removing selected image and cleans up preview object URLs', async () => {
      const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click');

      const { container } = render(
        <ImageUploadModal
          isOpen={true}
          onClose={vi.fn()}
          restaurantId={101}
          onSuccess={vi.fn()}
        />,
      );

      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      const file1 = new File(['file1-bytes'], 'first.jpg', { type: 'image/jpeg' });
      fireEvent.change(fileInput, { target: { files: [file1] } });

      expect(await screen.findByText('first.jpg')).toBeDefined();

      // Click "Choose Image" to replace
      const chooseAnotherBtn = screen.getByText('Choose Image');
      fireEvent.click(chooseAnotherBtn);
      expect(clickSpy).toHaveBeenCalled();

      // Select second file
      const file2 = new File(['file2-bytes'], 'second.webp', { type: 'image/webp' });
      fireEvent.change(fileInput, { target: { files: [file2] } });

      expect(await screen.findByText('second.webp')).toBeDefined();
      expect(globalThis.URL.revokeObjectURL).toHaveBeenCalled();

      // Click "Remove"
      const removeBtn = screen.getByText('Remove');
      fireEvent.click(removeBtn);

      expect(screen.queryByText('second.webp')).toBeNull();
      expect(screen.getByText(/Click to browse or drag and drop image here/i)).toBeDefined();

      clickSpy.mockRestore();
    });

    it('rejects unsupported image types selected via native file picker with clear error', async () => {
      const { container } = render(
        <ImageUploadModal
          isOpen={true}
          onClose={vi.fn()}
          restaurantId={101}
          onSuccess={vi.fn()}
        />,
      );

      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      const invalidSvg = new File(['<svg></svg>'], 'logo.svg', { type: 'image/svg+xml' });

      fireEvent.change(fileInput, { target: { files: [invalidSvg] } });

      expect(await screen.findByText(/Unsupported image format/i)).toBeDefined();
      expect(screen.queryByRole('button', { name: 'Upload Image' })).toBeNull();
    });

    it('rejects oversized files (>5MB) selected via native file picker with clear error', async () => {
      const { container } = render(
        <ImageUploadModal
          isOpen={true}
          onClose={vi.fn()}
          restaurantId={101}
          onSuccess={vi.fn()}
        />,
      );

      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      const oversized = new File(['fake-huge-content'], 'giant.jpg', { type: 'image/jpeg' });
      Object.defineProperty(oversized, 'size', { value: 7 * 1024 * 1024 });

      fireEvent.change(fileInput, { target: { files: [oversized] } });

      expect(await screen.findByText(/File is too large/i)).toBeDefined();
      expect(screen.queryByRole('button', { name: 'Upload Image' })).toBeNull();
    });

    it('executes direct S3 presigned upload without Keycloak headers in ImageUploadModal', async () => {
      const mockOnSuccess = vi.fn();
      vi.mocked(restaurantsApi.getUploadUrl).mockResolvedValue({
        uploadUrl: 'https://s3.ap-south-1.amazonaws.com/quickmunch-assets-prod/restaurants/101/test.jpg?sig=xyz',
        objectKey: 'restaurants/101/test.jpg',
      });
      vi.mocked(restaurantsApi.uploadFileToS3).mockResolvedValue();

      render(
        <ImageUploadModal
          isOpen={true}
          onClose={vi.fn()}
          restaurantId={101}
          onSuccess={mockOnSuccess}
        />,
      );

      expect(screen.getByText('Upload Image')).toBeDefined();

      // Trigger file selection via drop
      const file = new File(['fake-image-bytes'], 'banner.jpg', { type: 'image/jpeg' });
      const dropzone = screen.getByText(/Click to browse or drag and drop image here/i);

      // Simulate drop
      fireEvent.drop(dropzone.parentElement!.parentElement!, {
        dataTransfer: { files: [file] },
      });

      // Now "Upload Image" button appears
      const uploadBtn = await screen.findByRole('button', { name: 'Upload Image' });
      fireEvent.click(uploadBtn);

      await waitFor(() => {
        expect(restaurantsApi.getUploadUrl).toHaveBeenCalledWith(101, 'banner.jpg', 'image/jpeg');
        expect(restaurantsApi.uploadFileToS3).toHaveBeenCalledWith(
          'https://s3.ap-south-1.amazonaws.com/quickmunch-assets-prod/restaurants/101/test.jpg?sig=xyz',
          file,
          expect.any(Function),
        );
        expect(mockOnSuccess).toHaveBeenCalledWith('restaurants/101/test.jpg');
      });
    });

    it('embeds NativeImagePicker inside RestaurantModal without asking for URL', async () => {
      renderOwnerDashboard();
      await screen.findByText('Kitchen Command Center');

      const newBtn = screen.getByRole('button', { name: /New Restaurant/i });
      fireEvent.click(newBtn);

      // Verify NativeImagePicker is rendered instead of a URL text input
      expect(screen.getByText('Restaurant Banner Image')).toBeDefined();
      expect(screen.getByText('Click to select image from your device')).toBeDefined();
      expect(screen.queryByPlaceholderText(/Image URL or S3 object key/i)).toBeNull();

      // Trigger file selection via hidden input
      const fileInput = document.querySelector('input#restaurant-banner-image-picker') as HTMLInputElement;
      expect(fileInput).not.toBeNull();
      expect(fileInput.accept).toBe('image/jpeg,image/png,image/webp');

      const file = new File(['banner-bytes'], 'hearth-banner.jpg', { type: 'image/jpeg' });
      fireEvent.change(fileInput, { target: { files: [file] } });

      expect(await screen.findByText('hearth-banner.jpg')).toBeDefined();
      expect(screen.getByText('Choose Image')).toBeDefined();
      expect(screen.getByText('Remove')).toBeDefined();
    });

    it('embeds NativeImagePicker inside FoodItemModal and automatically uploads to S3 on selection', async () => {
      vi.mocked(restaurantsApi.getUploadUrl).mockResolvedValue({
        uploadUrl: 'https://s3.ap-south-1.amazonaws.com/quickmunch-assets-prod/restaurants/101/food.jpg?sig=xyz',
        objectKey: 'restaurants/101/food.jpg',
      });
      vi.mocked(restaurantsApi.uploadFileToS3).mockResolvedValue();

      renderOwnerDashboard();
      fireEvent.click(screen.getByRole('button', { name: /Menu Management/i }));
      await screen.findByText('Truffle Tagliolini');

      const addDishBtn = screen.getAllByRole('button', { name: /Add Dish/i })[0];
      fireEvent.click(addDishBtn);

      // Verify NativeImagePicker is rendered instead of URL text input
      expect(screen.getByText('Dish Presentation Photo')).toBeDefined();
      expect(screen.getByText('Click to select image from your device')).toBeDefined();
      expect(screen.queryByPlaceholderText(/Image URL or S3 object key/i)).toBeNull();

      const fileInput = document.querySelector('input#food-item-image-picker') as HTMLInputElement;
      expect(fileInput).not.toBeNull();

      const file = new File(['dish-bytes'], 'risotto.png', { type: 'image/png' });
      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(restaurantsApi.getUploadUrl).toHaveBeenCalledWith(101, 'risotto.png', 'image/png');
        expect(restaurantsApi.uploadFileToS3).toHaveBeenCalled();
      });

      expect(await screen.findByText('Image uploaded and linked')).toBeDefined();
    });
  });
});
