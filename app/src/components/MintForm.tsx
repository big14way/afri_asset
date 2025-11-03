import { useState, type FormEvent, type ChangeEvent } from 'react';
import { useIPFS } from '../hooks/useIPFS';
import { useRWAContract } from '../hooks/useRWAContract';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

export const MintForm = () => {
  const { uploadFile, uploadMetadata } = useIPFS();
  const { mintRwa } = useRWAContract();
  const { isConnected, isLoading } = useStore();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    region: '',
    yieldEstimate: '',
    assetType: '',
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
      toast.loading('Uploading image to IPFS...');
      const imageHash = await uploadFile(imageFile);

      if (!imageHash) {
        throw new Error('Failed to upload image');
      }

      // Create metadata object
      const metadata = {
        name: formData.name,
        description: formData.description,
        image: `ipfs://${imageHash}`,
        yieldEstimate: Number(formData.yieldEstimate),
        region: formData.region,
        assetType: formData.assetType,
        createdAt: new Date().toISOString(),
      };

      // Upload metadata to IPFS
      toast.dismiss();
      toast.loading('Uploading metadata to IPFS...');
      const metadataHash = await uploadMetadata(metadata);

      if (!metadataHash) {
        throw new Error('Failed to upload metadata');
      }

      // Mint RWA token
      toast.dismiss();
      toast.loading('Minting RWA token...');
      const yieldData = Math.floor(Number(formData.yieldEstimate) * 10000000); // Convert to stroops
      await mintRwa(metadataHash, yieldData);

      toast.dismiss();

      // Reset form
      setFormData({
        name: '',
        description: '',
        region: '',
        yieldEstimate: '',
        assetType: '',
      });
      setImageFile(null);
      setImagePreview(null);
    } catch (error) {
      console.error('Error minting RWA:', error);
      toast.dismiss();
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
