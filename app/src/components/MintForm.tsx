import { useState, type FormEvent, type ChangeEvent } from 'react';
import { useIPFS, type AssetAttributes } from '../hooks/useIPFS';
import { useRWAContract } from '../hooks/useRWAContract';
import { useStore } from '../store/useStore';
import { getIPFSGatewayUrl } from '../utils/ipfsHelpers';
import toast from 'react-hot-toast';

export const MintForm = () => {
  const { uploadFile, uploadMetadata, createMetadata, uploadProgress } = useIPFS();
  const { mintRwa } = useRWAContract();
  const { isConnected, isLoading } = useStore();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    region: '',
    yieldEstimate: '',
    assetType: '',
    country: '',
    state: '',
    city: '',
    certification: '',
    harvestDate: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isMinting, setIsMinting] = useState(false);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size must be less than 10MB');
        return;
      }

      setImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!imageFile) {
      toast.error('Please select an image');
      return;
    }

    setIsMinting(true);

    try {
      // Upload image to IPFS
      const imageHash = await uploadFile(imageFile);

      if (!imageHash) {
        throw new Error('Failed to upload image');
      }

      // Create additional attributes
      const additionalAttributes: Partial<AssetAttributes> = {};

      if (formData.country || formData.state || formData.city) {
        additionalAttributes.location = {
          country: formData.country,
          state: formData.state,
          city: formData.city,
        };
      }

      if (formData.certification) {
        additionalAttributes.certification = formData.certification;
      }

      if (formData.harvestDate) {
        additionalAttributes.harvestDate = formData.harvestDate;
      }

      // Create enhanced metadata with attributes
      const metadata = createMetadata(
        formData.name,
        formData.description,
        imageHash,
        Number(formData.yieldEstimate),
        formData.region,
        formData.assetType,
        additionalAttributes
      );

      // Upload metadata to IPFS
      const metadataHash = await uploadMetadata(metadata);

      if (!metadataHash) {
        throw new Error('Failed to upload metadata');
      }

      // Mint RWA token
      const loadingToast = toast.loading('Minting RWA token...');
      const yieldData = Math.floor(Number(formData.yieldEstimate) * 10000000); // Convert to stroops

      // Get IPFS gateway URL for image (using public gateway)
      const imageUrl = getIPFSGatewayUrl(imageHash);

      const result = await mintRwa(metadataHash, yieldData, {
        name: formData.name,
        description: formData.description,
        region: formData.region,
        imageUrl,
        yieldEstimate: Number(formData.yieldEstimate),
      });

      toast.dismiss(loadingToast);

      if (result?.success) {
        // Show success with transaction details
        const explorerUrl = `https://stellar.expert/explorer/testnet/tx/${result.txHash}`;

        toast.success(
          <div className="flex flex-col gap-2">
            <p className="font-semibold">🎉 RWA Token Minted Successfully!</p>
            {result.tokenId !== null && (
              <p className="text-sm">Token ID: #{result.tokenId}</p>
            )}
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:text-blue-600 underline"
            >
              View Transaction →
            </a>
          </div>,
          { duration: 8000 }
        );

        // Reset form
        setFormData({
          name: '',
          description: '',
          region: '',
          yieldEstimate: '',
          assetType: '',
          country: '',
          state: '',
          city: '',
          certification: '',
          harvestDate: '',
        });
        setImageFile(null);
        setImagePreview(null);
      }
    } catch (error) {
      console.error('Error minting RWA:', error);
      toast.error('Failed to mint RWA token');
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
      aria-label="Mint RWA Token Form"
    >
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Mint New RWA Token
      </h2>

      {/* Asset Name */}
      <div className="mb-4">
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Asset Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="e.g., Lagos Farm Cassava 2024"
          aria-required="true"
        />
      </div>

      {/* Description */}
      <div className="mb-4">
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          required
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Describe your asset..."
          aria-required="true"
        />
      </div>

      {/* Region and Asset Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label
            htmlFor="region"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Region *
          </label>
          <input
            type="text"
            id="region"
            name="region"
            value={formData.region}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="e.g., Lagos, Nigeria"
            aria-required="true"
          />
        </div>

        <div>
          <label
            htmlFor="assetType"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Asset Type *
          </label>
          <select
            id="assetType"
            name="assetType"
            value={formData.assetType}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            aria-required="true"
          >
            <option value="">Select type</option>
            <option value="agriculture">Agriculture</option>
            <option value="livestock">Livestock</option>
            <option value="property">Property</option>
            <option value="equipment">Equipment</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Yield Estimate */}
      <div className="mb-4">
        <label
          htmlFor="yieldEstimate"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Expected Yield (XLM) *
        </label>
        <input
          type="number"
          id="yieldEstimate"
          name="yieldEstimate"
          value={formData.yieldEstimate}
          onChange={handleInputChange}
          required
          min="0"
          step="0.01"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="e.g., 1000"
          aria-required="true"
        />
      </div>

      {/* Optional Advanced Fields */}
      <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Additional Details (Optional)
        </h3>

        {/* Location Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label
              htmlFor="country"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Country
            </label>
            <input
              type="text"
              id="country"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., Nigeria"
            />
          </div>

          <div>
            <label
              htmlFor="state"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              State/Province
            </label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., Lagos State"
            />
          </div>

          <div>
            <label
              htmlFor="city"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              City
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., Ikeja"
            />
          </div>
        </div>

        {/* Certification and Harvest Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="certification"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Certification
            </label>
            <input
              type="text"
              id="certification"
              name="certification"
              value={formData.certification}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., Organic, Fair Trade"
            />
          </div>

          <div>
            <label
              htmlFor="harvestDate"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Harvest Date
            </label>
            <input
              type="date"
              id="harvestDate"
              name="harvestDate"
              value={formData.harvestDate}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadProgress > 0 && (
        <div className="mb-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div
              className="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
            Uploading... {uploadProgress}%
          </p>
        </div>
      )}

      {/* Image Upload */}
      <div className="mb-6">
        <label
          htmlFor="image"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Asset Image *
        </label>
        <input
          type="file"
          id="image"
          accept="image/*"
          onChange={handleImageChange}
          required
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-900 dark:file:text-primary-300"
          aria-required="true"
        />
        {imagePreview && (
          <div className="mt-4">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-md"
            />
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isMinting || isLoading || !isConnected}
        className="w-full px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        aria-label="Mint RWA Token"
      >
        {isMinting ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Minting...
          </span>
        ) : (
          'Mint RWA Token'
        )}
      </button>
    </form>
  );
};
